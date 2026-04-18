import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function GraniOlympiad() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* Hero-шапка */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 40%, #06B6D4 100%)" }}>
        {[
          { w: 160, h: 160, top: "-10%", left: "-5%",  delay: "0.3s", dur: "6s"   },
          { w: 90,  h: 90,  top: "55%",  left: "78%",  delay: "1s",   dur: "5s"   },
          { w: 60,  h: 60,  top: "5%",   left: "82%",  delay: "2.2s", dur: "7s"   },
          { w: 45,  h: 45,  top: "70%",  left: "12%",  delay: "0.5s", dur: "4.5s" },
        ].map((c, i) => (
          <div key={i} className="absolute rounded-full bg-white/15 pointer-events-none"
            style={{ width: c.w, height: c.h, top: c.top, left: c.left,
              animation: `floatUpG ${c.dur} ${c.delay} ease-in-out infinite` }} />
        ))}
        <style>{`
          @keyframes floatUpG {
            0%   { transform: translateY(0px) scale(1);     opacity: 0.15; }
            50%  { transform: translateY(-16px) scale(1.07); opacity: 0.25; }
            100% { transform: translateY(0px) scale(1);     opacity: 0.15; }
          }
        `}</style>
        <div className="relative z-10 container mx-auto px-6 pt-8 pb-12 max-w-4xl">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-8 transition-colors"
          >
            <Icon name="ArrowLeft" size={18} />
            На главную
          </button>
          <div className="text-center">
            <div className="text-7xl mb-4 drop-shadow inline-block animate-bounce" style={{ animationDuration: "2.5s" }}>💎</div>
            <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              ДПИ
            </div>
            <p className="text-white/90 text-xl md:text-3xl font-semibold mb-1">Всероссийская интерактивная олимпиада по ДПИ</p>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white drop-shadow-md">
              «Грани мастерства»
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-4xl text-center">
        <p className="text-gray-500 text-lg">Страница находится в разработке. Скоро здесь появится вся информация об олимпиаде.</p>
      </div>
    </div>
  );
}