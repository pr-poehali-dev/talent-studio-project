import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showContestsDropdown, setShowContestsDropdown] = useState(false);
  const [contestFilter, setContestFilter] = useState<string | null>(null);
  const { toast } = useToast();
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

  const navItems = [
    { id: "home", label: "Главная", icon: "Home" },
    { id: "contests", label: "Конкурсы", icon: "Trophy", hasDropdown: true },
    { id: "gallery", label: "Галерея", icon: "Image" },
    { id: "documents", label: "Документы", icon: "FileText" },
    { id: "results", label: "Итоги", icon: "Award" },
    { id: "shop", label: "Магазин", icon: "ShoppingBag" },
    { id: "reviews", label: "Отзывы", icon: "MessageSquare" },
    { id: "about", label: "О нас", icon: "Users" },
  ];

  const contestCategories = [
    { id: "visual-arts", label: "Конкурсы изобразительного искусства" },
    { id: "decorative-arts", label: "Конкурсы декоративно-прикладного искусства" },
    { id: "nature", label: "Конкурсы, посвященные теме природы" },
    { id: "animals", label: "Конкурсы, посвященные теме животных" },
    { id: "plants", label: "Конкурсы, посвященные теме растений" },
  ];

  const contests = [
    {
      id: 1,
      title: "Искусство натюрморта",
      category: "Рисунок",
      deadline: "15 марта 2026",
      participants: 127,
      status: "active",
      image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/4b6a84c1-0d14-4cd0-808d-931cf4717fc6.png",
    },
    {
      id: 2,
      title: "Искусство пейзажа",
      category: "Акварель",
      deadline: "22 марта 2026",
      participants: 89,
      status: "active",
      image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/c292555b-b350-4398-84d2-4cabd4ba840a.png",
    },
    {
      id: 3,
      title: "Креативный скетчинг",
      category: "Живопись",
      deadline: "10 апреля 2026",
      participants: 156,
      status: "new",
      image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/de6860cc-96a4-410b-979a-3824771d6fb6.png",
    },
    {
      id: 4,
      title: "Разноцветные карандаши",
      category: "Графика",
      deadline: "5 апреля 2026",
      participants: 73,
      status: "active",
      image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/fc222fbf-474a-4d96-8496-24c5edfe83eb.png",
    },
  ];

  const galleryWorks = [
    { id: 1, title: "Рыжий кот", author: "Маша, 8 лет", likes: 42, contest: "Мой любимый питомец", image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/e3c0a763-7712-4036-97ee-60e0bf1f7412.jpg" },
    { id: 2, title: "Ракета Мечты", author: "Саша, 10 лет", likes: 38, contest: "Космос будущего", image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/58942009-21fa-42ac-ac84-2e1cf46d931d.jpg" },
    { id: 3, title: "Золотая рыбка", author: "Лиза, 7 лет", likes: 55, contest: "Мой любимый питомец", image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/215e221d-f05d-4508-b1b7-c6b72843aedb.jpg" },
    { id: 4, title: "Звездный путь", author: "Ваня, 9 лет", likes: 29, contest: "Космос будущего", image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/957faa08-2a88-45eb-b602-04c9f83f9be7.jpg" },
    { id: 5, title: "Веселый щенок", author: "Катя, 11 лет", likes: 47, contest: "Мой любимый питомец", image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/83b700ef-37e0-4bbf-85b6-3a9ed5d13fc2.png" },
    { id: 6, title: "Планета мечты", author: "Дима, 12 лет", likes: 33, contest: "Космос будущего", image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/e3c0a763-7712-4036-97ee-60e0bf1f7412.jpg" },
    { id: 7, title: "Волшебное дерево", author: "Аня, 8 лет", likes: 51, contest: "Сказочный лес", image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/215e221d-f05d-4508-b1b7-c6b72843aedb.jpg" },
    { id: 8, title: "Лесные друзья", author: "Петя, 9 лет", likes: 44, contest: "Сказочный лес", image: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/957faa08-2a88-45eb-b602-04c9f83f9be7.jpg" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 backdrop-blur-md shadow-md" style={{ background: 'linear-gradient(to right, #FEFEFE, #FFFBDB)' }}>
        <div className="container mx-auto pl-[50px] pr-4 py-4">
          <div className="flex items-center">
            <img 
              src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/2aa89901-38a4-48dd-b954-f55aec2d1508.png" 
              alt="Мечтай, твори, дерзай!" 
              className="h-32 w-auto object-contain"
            />
            <div className="hidden md:flex gap-2 ml-[20px] flex-1 justify-end">
              {navItems.map((item) => (
                <div 
                  key={item.id} 
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && handleMouseEnter()}
                  onMouseLeave={() => item.hasDropdown && handleMouseLeave()}
                >
                  <button
                    onClick={() => {
                      if (!item.hasDropdown) {
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
                    <Icon name={item.icon as any} size={18} />
                    {item.label}
                    {item.hasDropdown && (
                      <Icon name="ChevronDown" size={16} className={`transition-transform ${showContestsDropdown ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {item.hasDropdown && showContestsDropdown && (
                    <div 
                      className="absolute top-full mt-0 pt-2 bg-transparent z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="bg-white rounded-xl shadow-xl border-2 border-gray-100 min-w-[320px] py-2">
                        <button
                          onClick={() => {
                            setActiveSection("contests");
                            setContestFilter(null);
                            setShowContestsDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-accent transition-colors font-medium"
                        >
                          Все конкурсы
                        </button>
                        {contestCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => {
                              setActiveSection("contests");
                              setContestFilter(category.id);
                              setShowContestsDropdown(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {activeSection === "home" && (
        <div className="container mx-auto px-[40px] py-12">
          <section className="text-center mb-16 animate-in fade-in duration-700">
            <h2 className="text-5xl md:text-7xl font-heading mb-6 font-bold" style={{ color: '#E31E24' }}>Мечтай, твори, дерзай!</h2>
            <p className="max-w-4xl mx-auto mb-8 py-[3px] text-xl font-normal text-center text-slate-600">Кот Ван Гог и студия талантов "Мечтай, твори, дерзай!" 
приглашают учащихся и педагогов художественных школ и студий, 
художников‑любителей и профессионалов, а также всех,
 кто любит творить и хочет представить свои работы широкой аудитории 
к участию в конкурсах изобразительного искусства и творчества!</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl"
                onClick={() => setActiveSection("contests")}
              >
                <Icon name="Palette" className="mr-2" />
                Участвовать в конкурсе
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-2xl border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
                onClick={() => setActiveSection("gallery")}
              >
                <Icon name="Image" className="mr-2" />
                Смотреть галерею
              </Button>
            </div>
          </section>

          <section className="mb-16">
            <h3 className="text-4xl font-heading font-bold text-center mb-8 text-primary">🏆 Актуальные конкурсы</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {contests.map((contest) => (
                <Card
                  key={contest.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary rounded-3xl"
                >
                  <div 
                    className="h-40 overflow-hidden cursor-pointer"
                    onClick={() => {
                      setImagePreview(contest.image);
                      setIsImageModalOpen(true);
                    }}
                  >
                    <img 
                      src={contest.image} 
                      alt={contest.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-heading font-bold text-primary">{contest.title}</h4>
                      {contest.status === "new" && (
                        <Badge className="bg-success text-success-foreground">Новый!</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">📌 {contest.category}</p>
                    <p className="text-xs text-muted-foreground mb-2">⏰ До: {contest.deadline}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="Users" size={16} className="text-info" />
                      <span className="text-sm font-semibold text-info">{contest.participants} участников</span>
                    </div>
                    <Button 
                      className="w-full rounded-xl bg-primary hover:bg-primary/90"
                      onClick={() => {
                        setSelectedContest(contest.title);
                        setIsModalOpen(true);
                      }}
                    >
                      Участвовать
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-4xl font-heading font-bold text-center mb-8 text-secondary">🎨 Галерея лучших работ</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {galleryWorks.map((work) => (
                <Card
                  key={work.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl"
                >
                  <div 
                    className="h-48 overflow-hidden cursor-pointer"
                    onClick={() => {
                      setImagePreview(work.image);
                      setIsImageModalOpen(true);
                    }}
                  >
                    <img 
                      src={work.image} 
                      alt={work.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="text-base font-heading font-bold mb-1">{work.title}</h4>
                    <p className="text-xs text-muted-foreground mb-1">👤 {work.author}</p>
                    <p className="text-xs text-muted-foreground mb-3">🏆 {work.contest}</p>
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl"
                      >
                        <Icon name="Heart" size={16} className="mr-1" />
                        {work.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-xl">
                        <Icon name="MessageCircle" size={16} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mt-16 text-center bg-gradient-to-r from-primary via-secondary to-success rounded-3xl p-12 text-white">
            <h3 className="text-4xl font-heading font-bold mb-4">Начни свой творческий путь прямо сейчас!</h3>
            <p className="text-lg mb-8 opacity-90">
              Присоединяйся к нашему сообществу юных художников и выигрывай крутые призы!
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-2xl">
              <Icon name="Star" className="mr-2" />
              Зарегистрироваться
            </Button>
          </section>
        </div>
      )}

      {activeSection === "contests" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">🏆 Все конкурсы</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest) => (
              <Card
                key={contest.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary rounded-3xl"
              >
                <div className="h-48 bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                  <Icon name="Trophy" className="text-white" size={80} />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-heading font-bold text-primary">{contest.title}</h4>
                    {contest.status === "new" && (
                      <Badge className="bg-success text-success-foreground">Новый!</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">📌 {contest.category}</p>
                  <p className="text-sm text-muted-foreground mb-2">⏰ До: {contest.deadline}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="Users" size={16} className="text-info" />
                    <span className="text-sm font-semibold text-info">{contest.participants} участников</span>
                  </div>
                  <Button className="w-full rounded-xl bg-secondary hover:bg-secondary/90">
                    Подать работу
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === "gallery" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-secondary">🎨 Галерея работ</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryWorks.map((work) => (
              <Card
                key={work.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl"
              >
                <div className="h-56 bg-gradient-to-br from-accent via-info/30 to-success/30 flex items-center justify-center">
                  <Icon name="Palette" className="text-white" size={60} />
                </div>
                <CardContent className="p-6">
                  <h4 className="text-lg font-heading font-bold mb-2">{work.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">👤 {work.author}</p>
                  <p className="text-xs text-muted-foreground mb-4">🏆 {work.contest}</p>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl"
                    >
                      <Icon name="Heart" size={18} className="mr-1" />
                      {work.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <Icon name="MessageCircle" size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === "documents" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">📄 Документы</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { title: "Положение о конкурсах", icon: "FileText" },
              { title: "Правила участия", icon: "ScrollText" },
              { title: "Критерии оценки работ", icon: "ClipboardCheck" },
              { title: "Политика конфиденциальности", icon: "Shield" },
            ].map((doc, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-x-2 rounded-2xl cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-info to-success rounded-xl flex items-center justify-center">
                      <Icon name={doc.icon as any} className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-heading font-semibold">{doc.title}</h3>
                  </div>
                  <Icon name="Download" className="text-info" size={24} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === "results" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-secondary">🏅 Итоги конкурсов</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 rounded-3xl shadow-2xl border-2 border-secondary mb-6">
              <h3 className="text-3xl font-heading font-bold mb-6 text-center">Конкурс "Зимняя сказка" - Завершен</h3>
              <div className="space-y-6">
                {[
                  { place: "🥇 1 место", name: "Снежная королева", author: "Аня, 11 лет", prize: "Планшет для рисования" },
                  { place: "🥈 2 место", name: "Снеговик-волшебник", author: "Петя, 9 лет", prize: "Набор красок" },
                  { place: "🥉 3 место", name: "Морозные узоры", author: "Оля, 10 лет", prize: "Альбом и карандаши" },
                ].map((winner, index) => (
                  <Card key={index} className="p-6 bg-gradient-to-r from-accent/20 to-transparent rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-heading font-bold mb-2">{winner.place}</p>
                        <p className="text-lg font-semibold">{winner.name}</p>
                        <p className="text-sm text-muted-foreground">👤 {winner.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Приз:</p>
                        <p className="font-semibold text-primary">{winner.prize}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeSection === "shop" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">🛍️ Магазин</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Набор красок", price: "1 200 ₽", icon: "Brush" },
              { name: "Планшет для рисования", price: "8 500 ₽", icon: "Tablet" },
              { name: "Альбом премиум", price: "450 ₽", icon: "BookOpen" },
              { name: "Мольберт детский", price: "3 200 ₽", icon: "Frame" },
              { name: "Набор кистей", price: "890 ₽", icon: "Paintbrush" },
              { name: "Акварель professional", price: "2 100 ₽", icon: "Palette" },
            ].map((item, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl"
              >
                <div className="h-48 bg-gradient-to-br from-secondary via-primary to-info flex items-center justify-center">
                  <Icon name={item.icon as any} className="text-white" size={64} />
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-heading font-bold mb-2">{item.name}</h4>
                  <p className="text-2xl font-bold text-primary mb-4">{item.price}</p>
                  <Button className="w-full rounded-xl bg-success hover:bg-success/90">
                    <Icon name="ShoppingCart" className="mr-2" size={18} />
                    В корзину
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === "reviews" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">💬 Отзывы</h2>
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Мама Маши, 8 лет",
                text: "Дочка в восторге! Участвовала в конкурсе 'Мой любимый питомец' и заняла 1 место. Теперь рисует еще больше!",
                rating: 5,
              },
              {
                name: "Папа Саши, 10 лет",
                text: "Отличная платформа для развития творчества. Саша нашел здесь друзей-художников и постоянно участвует в конкурсах.",
                rating: 5,
              },
              {
                name: "Мама Лизы, 7 лет",
                text: "Спасибо за организацию! Лиза получила свой первый приз и теперь мечтает стать настоящим художником.",
                rating: 5,
              },
              {
                name: "Бабушка Вани, 9 лет",
                text: "Ваня очень доволен! Здесь честные конкурсы, и каждая работа оценивается по достоинству.",
                rating: 5,
              },
              {
                name: "Мама Кати, 11 лет",
                text: "Замечательный проект! Катя развивается, получает обратную связь и радуется каждому новому конкурсу.",
                rating: 5,
              },
              {
                name: "Папа Димы, 12 лет",
                text: "Дима участвует уже полгода. За это время его работы стали намного лучше. Рекомендую всем!",
                rating: 5,
              },
            ].map((review, index) => (
              <Card key={index} className="p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Icon key={i} name="Star" className="text-secondary fill-secondary" size={20} />
                  ))}
                </div>
                <p className="text-lg mb-4 italic">"{review.text}"</p>
                <p className="font-semibold text-primary">{review.name}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === "about" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">👋 О нас</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 rounded-3xl shadow-2xl mb-8">
              <p className="text-lg leading-relaxed mb-6">
                <strong className="text-primary text-2xl">Студия талантов "Мечтай, твори, дерзай!"</strong> - это онлайн-платформа для юных художников и творцов!
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Мы создали пространство, где каждый ребенок может:
              </p>
              <ul className="space-y-3 text-lg mb-6">
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="text-success mt-1" size={24} />
                  <span>Участвовать в интересных конкурсах</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="text-success mt-1" size={24} />
                  <span>Делиться своими работами с друзьями</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="text-success mt-1" size={24} />
                  <span>Получать призы и признание</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icon name="CheckCircle" className="text-success mt-1" size={24} />
                  <span>Развивать свои творческие способности</span>
                </li>
              </ul>
              <div className="bg-gradient-to-r from-accent/30 to-transparent p-6 rounded-2xl">
                <p className="text-lg font-semibold">
                  🎯 Наша миссия: вдохновлять детей на творчество и помогать раскрывать их таланты!
                </p>
              </div>
            </Card>
            <div className="text-center">
              <Button size="lg" className="text-lg px-8 py-6 rounded-2xl bg-gradient-to-r from-primary to-secondary">
                <Icon name="Mail" className="mr-2" />
                Связаться с нами
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-heading font-bold text-primary">
              🎨 Подать работу
            </DialogTitle>
            <DialogDescription className="text-base">
              Конкурс: <span className="font-semibold text-primary">{selectedContest}</span>
            </DialogDescription>
          </DialogHeader>
          
          <form 
            className="space-y-5 mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast({
                title: "Заявка отправлена!",
                description: `Ваша работа "${uploadedFile?.name}" успешно отправлена на конкурс!`,
              });
              setIsModalOpen(false);
              setUploadedFile(null);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-semibold">ФИО *</Label>
              <Input 
                id="fullName" 
                placeholder="Введите ФИО участника" 
                required 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-base font-semibold">Возраст *</Label>
              <Input 
                id="age" 
                type="number" 
                min="5" 
                max="18" 
                placeholder="Введите возраст" 
                required 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher" className="text-base font-semibold">Педагог</Label>
              <Input 
                id="teacher" 
                placeholder="ФИО педагога (если есть)" 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution" className="text-base font-semibold">Учреждение</Label>
              <Input 
                id="institution" 
                placeholder="Название школы, студии или учреждения" 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workTitle" className="text-base font-semibold">Название творческой работы *</Label>
              <Input 
                id="workTitle" 
                placeholder="Введите название работы" 
                required 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Электронная почта *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@mail.ru" 
                required 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workFile" className="text-base font-semibold">Загрузить работу *</Label>
              <div className="relative">
                <Input 
                  id="workFile" 
                  type="file" 
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="rounded-xl border-2 focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary/90"
                />
              </div>
              {uploadedFile && (
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-xl text-sm">
                  <Icon name="CheckCircle" className="text-success" size={20} />
                  <span className="text-success font-semibold">Файл загружен: {uploadedFile.name}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Форматы: JPG, PNG, PDF (макс. 10 МБ)</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3 p-3 bg-accent/10 rounded-xl">
                <Checkbox id="gallery" required className="mt-1" />
                <Label htmlFor="gallery" className="text-sm leading-relaxed cursor-pointer">
                  Согласен на публикацию работы в галерее сайта *
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-accent/10 rounded-xl">
                <Checkbox id="terms" required className="mt-1" />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  Согласен с условиями конкурса и политикой обработки персональных данных *
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full text-lg py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              <Icon name="CreditCard" className="mr-2" />
              Оплатить и подать заявку
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden rounded-3xl">
          <div className="relative w-full h-full flex items-center justify-center bg-black/95">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsImageModalOpen(false)}
            >
              <Icon name="X" size={24} />
            </Button>
            {imagePreview && (
              <img 
                src={imagePreview} 
                alt="Увеличенное изображение"
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-gradient-to-r from-primary via-secondary to-success text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/2aa89901-38a4-48dd-b954-f55aec2d1508.png" 
              alt="Мечтай, твори, дерзай!" 
              className="h-40 w-auto object-contain bg-white rounded-2xl px-3 py-2"
            />
          </div>
          <p className="text-lg opacity-90 mb-6">Студия талантов для юных художников</p>
          <div className="flex gap-4 justify-center mb-6">
            <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
              <Icon name="Mail" size={24} />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
              <Icon name="Phone" size={24} />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
              <Icon name="MessageCircle" size={24} />
            </Button>
          </div>
          <p className="text-sm opacity-75">© 2026 Мечтай, твори, дерзай! Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;