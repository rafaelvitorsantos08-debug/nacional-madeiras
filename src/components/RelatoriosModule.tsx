import React, { useState } from "react";
import {
  Printer,
  FileText,
  Plus,
  Trash2,
  Calendar,
  User,
  MapPin,
  ClipboardList,
} from "lucide-react";
import {
  CORES,
  DIMENSOES_PORTA,
  ENCHIMENTOS_PORTA,
  MODELOS_PORTA,
  LARGURAS_ADUELA,
  COMPRIMENTOS_ADUELA,
  FACE_ALIZAR,
  ABA_ALIZAR,
  ESPESSURA_ALIZAR,
  COMPRIMENTOS_ALIZAR,
  useLocalStorage,
} from "./EstoqueModule";

type ReportType = "portas" | "aduelas" | "alizares";

interface ReportHeader {
  data: string;
  responsavel: string;
  obra: string;
  observacoes: string;
}

export function RelatoriosModule() {
  const [reportType, setReportType] = useLocalStorage<ReportType>("nm_relatorio_tipo", "portas");
  const [header, setHeader] = useLocalStorage<ReportHeader>("nm_relatorio_header", {
    data: new Date().toISOString().split("T")[0],
    responsavel: "",
    obra: "",
    observacoes: "",
  });

  const [items, setItems] = useLocalStorage<any[]>("nm_relatorio_items", []);

  // Current item being added
  const [currentItem, setCurrentItem] = useLocalStorage<any>("nm_relatorio_current_item", { quantidade: 1 });

  const handleHeaderChange = (field: keyof ReportHeader, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (field: string, value: any) => {
    setCurrentItem((prev) => ({ ...prev, [field]: value }));
  };

  const activeColorList = CORES;

  const handleAddItem = () => {
    if (!currentItem.quantidade || currentItem.quantidade <= 0) {
      alert("A quantidade deve ser maior que zero.");
      return;
    }

    // Validate required fields based on type
    if (reportType === "portas") {
      if (
        !currentItem.cor ||
        !currentItem.dimensao ||
        !currentItem.enchimento ||
        !currentItem.modelo
      ) {
        alert("Preencha todos os campos da folha de porta.");
        return;
      }
    } else if (reportType === "aduelas") {
      if (
        !currentItem.cor ||
        !currentItem.largura ||
        !currentItem.comprimento
      ) {
        alert("Preencha todos os campos da aduela.");
        return;
      }
    } else if (reportType === "alizares") {
      if (
        !currentItem.cor ||
        !currentItem.face ||
        !currentItem.aba ||
        !currentItem.espessura ||
        !currentItem.comprimento
      ) {
        alert("Preencha todos os campos do alizar.");
        return;
      }
    }

    setItems([...items, { ...currentItem, id: Date.now() }]);
    setCurrentItem({ quantidade: 1 }); // reset
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative">
      <div className="p-4 bg-white border-b border-gray-200 print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-indigo-600" /> Relatórios
            Padronizados
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Preencha os campos para gerar um relatório de impressão.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 print:p-0 print:bg-white print:overflow-visible">
        {/* Formulário Não-Impresso */}
        <div className="max-w-5xl mx-auto space-y-6 print:hidden">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-gray-500" />
              Cabeçalho do Relatório
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Relatório
                </label>
                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value as ReportType);
                    setItems([]); // Clear items on type change
                    setCurrentItem({ quantidade: 1 });
                  }}
                  className="w-full rounded-md border-gray-300 bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="portas">Relatório de Folhas de Porta</option>
                  <option value="aduelas">Relatório de Aduelas</option>
                  <option value="alizares">Relatório de Alizares</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={header.data}
                    onChange={(e) => handleHeaderChange("data", e.target.value)}
                    className="w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nome"
                    value={header.responsavel}
                    onChange={(e) =>
                      handleHeaderChange("responsavel", e.target.value)
                    }
                    className="w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obra / Destino
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nome da Obra"
                    value={header.obra}
                    onChange={(e) => handleHeaderChange("obra", e.target.value)}
                    className="w-full pl-9 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="md:col-span-2 lg:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações Gerais
                </label>
                <input
                  type="text"
                  placeholder="Anotações adicionais (opcional)"
                  value={header.observacoes}
                  onChange={(e) =>
                    handleHeaderChange("observacoes", e.target.value)
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-transform: capitalize">
              Adicionar Itens ({reportType})
            </h3>

            <div className="flex flex-wrap items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="w-full sm:w-auto flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Cor / Acabamento
                </label>
                <select
                  value={currentItem.cor || ""}
                  onChange={(e) => handleItemChange("cor", e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                >
                  <option value="">Selecione</option>
                  {activeColorList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {reportType === "portas" && (
                <>
                  <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Dimensão
                    </label>
                    <select
                      value={currentItem.dimensao || ""}
                      onChange={(e) =>
                        handleItemChange("dimensao", e.target.value)
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    >
                      <option value="">Selecione</option>
                      {DIMENSOES_PORTA.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Enchimento
                    </label>
                    <select
                      value={currentItem.enchimento || ""}
                      onChange={(e) =>
                        handleItemChange("enchimento", e.target.value)
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    >
                      <option value="">Selecione</option>
                      {ENCHIMENTOS_PORTA.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Modelo
                    </label>
                    <select
                      value={currentItem.modelo || ""}
                      onChange={(e) =>
                        handleItemChange("modelo", e.target.value)
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    >
                      <option value="">Selecione</option>
                      {MODELOS_PORTA.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {reportType === "aduelas" && (
                <>
                  <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Largura
                    </label>
                    <select
                      value={currentItem.largura || ""}
                      onChange={(e) =>
                        handleItemChange("largura", e.target.value)
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    >
                      <option value="">Selecione</option>
                      {LARGURAS_ADUELA.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Comprimento
                    </label>
                    <select
                      value={currentItem.comprimento || ""}
                      onChange={(e) =>
                        handleItemChange("comprimento", e.target.value)
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    >
                      <option value="">Selecione</option>
                      {COMPRIMENTOS_ADUELA.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {reportType === "alizares" && (
                <>
                  <div className="w-full sm:w-auto flex-1 min-w-[80px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Face
                    </label>
                    <select
                      value={currentItem.face || ""}
                      onChange={(e) => handleItemChange("face", e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    >
                      <option value="">Selecione</option>
                      {FACE_ALIZAR.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto flex-1 min-w-[80px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Aba
                    </label>
                    <select
                      value={currentItem.aba || ""}
                      onChange={(e) => handleItemChange("aba", e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    >
                      <option value="">Selecione</option>
                      {ABA_ALIZAR.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto flex-1 min-w-[80px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Espessura
                    </label>
                    <select
                      value={currentItem.espessura || ""}
                      onChange={(e) =>
                        handleItemChange("espessura", e.target.value)
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    >
                      <option value="">Selecione</option>
                      {ESPESSURA_ALIZAR.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto flex-1 min-w-[100px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Comprimento
                    </label>
                    <select
                      value={currentItem.comprimento || ""}
                      onChange={(e) =>
                        handleItemChange("comprimento", e.target.value)
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    >
                      <option value="">Selecione</option>
                      {COMPRIMENTOS_ALIZAR.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="w-24">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Qtd.
                </label>
                <input
                  type="number"
                  min="1"
                  value={currentItem.quantidade}
                  onChange={(e) =>
                    handleItemChange("quantidade", parseInt(e.target.value))
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                />
              </div>

              <div className="w-full sm:w-auto sm:flex-none">
                <button
                  onClick={handleAddItem}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium rounded-md shadow-sm transition-colors flex items-center justify-center text-sm h-[34px]"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Incluir
                </button>
              </div>
            </div>

            {/* List of items */}
            {items.length > 0 && (
              <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Características
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qtd
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {reportType === "portas" && (
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">
                                {item.cor}
                              </span>
                              <span>
                                {item.dimensao} | {item.enchimento} |{" "}
                                {item.modelo}
                              </span>
                            </div>
                          )}
                          {reportType === "aduelas" && (
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">
                                {item.cor}
                              </span>
                              <span>
                                L: {item.largura}mm | C: {item.comprimento}mm
                              </span>
                            </div>
                          )}
                          {reportType === "alizares" && (
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">
                                {item.cor}
                              </span>
                              <span>
                                F: {item.face}mm | A: {item.aba}mm | E:{" "}
                                {item.espessura}mm | C: {item.comprimento}mm
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                          {item.quantidade}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-2 text-right text-sm font-bold text-gray-900 uppercase"
                      >
                        Total de Peças:
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-indigo-700 font-bold text-right">
                        {items.reduce(
                          (sum, item) => sum + (item.quantidade || 0),
                          0,
                        )}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-400 mt-4 border-2 border-dashed border-gray-200 rounded-lg">
                <p>Nenhum item adicionado ao relatório ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Relatório Impresso (Apenas visível via CSS de Print) */}
        <div className="hidden print:block w-full text-black font-sans bg-white p-8">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tight">
                Relatório de {reportType}
              </h1>
              <p className="text-sm mt-1">
                Documento Gerado Via Sistema - Nacional Madeiras
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">
                Data:{" "}
                <span className="font-normal">
                  {new Date(header.data).toLocaleDateString("pt-BR")}
                </span>
              </p>
              <p className="font-bold">
                Hora:{" "}
                <span className="font-normal">
                  {new Date().toLocaleTimeString("pt-BR")}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-gray-300 p-3">
              <p className="text-xs uppercase text-gray-600 font-bold mb-1">
                Responsável
              </p>
              <p className="font-medium text-lg">
                {header.responsavel || "Não informado"}
              </p>
            </div>
            <div className="border border-gray-300 p-3">
              <p className="text-xs uppercase text-gray-600 font-bold mb-1">
                Obra / Destino
              </p>
              <p className="font-medium text-lg">
                {header.obra || "Não informado"}
              </p>
            </div>
            {header.observacoes && (
              <div className="border border-gray-300 p-3 col-span-2">
                <p className="text-xs uppercase text-gray-600 font-bold mb-1">
                  Observações
                </p>
                <p className="font-medium">{header.observacoes}</p>
              </div>
            )}
          </div>

          <table className="w-full border-collapse border border-black text-left mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 w-12 text-center">
                  Item
                </th>
                <th className="border border-black p-2">Cor/Acabamento</th>
                <th className="border border-black p-2">
                  Detalhes / Especificações
                </th>
                <th className="border border-black p-2 w-24 text-center">
                  Qtd
                </th>
                <th className="border border-black p-2 w-32 text-center">
                  Conferência
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-black">
                  <td className="border border-black p-2 text-center">
                    {idx + 1}
                  </td>
                  <td className="border border-black p-2 font-medium">
                    {item.cor}
                  </td>
                  <td className="border border-black p-2">
                    {reportType === "portas" && (
                      <>
                        {item.dimensao} - Enc: {item.enchimento} - Mod:{" "}
                        {item.modelo}
                      </>
                    )}
                    {reportType === "aduelas" && (
                      <>
                        Largura: <b>{item.largura}</b>mm - Comprimento:{" "}
                        <b>{item.comprimento}</b>mm
                      </>
                    )}
                    {reportType === "alizares" && (
                      <>
                        Face: <b>{item.face}</b>mm - Aba: <b>{item.aba}</b>mm -
                        Espessura: <b>{item.espessura}</b>mm - Comp:{" "}
                        <b>{item.comprimento}</b>mm
                      </>
                    )}
                  </td>
                  <td className="border border-black p-2 text-center font-bold text-lg">
                    {item.quantidade}
                  </td>
                  <td className="border border-black p-2"></td>{" "}
                  {/* Em branco para o usuário dar um 'visto' */}
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-black p-4 text-center italic text-gray-500"
                  >
                    Nenhum item inserido no relatório.
                  </td>
                </tr>
              )}
            </tbody>
            {items.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td
                    colSpan={3}
                    className="border border-black p-2 text-right uppercase"
                  >
                    Total Geral de Peças:
                  </td>
                  <td className="border border-black p-2 text-center text-xl">
                    {items.reduce(
                      (sum, item) => sum + (item.quantidade || 0),
                      0,
                    )}
                  </td>
                  <td className="border border-black p-2"></td>
                </tr>
              </tfoot>
            )}
          </table>

          <div className="mt-24 pt-8 grid grid-cols-2 gap-16">
            <div className="text-center">
              <div className="border-t border-black w-full mb-2"></div>
              <p className="uppercase text-sm font-bold">
                Assinatura do Responsável (Emissão)
              </p>
            </div>
            <div className="text-center">
              <div className="border-t border-black w-full mb-2"></div>
              <p className="uppercase text-sm font-bold">
                Assinatura do Recebedor (Conferência)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
