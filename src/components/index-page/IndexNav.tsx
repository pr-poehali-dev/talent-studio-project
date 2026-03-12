import Icon from "@/components/ui/icon";
import { contestCategories } from "./IndexTypes";
import { useRef } from "react";

interface IndexNavProps {
  activeSection: string;
  setActiveSection: (s: string) => void;
  showCatWelcome: boolean;
  setShowCatWelcome: (v: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  mobileOpenSubmenu: string | null;
  setMobileOpenSubmenu: (v: string | null) => void;
  showContestsDropdown: boolean;
  setShowContestsDropdown: (v: boolean) => void;
  setContestFilter: (v: string | null) => void;
  setIsColoringModalOpen: (v: boolean) => void;
}

const navItems: { id: string; label: string; icon: string; hasDropdown?: boolean }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "contests", label: "Конкурсы", icon: "Trophy", hasDropdown: true },
  { id: "gallery", label: "Галерея", icon: "Image" },
  { id: "documents", label: "Документы", icon: "FileText" },
  { id: "results", label: "Итоги", icon: "Award" },
  { id: "shop", label: "Магазин", icon: "ShoppingBag" },
  { id: "reviews", label: "Отзывы", icon: "MessageSquare" },
  { id: "designer", label: "Услуги дизайнера", icon: "PenTool" },
  { id: "about", label: "О нас", icon: "Users" },
];

