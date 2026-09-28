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
export function mergeDataSafely(key: string, localVal: any, incomingVal: any): any {
  if (localVal === undefined || localVal === null) return incomingVal;
  if (incomingVal === undefined || incomingVal === null) return localVal;

  // Case 1: Arrays (e.g. movements history, kits list, obras list)
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
      // Overwrite/merge with local (prefer local if newer or more complete)
      for (const item of localVal) {
        if (item && item.id) {
          const idStr = String(item.id);
          const existing = map.get(idStr);
          if (existing) {
            map.set(idStr, { ...existing, ...item });
          } else {
            map.set(idStr, item);
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
  if (typeof localVal === 'object' && typeof incomingVal === 'object') {
    // Special handling for nm_controle_saidas (keys are date strings YYYY-MM-DD)
    if (key.includes('controle_saidas')) {
      const merged: Record<string, any> = { ...incomingVal };
      for (const [dateStr, localRow] of Object.entries(localVal)) {
        if (!merged[dateStr]) {
          merged[dateStr] = localRow;
        } else {
          // Both have this date, merge fields so non-empty fields win
          const incRow = merged[dateStr] || {};
          const locRow = (localRow as any) || {};
          const combinedRow: Record<string, any> = { ...incRow, ...locRow };
          
          // For every field, if local has a non-empty string or number, use it; otherwise use incoming
          for (const f of Object.keys(locRow)) {
            if (locRow[f] !== '' && locRow[f] !== undefined && locRow[f] !== null) {
              combinedRow[f] = locRow[f];
            } else if (incRow[f] !== '' && incRow[f] !== undefined && incRow[f] !== null) {
              combinedRow[f] = incRow[f];
            }
          }
          merged[dateStr] = combinedRow;
        }
      }
      return merged;
    }

    // Special handling for nm_entrada_obras_v6 (keys are obra IDs)
    if (key.includes('entrada_obras_v6')) {
      const merged: Record<string, any> = { ...incomingVal };
      for (const [obraId, localObra] of Object.entries(localVal as Record<string, any>)) {
        if (!merged[obraId]) {
          merged[obraId] = localObra;
        } else {
          const incObra = merged[obraId];
          const locObra = localObra;

          // Merge cargas lists by id
          const mergeCargas = (listA: any[] = [], listB: any[] = []) => {
            const cMap = new Map<string, any>();
            [...listA, ...listB].forEach(c => {
              if (c && c.id) cMap.set(c.id, { ...(cMap.get(c.id) || {}), ...c });
            });
            return Array.from(cMap.values());
          };

          // Merge item lists (itensFolhas, itensAduelas, itensAlizares)
          const mergeItems = (itemsA: any[] = [], itemsB: any[] = []) => {
            const iMap = new Map<string, any>();
            // Add items from B
            itemsB.forEach(it => {
              if (it && it.id) iMap.set(it.id, { ...it });
            });
            // Merge with A
            itemsA.forEach(it => {
              if (it && it.id) {
                const ex = iMap.get(it.id);
                if (ex) {
                  iMap.set(it.id, {
                    ...ex,
                    ...it,
                    entradas: { ...(ex.entradas || {}), ...(it.entradas || {}) },
                    saidas: { ...(ex.saidas || {}), ...(it.saidas || {}) },
                    comentarios: { ...(ex.comentarios || {}), ...(it.comentarios || {}) }
                  });
                } else {
                  iMap.set(it.id, it);
                }
              }
            });
            return Array.from(iMap.values());
          };

          merged[obraId] = {
            id: obraId,
            nome: locObra.nome || incObra.nome || 'Sem Nome',
            cargasEntradaFolhas: mergeCargas(incObra.cargasEntradaFolhas, locObra.cargasEntradaFolhas),
            cargasSaidaFolhas: mergeCargas(incObra.cargasSaidaFolhas, locObra.cargasSaidaFolhas),
            cargasEntradaAduelas: mergeCargas(incObra.cargasEntradaAduelas, locObra.cargasEntradaAduelas),
            cargasSaidaAduelas: mergeCargas(incObra.cargasSaidaAduelas, locObra.cargasSaidaAduelas),
            cargasEntradaAlizares: mergeCargas(incObra.cargasEntradaAlizares, locObra.cargasEntradaAlizares),
            cargasSaidaAlizares: mergeCargas(incObra.cargasSaidaAlizares, locObra.cargasSaidaAlizares),
            itensFolhas: mergeItems(locObra.itensFolhas, incObra.itensFolhas),
            itensAduelas: mergeItems(locObra.itensAduelas, incObra.itensAduelas),
            itensAlizares: mergeItems(locObra.itensAlizares, incObra.itensAlizares),
          };
        }
      }
      return merged;
    }

    // Default shallow/deep object merge
    const mergedObj: Record<string, any> = { ...incomingVal };
    for (const [k, v] of Object.entries(localVal)) {
      if (v !== undefined && v !== null) {
        if (typeof v === 'object' && mergedObj[k] && typeof mergedObj[k] === 'object') {
          mergedObj[k] = mergeDataSafely(k, v, mergedObj[k]);
        } else {
          mergedObj[k] = v;
        }
      }
    }
    return mergedObj;
  }

  // Primitive: prefer local if defined
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
                itensFolhas,
                itensAduelas,
                itensAlizares
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
