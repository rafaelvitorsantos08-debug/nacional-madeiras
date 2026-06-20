import React, { useState, useRef, useEffect } from "react";
import {
  Printer,
  FileText,
  Plus,
  Trash2,
  Calendar,
  User,
  MapPin,
  ClipboardList,
  Upload,
  Image as ImageIcon,
  Download
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
import { AutoReportsViewer } from "./AutoReports";

const DrawingCanvas = ({ imageFile, onSave, onCancel }: { imageFile: File | null; onSave: (dataUrl: string) => void; onCancel: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#ef4444"); // default red
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!imageFile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(imageFile);
    img.src = objectUrl;

    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      let w = img.width;
      let h = img.height;

      if (w > maxWidth) {
        h = (h * maxWidth) / w;
        w = maxWidth;
      }
      if (h > maxHeight) {
        w = (w * maxHeight) / h;
        h = maxHeight;
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(objectUrl);
    };
  }, [imageFile]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (!imageFile) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(imageFile);
    img.src = objectUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
    };
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL("image/jpeg", 0.8));
    }
  };

  return (
    <div className="bg-white border text-left flex flex-col p-4 rounded-xl shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-800">Demarcação na Foto</h4>
        <div className="flex gap-2">
          {["#ef4444", "#eab308", "#3b82f6", "#22c55e", "#000000"].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${
                color === c ? "border-indigo-600 scale-110" : "border-gray-200"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="overflow-x-auto bg-gray-50 flex justify-center border rounded-lg cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="max-w-full h-auto bg-gray-100"
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={handleClear}
          className="px-4 py-2 border text-gray-600 rounded-md hover:bg-gray-100"
        >
          Limpar Marcações
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border text-red-600 rounded-md hover:bg-red-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
        >
          Confirmar e Salvar Imagem
        </button>
      </div>
    </div>
  );
};

type ReportType = "avarias" | "auto_aduelas" | "auto_usinagem_aduelas" | "auto_portas" | "auto_usinagem_portas" | "auto_vergas" | "auto_alizares" | "auto_montagem" | "auto_entrega";

export function getCategoriaComodo(comodo: string): string {
  const c = comodo.toUpperCase();
  if (['BANHEIRO', 'BANH. SOCIAL', 'BANH. SUITE'].includes(c)) return 'WC';
  if (['QUARTO', 'COZINHA', 'SUITE', 'SUITE 2'].includes(c)) return 'INTERNA';
  if (['ENTRADA'].includes(c)) return 'EXTERNA';
  if (['ELETRICA', 'ESPECIAIS', 'LIXEIRA'].includes(c)) return 'EXTERNA MEIO CILINDRO';
  return 'OUTROS';
}

export function isEspecialDobraOnly(folhaLargura: string, categoria: string): boolean {
  if (categoria !== 'EXTERNA MEIO CILINDRO') return false;
  const padroes = ["600", "620", "700", "720", "800", "820"];
  return !padroes.includes(folhaLargura);
}

const isAutoReport = (type: string) => type.startsWith("auto_");

interface ReportHeader {
  data: string;
  responsavel: string;
  obra: string;
  observacoes: string;
}

export function RelatoriosModule() {
  const [reportType, setReportType] = useLocalStorage<ReportType>("nm_active_relatorio_tipo", "auto_portas");
  const [header, setHeader] = useLocalStorage<ReportHeader>("nm_active_relatorio_header", {
    data: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split("T")[0],
    responsavel: "",
    obra: "",
    observacoes: "",
  });

  const [items, setItems] = useLocalStorage<any[]>("nm_active_relatorio_items", []);
  const [kits] = useLocalStorage<any[]>("nacional_madeiras_kits_v6", []);

  // Current item being added
  const [currentItem, setCurrentItem] = useLocalStorage<any>("nm_active_relatorio_current_item", { quantidade: 1 });
  const [isCustomCor, setIsCustomCor] = useState(false);
  const [avariaFile, setAvariaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHeaderChange = (field: keyof ReportHeader, value: string) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (field: string, value: any) => {
    setCurrentItem((prev) => ({ ...prev, [field]: value }));
  };

  const activeColorList = CORES;

  const handleCorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "Outra") {
      setIsCustomCor(true);
      handleItemChange("cor", "");
    } else {
      setIsCustomCor(false);
      handleItemChange("cor", e.target.value);
    }
  };

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

  const handleExport = () => {
    if (isAutoReport(reportType)) {
      alert("Para relatórios automáticos divididos por aberturas ou dinâmicos, por favor utilize a opção de Impressão para gerar um PDF.");
      return;
    }

    let content = `RELATÓRIO DE ${reportType.replace("auto_", "").replace(/_/g, " ").toUpperCase()}\n`;
    content += `Data: ${header.data ? header.data.split("-").reverse().join("/") : ""}\n`;
    content += `Responsável: ${header.responsavel}\n`;
    content += `Obra / Destino: ${header.obra}\n`;
    content += `Observações Gerais: ${header.observacoes || ""}\n\n`;

    if (items.length > 0) {
      if (reportType === "portas") {
        content += "Item;Cor;Dimensao;Enchimento;Modelo;Qtd\n";
        items.forEach((item, idx) => {
          content += `${idx + 1};${item.cor || ""};${item.dimensao || ""};${item.enchimento || ""};${item.modelo || ""};${item.quantidade}\n`;
        });
      } else if (reportType === "aduelas") {
        content += "Item;Cor;Largura;Comprimento;Qtd\n";
        items.forEach((item, idx) => {
          content += `${idx + 1};${item.cor || ""};${item.largura || ""};${item.comprimento || ""};${item.quantidade}\n`;
        });
      } else if (reportType === "alizares") {
        content += "Item;Cor;Face;Aba;Espessura;Comprimento;Qtd\n";
        items.forEach((item, idx) => {
          content += `${idx + 1};${item.cor || ""};${item.face || ""};${item.aba || ""};${item.espessura || ""};${item.comprimento || ""};${item.quantidade}\n`;
        });
      } else if (reportType === "avarias") {
        content += "Item;Descricao;Qtd\n";
        items.forEach((item, idx) => {
          const rawDesc = (item.descricao || "").replace(/;/g, ",").replace(/\n/g, " ");
          content += `${idx + 1};${rawDesc};${item.quantidade}\n`;
        });
      }
    } else {
      content += "Nenhum item adicionado.\n";
    }

    // Add BOM for Excel UTF-8 encoding support
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_${reportType}_${header.data}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden relative print:overflow-visible print:h-auto print:block">
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
            onClick={handleExport}
            className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium rounded-lg shadow-sm transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </button>
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
        {/* ALERTA */}
        <div className="max-w-5xl mx-auto mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded shadow-sm print:hidden">
          <div className="text-amber-800 text-sm font-medium whitespace-pre-wrap">
            ⚠️ <strong>Atenção:</strong> kits com montantes e kits camarão com quantidade de folhas ímpares, adicionar a abertura manualmente.
          </div>
        </div>

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
                  
                    <option value="auto_portas">Relatório de Folhas de Porta</option>
                    <option value="auto_aduelas">Relatório de Aduelas</option>
                    <option value="auto_alizares">Relatório de Alizares</option>
                    <option value="auto_usinagem_portas">Usinagem de Portas</option>
                    <option value="auto_usinagem_aduelas">Usinagem de Aduelas</option>
                    <option value="auto_vergas">Vergas de Aduelas</option>
                    <option value="auto_montagem">Relatório de Montagem</option>
                    <option value="auto_entrega">Relatório de Entrega</option>
                    <option value="avarias">Relatório de Avarias</option>
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
                <textarea
                  placeholder="Anotações adicionais (opcional)"
                  value={header.observacoes}
                  onChange={(e) =>
                    handleHeaderChange("observacoes", e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-transform: capitalize">
              {isAutoReport(reportType) ? `Relatório: ${reportType.replace("auto_", "").replace(/_/g, " ")}` : `Adicionar Itens (${reportType})`}
            </h3>

            {isAutoReport(reportType) && (
              <AutoReportsViewer kits={kits} reportType={reportType} responsavel={header.responsavel} obra={header.obra} />
            )}

            {reportType === "avarias" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Descrição / Comentário da Avaria</label>
                    <input 
                       type="text"
                       value={currentItem.descricao || ""}
                       onChange={(e) => handleItemChange("descricao", e.target.value)}
                       placeholder="Ex: Risco profundo na face inferior da porta"
                       className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-2"
                    />
                  </div>
                  {!avariaFile && (
                    <>
                      <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         ref={fileInputRef}
                         onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAvariaFile(e.target.files[0]);
                            }
                         }}
                      />
                      <button 
                         onClick={() => fileInputRef.current?.click()}
                         className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors font-medium rounded-md text-sm whitespace-nowrap self-end"
                      >
                         <ImageIcon className="w-4 h-4 mr-2" />
                         Adicionar Foto da Avaria
                      </button>
                    </>
                  )}
                </div>

                {avariaFile && (
                  <DrawingCanvas 
                    imageFile={avariaFile}
                    onSave={(dataUrl) => {
                       if (!currentItem.descricao) {
                           alert("Por favor, adicione uma descrição para a avaria.");
                           return;
                       }
                       setItems([...items, { ...currentItem, id: Date.now(), imagemBase64: dataUrl, quantidade: 1, descricao: currentItem.descricao }]);
                       setAvariaFile(null);
                       setCurrentItem({ quantidade: 1, descricao: "" });
                    }}
                    onCancel={() => setAvariaFile(null)}
                  />
                )}
              </div>
            )}

            {/* List of items */}
            {!isAutoReport(reportType) && items.length > 0 && (
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
                          {reportType === "avarias" && (
                            <div className="flex flex-col gap-1 py-1">
                               <p className="text-gray-800 italic">"{item.descricao}"</p>
                               {item.imagemBase64 && (
                                   <img src={item.imagemBase64} alt="Avaria" className="max-h-32 mt-1 rounded-lg border object-contain self-start" />
                               )}
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
                  {reportType !== "avarias" && (
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
                  )}
                </table>
              </div>
            )}

            {!isAutoReport(reportType) && items.length === 0 && (
              <div className="text-center py-8 text-gray-400 mt-4 border-2 border-dashed border-gray-200 rounded-lg">
                <p>Nenhum item adicionado ao relatório ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Relatório Impresso (Apenas visível via CSS de Print) */}
        <div className="hidden print:block w-full text-black font-sans bg-white pt-2">
          <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tight">
                Relatório de {reportType.replace("auto_", "").replace(/_/g, " ")}
              </h1>
              <p className="text-sm mt-1">
                Documento Gerado Via Sistema - Nacional Madeiras
              </p>
            </div>
          </div>

          {!reportType.includes("usinagem") && (
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
                    Observações Gerais
                  </p>
                  <p className="font-medium whitespace-pre-wrap">{header.observacoes}</p>
                </div>
              )}
            </div>
          )}

          {isAutoReport(reportType) ? (
            <div className="mb-8 print-auto-report">
              <AutoReportsViewer kits={kits} reportType={reportType} responsavel={header.responsavel} obra={header.obra} />
            </div>
          ) : (
            <table className="w-full border-collapse border border-black text-left mb-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 w-12 text-center">Item</th>
                  {reportType !== "avarias" && <th className="border border-black p-2">Cor/Acabamento</th>}
                  <th className="border border-black p-2">Detalhes / Especificações</th>
                  <th className="border border-black p-2 w-24 text-center">Qtd</th>
                  <th className="border border-black p-2 w-32 text-center">Conferência</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                    {reportType !== "avarias" && (
                      <td contentEditable suppressContentEditableWarning className="outline-none focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-500 transition-colors border border-black p-2 font-medium">{item.cor}</td>
                    )}
                    <td contentEditable suppressContentEditableWarning className="outline-none focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-500 transition-colors border border-black p-2">
                      {reportType === "portas" && (
                        <>{item.dimensao} - Enc: {item.enchimento} - Mod: {item.modelo}</>
                      )}
                      {reportType === "avarias" && (
                        <div className="flex flex-col items-start gap-1 py-1 max-w-[280px]">
                          <span className="italic text-base whitespace-normal break-words w-full border-l-[3px] border-gray-400 pl-2 text-gray-800">"{item.descricao}"</span>
                          {item.imagemBase64 && (
                             <img src={item.imagemBase64} alt="Avaria" className="max-h-[250px] w-auto border border-black mt-2" />
                          )}
                        </div>
                      )}
                      {reportType === "aduelas" && (
                        <>Largura: <b>{item.largura}</b>mm - Comprimento: <b>{item.comprimento}</b>mm</>
                      )}
                      {reportType === "alizares" && (
                        <>Face: <b>{item.face}</b>mm - Aba: <b>{item.aba}</b>mm - Espessura: <b>{item.espessura}</b>mm - Comp: <b>{item.comprimento}</b>mm</>
                      )}
                    </td>
                    <td contentEditable suppressContentEditableWarning className="outline-none focus:bg-emerald-50 focus:ring-1 focus:ring-emerald-500 transition-colors border border-black p-2 text-center font-bold text-lg">{item.quantidade}</td>
                    <td className="border border-black p-2"></td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={reportType === "avarias" ? 4 : 5} className="border border-black p-4 text-center italic text-gray-500">
                      Nenhum item inserido no relatório.
                    </td>
                  </tr>
                )}
              </tbody>
              {items.length > 0 && reportType !== "avarias" && (
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={3} className="border border-black p-2 text-right uppercase">Total Geral de Peças:</td>
                    <td className="border border-black p-2 text-center text-xl">
                      {items.reduce((sum, item) => sum + (item.quantidade || 0), 0)}
                    </td>
                    <td className="border border-black p-2"></td>
                  </tr>
                </tfoot>
              )}
            </table>
          )}


        </div>
      </div>
    </div>
  );
}