const IndexNav = ({
  activeSection,
  setActiveSection,
  showCatWelcome,
  setShowCatWelcome,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  mobileOpenSubmenu,
  setMobileOpenSubmenu,
  showContestsDropdown,
  setShowContestsDropdown,
  setContestFilter,
  setIsColoringModalOpen,
}: IndexNavProps) => {
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setShowContestsDropdown(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setShowContestsDropdown(false);
    }, 150);
  };

  return (
    <>
      {showCatWelcome && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 animate-in fade-in duration-500"
          onClick={() => setShowCatWelcome(false)}
        >
          <div className="relative animate-in zoom-in duration-500" style={{ width: '800px', maxWidth: '76vw' }}>
            <button
              onClick={() => setShowCatWelcome(false)}
              className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white text-foreground rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all hover:scale-110"
              aria-label="Закрыть"
            >
              <Icon name="X" size={18} />
            </button>
            <style>{`
              @keyframes catWave {
                0%   { transform: rotate(0deg); }
                10%  { transform: rotate(-6deg); }
                20%  { transform: rotate(6deg); }
                30%  { transform: rotate(-6deg); }
                40%  { transform: rotate(6deg); }
                50%  { transform: rotate(0deg); }
                100% { transform: rotate(0deg); }
              }
            `}</style>
            <img
              src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/414e01b6-6b15-442b-896a-03e29a3e5b5d.png"
              alt="Кот Ван Гог"
              className="w-full cursor-pointer drop-shadow-2xl"
              onClick={() => setShowCatWelcome(false)}
              style={{ animation: 'catWave 2.5s ease-in-out infinite', transformOrigin: 'bottom center' }}
            />
            <div
              className="absolute flex flex-col items-center justify-center gap-2"
              style={{ top: '5%', left: '42%', width: '58%', height: '50%', animation: 'catWave 2.5s ease-in-out infinite', transformOrigin: 'bottom center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ opacity: 0, animation: 'catTextIn 0.6s ease-out 0.4s forwards', width: '72%', textAlign: 'center' }}>
                <p className="font-heading font-bold" style={{ fontSize: 'calc(min(800px, 76vw) * 0.040)', color: '#E31E24', marginBottom: '0.4em', lineHeight: 1.2 }}>
                  Дорогие гости и участники!
                </p>
                <p className="font-sans font-semibold" style={{ fontSize: 'calc(min(800px, 76vw) * 0.033)', color: '#5a3e00', lineHeight: 1.4, marginBottom: '0.6em' }}>
                  Подписывайтесь на нашу группу
                </p>
                <a
                  href="https://vk.com/studio.talantov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-sans font-bold hover:brightness-110 transition-all hover:scale-105 animate-pulse"
                  style={{ fontSize: 'calc(min(800px, 76vw) * 0.035)', color: '#fff', background: '#0077FF', textDecoration: 'none', padding: '3px 14px', borderRadius: '20px', animationDuration: '1.5s' }}
                >
                  ВКонтакте
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 backdrop-blur-md shadow-md" style={{ background: 'linear-gradient(to right, #FEFEFE, #FFFBDB)' }}>
        <div className="container mx-auto pl-[50px] pr-4 py-4">
          <div className="flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/2aa89901-38a4-48dd-b954-f55aec2d1508.png"
              alt="Мечтай, твори, дерзай!"
              className="h-32 w-auto object-contain"
            />
            <button
              className="md:hidden ml-auto p-2 rounded-xl hover:bg-accent transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={28} />
            </button>

            <div className="hidden md:flex flex-col gap-1 ml-[20px] flex-1">
              <div className="flex gap-2 justify-end">
                {navItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => item.hasDropdown && handleMouseEnter()}
                    onMouseLeave={() => item.hasDropdown && handleMouseLeave()}
                  >
                    <a
                      href={item.id === "home" ? "/" : `/?section=${item.id}`}
                      onClick={(e) => {
                        if (!item.hasDropdown) {
                          e.preventDefault();
                          setActiveSection(item.id);
                          setShowContestsDropdown(false);
                        }
                      }}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl font-semibold transition-all ${
                        activeSection === item.id
                          ? "bg-primary text-primary-foreground shadow-lg scale-105"
                          : "text-foreground hover:bg-accent hover:scale-105"
                      }`}
                    >
                      <Icon name={item.icon} size={18} />
                      {item.label}
                      {item.hasDropdown && (
                        <Icon name="ChevronDown" size={16} className={`transition-transform ${showContestsDropdown ? 'rotate-180' : ''}`} />
                      )}
                    </a>
                    {item.hasDropdown && showContestsDropdown && (
                      <div
                        className="absolute top-full mt-0 pt-2 bg-transparent z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="bg-white rounded-xl shadow-xl border-2 border-gray-100 min-w-[320px] py-2">
                          <a
                            href="/?section=contests"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveSection("contests");
                              setContestFilter(null);
                              setShowContestsDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-3 hover:bg-accent transition-colors font-medium"
                          >
                            Все конкурсы
                          </a>
                          {contestCategories.map((category) => (
                            <a
                              key={category.id}
                              href={`/?section=contests&category=${category.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveSection("contests");
                                setContestFilter(category.id);
                                setShowContestsDropdown(false);
                              }}
                              className="block w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center gap-2"
                            >
                              <Icon name={category.icon} size={18} className="text-primary" />
                              {category.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-start gap-2">
                <button
                  onClick={() => setIsColoringModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-md hover:shadow-lg animate-pulse"
                  style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E31E24 50%, #9C27B0 100%)', animationDuration: '3s' }}
                >
                  <Icon name="Paintbrush" size={18} />
                  🎨 Раскрась Кота Ван Гога!
                </button>
                <a
                  href="/collective"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-md hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #0077FF 0%, #00B4D8 100%)' }}
                >
                  <Icon name="Users" size={18} />
                  Коллективная заявка
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden sticky top-[148px] z-40 shadow-lg" style={{ background: 'linear-gradient(to right, #FEFEFE, #FFFBDB)' }}>
          <div className="flex flex-col py-2 px-4">
            {navItems.map((item) => (
              <div key={item.id}>
                <a
                  href={item.id === "home" ? "/" : `/?section=${item.id}`}
                  onClick={(e) => {
                    if (item.hasDropdown) {
                      e.preventDefault();
                      setMobileOpenSubmenu(mobileOpenSubmenu === item.id ? null : item.id);
                    } else {
                      e.preventDefault();
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                      setMobileOpenSubmenu(null);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-left ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon name={item.icon} size={20} />
                  {item.label}
                  {item.hasDropdown && (
                    <Icon name="ChevronDown" size={16} className={`ml-auto transition-transform ${mobileOpenSubmenu === item.id ? 'rotate-180' : ''}`} />
                  )}
                </a>
                {item.hasDropdown && mobileOpenSubmenu === item.id && (
                  <div className="pl-4 flex flex-col gap-1 pb-2">
                    {contestCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveSection("contests");
                          setContestFilter(category.id);
                          setIsMobileMenuOpen(false);
                          setMobileOpenSubmenu(null);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left"
                      >
                        <Icon name={category.icon} size={16} className="text-primary" />
                        {category.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              onClick={() => { setIsColoringModalOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white transition-all text-left mt-1"
              style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E31E24 50%, #9C27B0 100%)' }}
            >
              <Icon name="Paintbrush" size={20} />
              🎨 Раскрась Кота Ван Гога!
            </button>
            <a
              href="/collective"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-white transition-all text-left mt-1"
              style={{ background: 'linear-gradient(135deg, #0077FF 0%, #00B4D8 100%)' }}
            >
              <Icon name="Users" size={20} />
              Коллективная заявка
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default IndexNav;
