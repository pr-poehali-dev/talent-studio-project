import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface ColorOption {
  name: string;
  hex: string;
}

interface ColorMixWidgetProps {
  taskId: number;
  options: ColorOption[];
  correctAnswers: string[];
  onComplete: (taskId: number, answer: string) => void;
  isCompleted: boolean;
}

export default function ColorMixWidget({
  taskId,
  options,
  correctAnswers,
  onComplete,
  isCompleted,
}: ColorMixWidgetProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (isCompleted) return;
    if (selected.length > 0) {
      onComplete(taskId, selected.sort().join(","));
    }
  }, [selected]);

  const toggle = (name: string) => {
    if (isCompleted) return;
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Выберите нужные цвета:
      </p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.name);
          return (
            <button
              key={opt.name}
              type="button"
              onClick={() => toggle(opt.name)}
              disabled={isCompleted}
              className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${
                isSelected
                  ? "border-orange-500 bg-orange-50 shadow-sm"
                  : "border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50"
              } ${isCompleted ? "opacity-70 cursor-default" : "cursor-pointer"}`}
            >
              <span
                className="w-10 h-10 rounded-xl flex-shrink-0 shadow-inner border border-black/10"
                style={{ backgroundColor: opt.hex }}
              />
              <span
                className={`text-sm font-semibold ${
                  isSelected ? "text-orange-800" : "text-gray-700"
                }`}
              >
                {opt.name}
              </span>
              {isSelected && (
                <Icon
                  name="Check"
                  size={16}
                  className="text-orange-500 ml-auto flex-shrink-0"
                />
              )}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-orange-600 font-medium">
          Выбрано: {selected.join(", ")}
        </p>
      )}
    </div>
  );
}
