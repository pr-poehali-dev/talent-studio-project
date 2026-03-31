import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const IndexOlympiadsSection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50 py-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <Icon name="Star" size={14} />
            Новый формат участия
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-800 mb-4">
            Интерактивные олимпиады
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Проверьте свои знания в области изобразительного и декоративно-прикладного искусства. Участвуйте онлайн и получайте дипломы.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate("/olympiad/palette")}
            className="group relative overflow-hidden rounded-3xl p-8 text-left shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg, #FBBF9A 0%, #F8A07A 100%)" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <div className="text-5xl mb-5">🎨</div>
              <div className="inline-flex items-center gap-1.5 bg-white/40 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                ИЗО
              </div>
              <h3 className="text-xl md:text-2xl font-heading font-bold text-orange-900 leading-snug mb-3">
                Всероссийская интерактивная олимпиада по ИЗО
              </h3>
              <p className="text-orange-800/80 text-base font-semibold mb-6">«Палитра талантов»</p>
              <div className="flex items-center gap-2 text-orange-800 font-semibold text-sm group-hover:gap-3 transition-all">
                Узнать подробнее
                <Icon name="ArrowRight" size={16} />
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/olympiad/grani")}
            className="group relative overflow-hidden rounded-3xl p-8 text-left shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            style={{ background: "linear-gradient(135deg, #A8D8C8 0%, #7EC8B0 100%)" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <div className="text-5xl mb-5">💎</div>
              <div className="inline-flex items-center gap-1.5 bg-white/40 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                ДПИ
              </div>
              <h3 className="text-xl md:text-2xl font-heading font-bold text-teal-900 leading-snug mb-3">
                Всероссийская интерактивная олимпиада по ДПИ
              </h3>
              <p className="text-teal-800/80 text-base font-semibold mb-6">«Грани мастерства»</p>
              <div className="flex items-center gap-2 text-teal-800 font-semibold text-sm group-hover:gap-3 transition-all">
                Узнать подробнее
                <Icon name="ArrowRight" size={16} />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndexOlympiadsSection;