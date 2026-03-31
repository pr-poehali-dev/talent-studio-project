import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function PaletteOlympiad() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-10 transition-colors"
        >
          <Icon name="ArrowLeft" size={18} />
          На главную
        </button>

        <div className="text-center py-20">
          <div className="text-7xl mb-6">🎨</div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-800 mb-4">
            Всероссийская интерактивная олимпиада по ИЗО
          </h1>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-orange-500 mb-8">
            «Палитра талантов»
          </h2>
          <p className="text-gray-500 text-lg">Страница находится в разработке. Скоро здесь появится вся информация об олимпиаде.</p>
        </div>
      </div>
    </div>
  );
}
