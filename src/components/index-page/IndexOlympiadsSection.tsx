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

        <style>{`
          @keyframes floatUp {
            0% { transform: translateY(0px) scale(1); opacity: 0.15; }
            50% { transform: translateY(-18px) scale(1.08); opacity: 0.25; }
            100% { transform: translateY(0px) scale(1); opacity: 0.15; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(300%) skewX(-15deg); }
          }
          .olympiad-card-shimmer::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
            transform: translateX(-100%) skewX(-15deg);
            transition: none;
          }
          .olympiad-card-shimmer:hover::after {
            animation: shimmer 0.7s ease forwards;
          }
        `}</style>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Карточка ИЗО */}
          <button
            onClick={() => navigate("/olympiad/palette")}
            className="olympiad-card-shimmer group relative overflow-hidden rounded-3xl p-8 text-left shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #F97316 0%, #FB923C 40%, #FBBF24 100%)" }}
          >
            {/* Плавающие круги */}
            {[
              { w: 120, h: 120, top: "-20%", left: "-8%", delay: "0s", dur: "5s" },
              { w: 80,  h: 80,  top: "60%",  left: "75%", delay: "1.5s", dur: "6s" },
              { w: 55,  h: 55,  top: "10%",  left: "80%", delay: "0.8s", dur: "4.5s" },
              { w: 40,  h: 40,  top: "75%",  left: "15%", delay: "2s",   dur: "7s" },
            ].map((c, i) => (
              <div key={i} className="absolute rounded-full bg-white/15 pointer-events-none"
                style={{ width: c.w, height: c.h, top: c.top, left: c.left, animation: `floatUp ${c.dur} ${c.delay} ease-in-out infinite` }} />
            ))}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-3xl" />

            <div className="relative z-10">
              <div className="text-6xl mb-4 drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 inline-block">🎨</div>
              <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest block">
                ИЗО
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Всероссийская интерактивная олимпиада по ИЗО</p>
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight mb-5 drop-shadow">
                «Палитра талантов»
              </h3>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-bold text-sm px-4 py-2 rounded-full w-fit group-hover:bg-white/35 group-hover:gap-4 transition-all duration-300">
                Узнать подробнее
                <Icon name="ArrowRight" size={16} />
              </div>
            </div>
          </button>

          {/* Карточка ДПИ */}
          <button
            onClick={() => navigate("/olympiad/grani")}
            className="olympiad-card-shimmer group relative overflow-hidden rounded-3xl p-8 text-left shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 40%, #06B6D4 100%)" }}
          >
            {[
              { w: 130, h: 130, top: "-15%", left: "-6%", delay: "0.3s", dur: "6s" },
              { w: 70,  h: 70,  top: "65%",  left: "78%", delay: "1s",   dur: "5s" },
              { w: 50,  h: 50,  top: "15%",  left: "82%", delay: "2.2s", dur: "7s" },
              { w: 35,  h: 35,  top: "80%",  left: "10%", delay: "0.5s", dur: "4.5s" },
            ].map((c, i) => (
              <div key={i} className="absolute rounded-full bg-white/15 pointer-events-none"
                style={{ width: c.w, height: c.h, top: c.top, left: c.left, animation: `floatUp ${c.dur} ${c.delay} ease-in-out infinite` }} />
            ))}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none rounded-3xl" />

            <div className="relative z-10">
              <div className="text-6xl mb-4 drop-shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 inline-block">💎</div>
              <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest block">
                ДПИ
              </div>
              <p className="text-white/80 text-sm font-medium mb-1">Всероссийская интерактивная олимпиада по ДПИ</p>
              <h3 className="text-3xl md:text-4xl font-heading font-bold text-white leading-tight mb-5 drop-shadow">
                «Грани мастерства»
              </h3>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-bold text-sm px-4 py-2 rounded-full w-fit group-hover:bg-white/35 group-hover:gap-4 transition-all duration-300">
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