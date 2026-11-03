/**
 * Data Consistency & Recovery Engine
 * Ensures that entries, exits, and all records persist across page reloads (F5),
 * prevents cloud sync from wiping local data, and recovers records from backups/vault.
 */

export interface RecoveryResult {
  restoredKeys: string[];
  totalRestoredItems: number;
  details: string[];
}

/**
 * Safely merges two values (local and remote/backup) without data loss.
 */
export function mergeDataSafely(key: string, localVal: any, incomingVal: any, incomingIsAuthoritative: boolean = false): any {
  if (localVal === undefined || localVal === null) return incomingVal;
  if (incomingVal === undefined || incomingVal === null) return localVal;

  const isStockKey = key === 'nm_portas' || key === 'nm_aduelas' || key === 'nm_alizares' || key === 'nm_rodapes' ||
                     key.endsWith('portas') || key.endsWith('aduelas') || key.endsWith('alizares') || key.endsWith('rodapes');

  // Case 1: Stock collections (Folhas de Porta, Aduelas, Alizares, Rodapés)
  if (isStockKey && Array.isArray(incomingVal)) {
    if (!Array.isArray(localVal) || localVal.length === 0) {
      return incomingVal;
    }
    if (incomingVal.length === 0 && !incomingIsAuthoritative) {
      return localVal;
    }

    // Map of incoming cloud items
    const incMap = new Map<string, any>();
    for (const item of incomingVal) {
      if (item && item.id) {
        incMap.set(String(item.id), item);
      }
    }

    if (incomingIsAuthoritative) {
      // Remote snapshot from Firestore: this is the company-wide truth
      // Only keep local value if local was edited strictly more recently (uncommitted in-flight edit)
      for (const locItem of localVal) {
        if (locItem && locItem.id) {
          const idStr = String(locItem.id);
          const incItem = incMap.get(idStr);
          if (incItem) {
            const locTime = Number(locItem.updatedAt || 0);
            const incTime = Number(incItem.updatedAt || 0);
            if (locTime > incTime && locTime > 0) {
              incMap.set(idStr, locItem);
            }
          }
        }
      }
      return Array.from(incMap.values());
    } else {
      // Vault/backup fallback merge
      for (const locItem of localVal) {
        if (locItem && locItem.id) {
          const idStr = String(locItem.id);
          const incItem = incMap.get(idStr);
          if (incItem) {
            const locTime = Number(locItem.updatedAt || 0);
            const incTime = Number(incItem.updatedAt || 0);
            incMap.set(idStr, locTime >= incTime ? { ...incItem, ...locItem } : { ...locItem, ...incItem });
          } else {
            incMap.set(idStr, locItem);
          }
        }
      }
      return Array.from(incMap.values());
    }
  }

  // Case 2: General Arrays (e.g. movements history, kits list, obras list)
  if (Array.isArray(localVal) && Array.isArray(incomingVal)) {
    // If array items have 'id', merge and deduplicate by id
    const hasIds = localVal.some(i => i && typeof i === 'object' && i.id) || 
                   incomingVal.some(i => i && typeof i === 'object' && i.id);

    if (hasIds) {
      const map = new Map<string, any>();
      // First populate with incoming
      for (const item of incomingVal) {
        if (item && item.id) {
          map.set(String(item.id), item);
        } else {
          map.set(JSON.stringify(item), item);
        }
      }
      // Overwrite/merge with local
      for (const item of localVal) {
        if (item && item.id) {
          const idStr = String(item.id);
          const existing = map.get(idStr);
          if (existing) {
            const locTime = Number(item.updatedAt || 0);
            const incTime = Number(existing.updatedAt || 0);
            if (locTime > 0 && incTime > 0) {
              map.set(idStr, locTime >= incTime ? { ...existing, ...item } : { ...item, ...existing });
            } else if (incomingIsAuthoritative) {
              // Remote snapshot is authoritative over stale local
              map.set(idStr, { ...item, ...existing });
            } else {
              map.set(idStr, { ...existing, ...item });
            }
          } else {
            if (!incomingIsAuthoritative) {
              map.set(idStr, item);
            }
          }
        } else {
          map.set(JSON.stringify(item), item);
        }
      }
      return Array.from(map.values());
    } else {
      // Primitive arrays (e.g. string[] of obras names)
      return Array.from(new Set([...localVal, ...incomingVal]));
    }
  }

  // Case 2: Objects
  if (localVal && typeof localVal === 'object' && incomingVal && typeof incomingVal === 'object') {
    // Special handling for nm_controle_saidas (keys are date strings YYYY-MM-DD)
    if (key.includes('controle_saidas')) {
      const safeInc = (typeof incomingVal === 'object' && incomingVal !== null) ? incomingVal : {};
      const safeLoc = (typeof localVal === 'object' && localVal !== null) ? localVal : {};
      const merged: Record<string, any> = {};

      // 1. Copy all existing dates from localVal first to guarantee no date is ever lost
      for (const [dt, row] of Object.entries(safeLoc)) {
        if (row && typeof row === 'object' && !Array.isArray(row)) {
          merged[dt] = { ...row };
        }
      }

      // 2. Apply incoming dates (incoming has user edits / newest entries)
      for (const [dt, incRow] of Object.entries(safeInc)) {
        if (!incRow || typeof incRow !== 'object' || Array.isArray(incRow)) continue;

        if (!merged[dt]) {
          merged[dt] = { ...incRow };
        } else {
          // Merge field by field: incoming values update the cell, while existing untouched fields/comments are kept
          const existingRow = merged[dt];
          merged[dt] = {
            ...existingRow,
            ...incRow
          };
        }
      }
      return merged;
    }

    // Special handling for nm_operacao_producao (keys are date strings YYYY-MM-DD)
    if (key.includes('operacao_producao')) {
      const safeInc = (typeof incomingVal === 'object' && incomingVal !== null) ? incomingVal : {};
      const safeLoc = (typeof localVal === 'object' && localVal !== null) ? localVal : {};
      const merged: Record<string, any> = {};

      // 1. Copy all existing dates from localVal first
      for (const [dt, row] of Object.entries(safeLoc)) {
        if (row && typeof row === 'object' && !Array.isArray(row)) {
          merged[dt] = { ...row };
        }
      }

      // 2. Apply incoming dates (incoming has user edits / newest entries)
      for (const [dt, incRow] of Object.entries(safeInc)) {
        if (!incRow || typeof incRow !== 'object' || Array.isArray(incRow)) continue;

        if (!merged[dt]) {
          merged[dt] = { ...incRow };
        } else {
          const existingRow = merged[dt];
          merged[dt] = {
            ...existingRow,
            ...incRow
          };
        }
      }
      return merged;
    }

    // Special handling for nm_entrada_obras_v6 (keys are obra IDs)
    if (key.includes('entrada_obras_v6')) {
      const safeLoc = (typeof localVal === 'object' && localVal !== null) ? localVal : {};
      const safeInc = (typeof incomingVal === 'object' && incomingVal !== null) ? incomingVal : {};
      const merged: Record<string, any> = {};

      // 1. Copy all existing obras
      for (const [obraId, locObra] of Object.entries(safeLoc)) {
        if (locObra && typeof locObra === 'object') {
          merged[obraId] = { ...locObra };
        }
      }

      // 2. Merge incoming obras
      for (const [obraId, incObra] of Object.entries(safeInc)) {
        if (!incObra || typeof incObra !== 'object') continue;

        if (!merged[obraId]) {
          merged[obraId] = { ...incObra };
        } else {
          const exObra = (merged[obraId] || {}) as any;
          const inc = incObra as any;

          // Merge cargas lists by id (never delete existing cargas)
          const mergeCargas = (listA: any[] = [], listB: any[] = []) => {
            const cMap = new Map<string, any>();
            [...(Array.isArray(listA) ? listA : []), ...(Array.isArray(listB) ? listB : [])].forEach(c => {
              if (c && c.id) {
                const ex = cMap.get(String(c.id)) || {};
                cMap.set(String(c.id), {
                  ...ex,
                  ...c,
                  nome: c.nome || ex.nome || '',
                  data: c.data || ex.data || ''
                });
              }
            });
            return Array.from(cMap.values());
          };

          // Merge item lists: apply incoming changes while preserving all entries and existing non-empty items
          const mergeItems = (existingItems: any[] = [], incomingItems: any[] = []) => {
            const exMap = new Map<string, any>();
            (Array.isArray(existingItems) ? existingItems : []).forEach(it => {
              if (it && it.id) exMap.set(String(it.id), { ...it });
            });

            const mergedList: any[] = [];
            const seenIds = new Set<string>();

            // Process incoming items first (preserves user ordering and new items)
            (Array.isArray(incomingItems) ? incomingItems : []).forEach(it => {
              if (it && it.id) {
                const idStr = String(it.id);
                seenIds.add(idStr);
                const ex = exMap.get(idStr);
                if (ex) {
                  mergedList.push({
                    ...ex,
                    ...it,
                    entradas: { ...(ex.entradas || {}), ...(it.entradas || {}) },
                    saidas: { ...(ex.saidas || {}), ...(it.saidas || {}) },
                    comentarios: { ...(ex.comentarios || {}), ...(it.comentarios || {}) }
                  });
                } else {
                  mergedList.push({ ...it });
                }
              }
            });

            // Protect existing items with data if omitted in incoming
            for (const [idStr, exItem] of exMap.entries()) {
              if (!seenIds.has(idStr)) {
                const hasEntries = Object.values(exItem.entradas || {}).some(v => v !== '' && v !== undefined && v !== null);
                const hasSaidas = Object.values(exItem.saidas || {}).some(v => v !== '' && v !== undefined && v !== null);
                if (hasEntries || hasSaidas) {
                  mergedList.push(exItem);
                }
              }
            }

            return mergedList;
          };

          merged[obraId] = {
            ...exObra,
            ...inc,
            id: obraId,
            nome: inc.nome || exObra.nome || 'Sem Nome',
            cargasEntradaFolhas: mergeCargas(exObra.cargasEntradaFolhas, inc.cargasEntradaFolhas),
            cargasSaidaFolhas: mergeCargas(exObra.cargasSaidaFolhas, inc.cargasSaidaFolhas),
            cargasEntradaAduelas: mergeCargas(exObra.cargasEntradaAduelas, inc.cargasEntradaAduelas),
            cargasSaidaAduelas: mergeCargas(exObra.cargasSaidaAduelas, inc.cargasSaidaAduelas),
            cargasEntradaAlizares: mergeCargas(exObra.cargasEntradaAlizares, inc.cargasEntradaAlizares),
            cargasSaidaAlizares: mergeCargas(exObra.cargasSaidaAlizares, inc.cargasSaidaAlizares),
            cargasEntradaCorrer: mergeCargas(exObra.cargasEntradaCorrer, inc.cargasEntradaCorrer),
            cargasSaidaCorrer: mergeCargas(exObra.cargasSaidaCorrer, inc.cargasSaidaCorrer),
            itensFolhas: mergeItems(exObra.itensFolhas, inc.itensFolhas),
            itensAduelas: mergeItems(exObra.itensAduelas, inc.itensAduelas),
            itensAlizares: mergeItems(exObra.itensAlizares, inc.itensAlizares),
            itensCorrer: mergeItems(exObra.itensCorrer, inc.itensCorrer),
          };
        }
      }
      return merged;
    }

    if (incomingIsAuthoritative) {
      // Cloud/server truth is authoritative: preserve incomingVal, only preserving local keys if completely absent in incoming
      const mergedObj: Record<string, any> = { ...incomingVal };
      for (const [k, v] of Object.entries(localVal)) {
        if (mergedObj[k] === undefined && v !== undefined && v !== null) {
          mergedObj[k] = v;
        }
      }
      return mergedObj;
    }

    // Default shallow/deep object merge (for local vault backups)
    const mergedObj: Record<string, any> = { ...incomingVal };
    for (const [k, v] of Object.entries(localVal)) {
      if (v !== undefined && v !== null) {
        if (typeof v === 'object' && mergedObj[k] && typeof mergedObj[k] === 'object') {
          mergedObj[k] = mergeDataSafely(k, v, mergedObj[k], false);
        } else {
          mergedObj[k] = v;
        }
      }
    }
    return mergedObj;
  }

  // Primitive
  if (incomingIsAuthoritative) {
    return incomingVal !== undefined ? incomingVal : localVal;
  }
  return localVal !== undefined && localVal !== '' ? localVal : incomingVal;
}

/**
 * Restores all records made today across localStorage, backup keys, and safe vaults.
 * Guaranteed to bring back any lost entries or exits.
 */
export function restoreTodayAndConsistentRecords(): RecoveryResult {
  if (typeof window === 'undefined') {
    return { restoredKeys: [], totalRestoredItems: 0, details: [] };
  }

  const result: RecoveryResult = {
    restoredKeys: [],
    totalRestoredItems: 0,
    details: []
  };

  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayDisplay = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    // List of core keys that must be checked and protected
    const coreKeys = [
      'nm_controle_saidas',
      'nm_entrada_obras_v6',
      'nm_entrada_obras_v4',
      'nm_ferragens_history_v5',
      'nm_ferragens_obras_data_v5',
      'nm_ferragens_obras_list_v5',
      'nacional_madeiras_kits_v6',
      'nm_operacao_producao',
      'nm_operacao_efetivo_total',
      'nm_portas',
      'nm_aduelas',
      'nm_alizares',
      'nm_historico_entregas_v1'
    ];

    // 1. Recover nm_entrada_obras_v6 from all sources (current, backup, v4, vault)
    let currentV6: Record<string, any> = {};
    try {
      const raw = window.localStorage.getItem('nm_entrada_obras_v6');
      if (raw) currentV6 = JSON.parse(raw);
    } catch(e) {}

    // Check backups for v6
    const v6Candidates: any[] = [];
    ['nm_backup_nm_entrada_obras_v6', 'nm_safe_vault_nm_entrada_obras_v6'].forEach(bk => {
      try {
        const raw = window.localStorage.getItem(bk);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') v6Candidates.push(parsed);
        }
      } catch(e) {}
    });

    // Also check v4 in case items were logged there
    ['nm_entrada_obras_v4', 'nm_backup_nm_entrada_obras_v4', 'nm_safe_vault_nm_entrada_obras_v4'].forEach(bk => {
      try {
        const raw = window.localStorage.getItem(bk);
        if (raw) {
          const parsedV4 = JSON.parse(raw);
          if (parsedV4 && typeof parsedV4 === 'object' && Object.keys(parsedV4).length > 0) {
            // Convert v4 to v6 format candidate
            const converted: Record<string, any> = {};
            for (const obraId in parsedV4) {
              const o = parsedV4[obraId];
              const baseItems = o.itens || [];
              const itensFolhas = baseItems.filter((i:any) => i.folhas || i.dimensao).map((item:any) => {
                const sf = (item.saidas || []).filter((s:any) => s.tipo === 'folhas').reduce((acc:number, s:any) => acc + (parseInt(s.quantidade)||0), 0);
                return {
                  id: 'f_' + item.id,
                  dimensao: item.dimensao || '',
                  cor: item.cor || '',
                  enchimento: item.enchimento || '',
                  modelo: item.modelo || '',
                  entradas: { 'ce_f_1': item.folhas || '' },
                  saidas: { 'cs_f_1': sf > 0 ? String(sf) : '' },
                };
              });
              const itensAduelas = baseItems.filter((i:any) => i.aduelas || i.medidaAduela).map((item:any) => {
                const sad = (item.saidas || []).filter((s:any) => s.tipo === 'aduelas').reduce((acc:number, s:any) => acc + (parseInt(s.quantidade)||0), 0);
                return {
                  id: 'ad_' + item.id,
                  medidaAduela: item.medidaAduela || '',
                  cor: item.cor || '',
                  entradas: { 'ce_ad_1': item.aduelas || '' },
                  saidas: { 'cs_ad_1': sad > 0 ? String(sad) : '' },
                };
              });
              const itensAlizares = baseItems.filter((i:any) => i.alizares || i.medidaAlizar).map((item:any) => {
                const sal = (item.saidas || []).filter((s:any) => s.tipo === 'alizares').reduce((acc:number, s:any) => acc + (parseInt(s.quantidade)||0), 0);
                return {
                  id: 'al_' + item.id,
                  medidaAlizar: item.medidaAlizar || '',
                  cor: item.cor || '',
                  entradas: { 'ce_al_1': item.alizares || '' },
                  saidas: { 'cs_al_1': sal > 0 ? String(sal) : '' },
                };
              });

              converted[obraId] = {
                id: o.id || obraId,
                nome: o.nome,
                cargasEntradaFolhas: [{ id: 'ce_f_1', nome: '1ª Carga', data: todayStr }],
                cargasSaidaFolhas: [{ id: 'cs_f_1', nome: '1ª Saída', data: todayStr }],
                cargasEntradaAduelas: [{ id: 'ce_ad_1', nome: '1ª Carga', data: todayStr }],
                cargasSaidaAduelas: [{ id: 'cs_ad_1', nome: '1ª Saída', data: todayStr }],
                cargasEntradaAlizares: [{ id: 'ce_al_1', nome: '1ª Carga', data: todayStr }],
                cargasSaidaAlizares: [{ id: 'cs_al_1', nome: '1ª Saída', data: todayStr }],
                cargasEntradaCorrer: [{ id: 'ce_c_1', nome: '1ª Carga', data: todayStr }],
                cargasSaidaCorrer: [{ id: 'cs_c_1', nome: '1ª Saída', data: todayStr }],
                itensFolhas,
                itensAduelas,
                itensAlizares,
                itensCorrer: []
              };
            }
            v6Candidates.push(converted);
          }
        }
      } catch(e) {}
    });

    // Merge all candidates into currentV6
    let mergedV6 = currentV6;
    for (const cand of v6Candidates) {
      mergedV6 = mergeDataSafely('nm_entrada_obras_v6', mergedV6, cand);
    }

    if (Object.keys(mergedV6).length > Object.keys(currentV6).length || 
        JSON.stringify(mergedV6) !== JSON.stringify(currentV6)) {
      window.localStorage.setItem('nm_entrada_obras_v6', JSON.stringify(mergedV6));
      window.localStorage.setItem('nm_safe_vault_nm_entrada_obras_v6', JSON.stringify(mergedV6));
      result.restoredKeys.push('nm_entrada_obras_v6');
      result.details.push(`Entrada/Saída Obras: ${Object.keys(mergedV6).length} obras consolidadas com histórico completo`);
    }

    // 2. Recover nm_controle_saidas (Controle de Saídas diárias)
    let currentSaidas: Record<string, any> = {};
    try {
      const raw = window.localStorage.getItem('nm_controle_saidas');
      if (raw) currentSaidas = JSON.parse(raw);
    } catch(e) {}

    const saidasCandidates: any[] = [];
    ['nm_backup_nm_controle_saidas', 'nm_safe_vault_nm_controle_saidas'].forEach(bk => {
      try {
        const raw = window.localStorage.getItem(bk);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') saidasCandidates.push(parsed);
        }
      } catch(e) {}
    });

    let mergedSaidas = currentSaidas;
    for (const cand of saidasCandidates) {
      mergedSaidas = mergeDataSafely('nm_controle_saidas', mergedSaidas, cand);
    }

    if (JSON.stringify(mergedSaidas) !== JSON.stringify(currentSaidas)) {
      window.localStorage.setItem('nm_controle_saidas', JSON.stringify(mergedSaidas));
      window.localStorage.setItem('nm_safe_vault_nm_controle_saidas', JSON.stringify(mergedSaidas));
      result.restoredKeys.push('nm_controle_saidas');
      result.details.push(`Controle de Saídas: ${Object.keys(mergedSaidas).length} dias consolidados`);
    }

    // 3. Recover nm_ferragens_history_v5 (Entradas e Saídas de Ferragens)
    let currentFerragensHist: any[] = [];
    try {
      const raw = window.localStorage.getItem('nm_ferragens_history_v5');
      if (raw) currentFerragensHist = JSON.parse(raw);
    } catch(e) {}

    const ferragensHistCandidates: any[] = [];
    ['nm_backup_nm_ferragens_history_v5', 'nm_safe_vault_nm_ferragens_history_v5', 'nm_ferragens_history_v1'].forEach(bk => {
      try {
        const raw = window.localStorage.getItem(bk);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) ferragensHistCandidates.push(parsed);
        }
      } catch(e) {}
    });

    let mergedFerragensHist = currentFerragensHist;
    for (const cand of ferragensHistCandidates) {
      mergedFerragensHist = mergeDataSafely('nm_ferragens_history_v5', mergedFerragensHist, cand);
    }

    if (JSON.stringify(mergedFerragensHist) !== JSON.stringify(currentFerragensHist)) {
      window.localStorage.setItem('nm_ferragens_history_v5', JSON.stringify(mergedFerragensHist));
      window.localStorage.setItem('nm_safe_vault_nm_ferragens_history_v5', JSON.stringify(mergedFerragensHist));
      result.restoredKeys.push('nm_ferragens_history_v5');
      result.details.push(`Ferragens: ${mergedFerragensHist.length} movimentações restauradas`);
    }

    // 4. Safe Vault snapshot for all core keys
    coreKeys.forEach(k => {
      try {
        const val = window.localStorage.getItem(k);
        if (val && val !== '{}' && val !== '[]') {
          // Never overwrite a vault with empty
          window.localStorage.setItem('nm_safe_vault_' + k, val);
          window.localStorage.setItem('nm_backup_' + k, val);
        }
      } catch(e) {}
    });

    // 5. Save an immutable daily recovery snapshot for today
    const snapshotKey = `nm_journal_snapshot_${todayStr}`;
    const allDataSnapshot: Record<string, any> = {};
    coreKeys.forEach(k => {
      try {
        const raw = window.localStorage.getItem(k);
        if (raw) allDataSnapshot[k] = JSON.parse(raw);
      } catch(e) {}
    });
    window.localStorage.setItem(snapshotKey, JSON.stringify(allDataSnapshot));

    // Dispatch event to tell all listening React components to refresh their view
    window.dispatchEvent(new Event('local-storage-sync'));

  } catch (err) {
    console.error("Erro durante restauração e consistência de dados:", err);
  }

  return result;
}

/**
 * Safe auto-flush on page unload / refresh
 */
if (typeof window !== 'undefined') {
  // Run recovery once immediately on script load
  restoreTodayAndConsistentRecords();

  window.addEventListener('beforeunload', () => {
    // Preserve current state into safe vaults before reload
    const coreKeys = [
      'nm_controle_saidas',
      'nm_entrada_obras_v6',
      'nm_ferragens_history_v5',
      'nm_ferragens_obras_data_v5',
      'nacional_madeiras_kits_v6'
    ];
    coreKeys.forEach(k => {
      try {
        const val = window.localStorage.getItem(k);
        if (val && val !== '{}' && val !== '[]') {
          window.localStorage.setItem('nm_safe_vault_' + k, val);
          window.localStorage.setItem('nm_backup_' + k, val);
        }
      } catch(e) {}
    });
  });
}
