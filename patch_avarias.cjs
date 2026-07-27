const fs = require('fs');
let code = fs.readFileSync('src/components/RelatoriosModule.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  '  Image as ImageIcon,\n  Download\n} from "lucide-react";',
  '  Image as ImageIcon,\n  Download,\n  Pencil,\n  Square,\n  Circle\n} from "lucide-react";'
);

// 2. Replace DrawingCanvas state
const regexState = /const \[color, setColor\] = useState\("#ef4444"\); \/\/ default red\n  const \[isDrawing, setIsDrawing\] = useState\(false\);/;
const replacementState = `const [color, setColor] = useState("#ef4444"); // default red
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("freehand");
  const [lineWidth, setLineWidth] = useState(4);
  const snapshotRef = useRef(null);
  const startCoordsRef = useRef(null);`;
code = code.replace(regexState, replacementState);

// 3. Replace drawing logic
const regexLogic = /const startDrawing = \(e: React\.MouseEvent \| React\.TouchEvent\) => \{[\s\S]*?const stopDrawing = \(\) => \{\n    setIsDrawing\(false\);\n  \};/;
const replacementLogic = `const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (!coords) return;
    startCoordsRef.current = coords;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (tool === "freehand") {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(e);
    if (!coords || !startCoordsRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (tool === "freehand") {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      if (snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      const startX = startCoordsRef.current.x;
      const startY = startCoordsRef.current.y;
      const width = coords.x - startX;
      const height = coords.y - startY;

      ctx.beginPath();
      if (tool === "rect") {
        ctx.rect(startX, startY, width, height);
      } else if (tool === "circle") {
        ctx.ellipse(
          startX + width / 2, 
          startY + height / 2, 
          Math.abs(width / 2), 
          Math.abs(height / 2), 
          0, 0, 2 * Math.PI
        );
      }
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };`;
code = code.replace(regexLogic, replacementLogic);

// 4. Replace JSX controls
const regexJSX = /<div className="flex justify-between items-center mb-4">\n\s*<h4 className="font-semibold text-gray-800">Demarcação na Foto<\/h4>\n\s*<div className="flex gap-2">[\s\S]*?<\/div>\n\s*<\/div>/;
const replacementJSX = `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h4 className="font-semibold text-gray-800">Demarcação na Foto</h4>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 border-r pr-4">
             <button onClick={() => setTool('freehand')} className={\`p-1.5 rounded \${tool === 'freehand' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}\`} title="Livre"><Pencil className="w-4 h-4" /></button>
             <button onClick={() => setTool('rect')} className={\`p-1.5 rounded \${tool === 'rect' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}\`} title="Retângulo"><Square className="w-4 h-4" /></button>
             <button onClick={() => setTool('circle')} className={\`p-1.5 rounded \${tool === 'circle' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}\`} title="Redondo"><Circle className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center gap-2 border-r pr-4">
             <span className="text-xs text-gray-500 font-medium">Espessura:</span>
             <input type="range" min="1" max="10" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} className="w-20" />
          </div>
          <div className="flex gap-2">
            {["#ef4444", "#eab308", "#3b82f6", "#22c55e", "#000000"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={\`w-6 h-6 rounded-full border-2 \${
                  color === c ? "border-indigo-600 scale-110" : "border-gray-200"
                }\`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>`;
code = code.replace(regexJSX, replacementJSX);

fs.writeFileSync('src/components/RelatoriosModule.tsx', code);
