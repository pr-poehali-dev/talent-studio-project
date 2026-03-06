import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const COLORS = [
  "#E31E24", "#FF6B35", "#FFD700", "#4CAF50", "#2196F3",
  "#9C27B0", "#FF69B4", "#00BCD4", "#795548", "#FF9800",
  "#000000", "#FFFFFF", "#9E9E9E", "#F5F5F5", "#8BC34A",
  "#E91E63", "#3F51B5", "#009688", "#CDDC39", "#FFC107",
];

const CAT_IMAGE = "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/f25e0dc6-e608-45b0-a7f6-31277725305c.jpg";

export default function Coloring() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState("#FFD700");
  const [brushSize, setBrushSize] = useState(18);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const loadImage = useCallback(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = CAT_IMAGE;
    img.onload = () => {
      imageRef.current = img;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      const octx = overlay.getContext("2d");
      if (octx) {
        octx.clearRect(0, 0, overlay.width, overlay.height);
      }
      setImageLoaded(true);
    };
  }, []);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const overlay = overlayRef.current;
    if (!overlay) return { x: 0, y: 0 };
    const rect = overlay.getBoundingClientRect();
    const scaleX = overlay.width / rect.width;
    const scaleY = overlay.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing && e.type !== "mousedown" && e.type !== "touchstart") return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);

    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,1)" : selectedColor;
    ctx.globalAlpha = tool === "eraser" ? 1 : 0.85;
    ctx.fill();
  };

  const stopDraw = () => setIsDrawing(false);

  const handleReset = () => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, overlay.width, overlay.height);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const merged = document.createElement("canvas");
    merged.width = canvas.width;
    merged.height = canvas.height;
    const ctx = merged.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(canvas, 0, 0);
    ctx.drawImage(overlay, 0, 0);

    const link = document.createElement("a");
    link.download = "kot-van-gog.png";
    link.href = merged.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-3">
            🎨 Раскрась Кота Ван Гога!
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Используй кисть и цвета, чтобы оживить нашего любимого кота. Готовую раскраску можно скачать!
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Панель инструментов */}
          <div className="bg-white rounded-3xl shadow-lg p-5 flex flex-col gap-5 w-full lg:w-56 order-2 lg:order-1">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Цвета</p>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => { setSelectedColor(color); setTool("brush"); }}
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedColor === color && tool === "brush" ? "#E31E24" : "#e2e8f0",
                      transform: selectedColor === color && tool === "brush" ? "scale(1.2)" : undefined,
                      boxShadow: selectedColor === color && tool === "brush" ? "0 0 0 2px #E31E24" : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">Размер кисти</p>
              <input
                type="range"
                min={6}
                max={48}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Тонкая</span>
                <span>Толстая</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant={tool === "brush" ? "default" : "outline"}
                className="rounded-xl w-full"
                onClick={() => setTool("brush")}
              >
                <Icon name="Paintbrush" className="mr-2" size={16} />
                Кисть
              </Button>
              <Button
                variant={tool === "eraser" ? "default" : "outline"}
                className="rounded-xl w-full"
                onClick={() => setTool("eraser")}
              >
                <Icon name="Eraser" className="mr-2" size={16} />
                Ластик
              </Button>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" className="rounded-xl w-full" onClick={handleReset}>
                <Icon name="RotateCcw" className="mr-2" size={16} />
                Очистить
              </Button>
              <Button className="rounded-xl w-full bg-primary hover:bg-primary/90" onClick={handleDownload}>
                <Icon name="Download" className="mr-2" size={16} />
                Скачать
              </Button>
            </div>
          </div>

          {/* Холст */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white order-1 lg:order-2 flex-1"
            style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
          >
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                <Icon name="Loader2" className="animate-spin text-primary" size={40} />
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={700}
              height={700}
              className="w-full block"
            />
            <canvas
              ref={overlayRef}
              width={700}
              height={700}
              className="w-full block absolute top-0 left-0"
              onMouseDown={startDraw}
              onMouseMove={(e) => { if (isDrawing) draw(e); }}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={(e) => { if (isDrawing) draw(e); }}
              onTouchEnd={stopDraw}
            />
          </div>
        </div>

        {/* Текущий цвет */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div
            className="w-8 h-8 rounded-full border-2 border-slate-200 shadow"
            style={{ backgroundColor: tool === "eraser" ? "#fff" : selectedColor }}
          />
          <span className="text-slate-500 text-sm font-medium">
            {tool === "eraser" ? "Ластик активен" : "Выбранный цвет"}
          </span>
        </div>
      </div>
    </div>
  );
}
