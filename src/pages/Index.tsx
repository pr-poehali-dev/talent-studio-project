import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";

interface Contest {
  id: number;
  title: string;
  description: string;
  categoryId: string;
  deadline: string;
  price: number;
  status: string;
  rulesLink: string;
  diplomaImage: string;
  image: string;
  participants: number;
}

interface PublicResult {
  id: number;
  full_name: string;
  age: number | null;
  teacher: string | null;
  institution: string | null;
  work_title: string;
  contest_name: string;
  result: 'grand_prix' | 'first_degree' | 'second_degree' | 'third_degree' | 'participant';
  work_file_url: string;
  created_at: string;
  updated_at: string;
}

const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
const SUBMIT_APPLICATION_URL = "https://functions.poehali.dev/2d352955-9c6c-4bbb-ad1e-944c7ea04d84";

const Index = () => {
  const [searchParams] = useSearchParams();
  const initialSection = searchParams.get('section') || 'home';
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [showContestsDropdown, setShowContestsDropdown] = useState(false);
  const [contestFilter, setContestFilter] = useState<string | null>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [results, setResults] = useState<PublicResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<PublicResult[]>([]);
  const [resultFilters, setResultFilters] = useState({
    contest: '',
    fullName: '',
    result: 'all'
  });
  const { toast } = useToast();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadContests = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setContests(data);
      } catch (error) {
        console.error('Ошибка загрузки конкурсов:', error);
      }
    };
    loadContests();
  }, []);

  useEffect(() => {
    if (window.location.pathname === '/results') {
      setActiveSection('results');
    }
  }, []);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/181f157e-94db-4c48-b7f6-a9d8f1a6e7b6');
        const data = await response.json();
        setResults(data);
        setFilteredResults(data);
      } catch (error) {
        console.error('Ошибка загрузки результатов:', error);
      }
    };
    if (activeSection === 'results') {
      loadResults();
    }
  }, [activeSection]);

  useEffect(() => {
    let filtered = [...results];

    if (resultFilters.contest) {
      filtered = filtered.filter(r => 
        r.contest_name.toLowerCase().includes(resultFilters.contest.toLowerCase())
      );
    }

    if (resultFilters.fullName) {
      filtered = filtered.filter(r => 
        r.full_name.toLowerCase().includes(resultFilters.fullName.toLowerCase())
      );
    }

    if (resultFilters.result !== 'all') {
      filtered = filtered.filter(r => r.result === resultFilters.result);
    }

    setFilteredResults(filtered);
  }, [results, resultFilters]);

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
    { id: "visual-arts", label: "Конкурсы изобразительного искусства", icon: "Palette" },
    { id: "decorative-arts", label: "Конкурсы декоративно-прикладного искусства", icon: "Scissors" },
    { id: "nature", label: "Конкурсы, посвященные теме природы", icon: "TreePine" },
    { id: "animals", label: "Конкурсы, посвященные теме животных", icon: "PawPrint" },
    { id: "plants", label: "Конкурсы, посвященные теме растений", icon: "Flower2" },
    { id: "holidays", label: "Конкурсы, посвященные теме праздников", icon: "PartyPopper" },
    { id: "thematic", label: "Тематические конкурсы ИЗО и творчества", icon: "Sparkles" },
  ];

  const getCategoryIcon = (categoryId: string) => {
    const category = contestCategories.find(cat => cat.id === categoryId);
    return category?.icon || "Trophy";
  };

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
                    <Icon name={item.icon} size={18} />
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
                            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center gap-2"
                          >
                            <Icon name={category.icon} size={18} className="text-primary" />
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

          {contests.filter(c => c.status === "new").length > 0 && (
            <section className="mb-16">
              <h3 className="text-4xl font-heading font-bold text-center mb-8" style={{ color: '#FF8C00' }}>✨ Новые конкурсы</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {contests.filter(c => c.status === "new").map((contest) => (
                  <Card
                    key={contest.id}
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 rounded-3xl"
                    style={{ borderColor: '#FF8C00' }}
                  >
                    <div className="h-40 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 flex items-center justify-center relative">
                      <Icon name={getCategoryIcon(contest.categoryId)} style={{ color: '#FF8C00' }} size={60} />
                      <Badge className="absolute top-2 right-2 text-white" style={{ backgroundColor: '#FF8C00' }}>Новый!</Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <h4 className="text-lg font-heading font-bold text-primary">{contest.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{contest.description}</p>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#FF8C00' }}>💰 {contest.price} ₽</p>
                      <button 
                        onClick={() => {
                          if (contest.rulesLink && contest.rulesLink !== '#') {
                            setPdfUrl(contest.rulesLink);
                            setIsPdfModalOpen(true);
                          }
                        }}
                        className="text-xs hover:underline flex items-center gap-1 font-semibold mb-1"
                        style={{ color: '#FF8C00' }}
                      >
                        <Icon name="FileText" size={14} />
                        Положение конкурса
                      </button>
                      <button 
                        onClick={() => {
                          setImagePreview(contest.diplomaImage);
                          setIsImageModalOpen(true);
                        }}
                        className="text-xs hover:underline flex items-center gap-1 font-semibold mb-3"
                        style={{ color: '#FF8C00' }}
                      >
                        <Icon name="Award" size={14} />
                        Образец диплома
                      </button>
                      <Button 
                        className="w-full rounded-xl text-white hover:opacity-90"
                        style={{ backgroundColor: '#FF8C00' }}
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
          )}

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
        </div>
      )}

      {activeSection === "contests" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-8 text-primary">🏆 Все конкурсы</h2>
          
          <div className="max-w-5xl mx-auto mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={() => setContestFilter(null)}
                variant={contestFilter === null ? "default" : "outline"}
                className={`rounded-xl ${contestFilter === null ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              >
                Все конкурсы
                <Badge className="ml-2" variant="secondary">{contests.length}</Badge>
              </Button>
              {contestCategories.map((category) => {
                const count = contests.filter(c => c.categoryId === category.id).length;
                return (
                  <Button
                    key={category.id}
                    onClick={() => setContestFilter(category.id)}
                    variant={contestFilter === category.id ? "default" : "outline"}
                    className={`rounded-xl ${contestFilter === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                  >
                    <Icon name={category.icon} size={18} className="mr-2" />
                    {category.label}
                    <Badge className="ml-2" variant="secondary">{count}</Badge>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 max-w-5xl mx-auto">
            {contests
              .filter(contest => !contestFilter || contest.categoryId === contestFilter)
              .map((contest) => (
              <Card
                key={contest.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary rounded-3xl"
              >
                <div className="flex flex-col md:flex-row md:h-64">
                  <div className="md:w-64 h-48 md:h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
                  </div>
                  <CardContent className="p-6 flex-[0.6] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-2xl font-heading font-bold text-primary">{contest.title}</h4>
                        {contest.status === "new" && (
                          <Badge className="bg-success text-success-foreground">Новый!</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{contest.description}</p>
                      <button 
                        onClick={() => {
                          if (contest.rulesLink && contest.rulesLink !== '#') {
                            setPdfUrl(contest.rulesLink);
                            setIsPdfModalOpen(true);
                          }
                        }}
                        className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold mb-1"
                      >
                        <Icon name="FileText" size={16} />
                        Положение конкурса
                      </button>
                      <p className="text-sm font-semibold text-success">💰 Стоимость участия: {contest.price} ₽</p>
                    </div>
                    <Button 
                      className="w-full md:w-auto rounded-xl bg-primary hover:bg-primary/90 px-8"
                      onClick={() => {
                        setSelectedContest(contest.title);
                        setIsModalOpen(true);
                      }}
                    >
                      Участвовать
                    </Button>
                  </CardContent>
                  <div className="flex-[0.4] p-3 flex flex-col items-center justify-center border-l">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 text-center">Образец диплома</p>
                    <div 
                      className="w-full flex-1 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                      onClick={() => {
                        setImagePreview(contest.diplomaImage);
                        setIsImageModalOpen(true);
                      }}
                    >
                      <img 
                        src={contest.diplomaImage} 
                        alt="Образец диплома"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
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
                      <Icon name={doc.icon} className="text-white" size={24} />
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
          <h2 className="text-4xl font-heading font-bold text-center mb-8 text-secondary">Итоги конкурсов</h2>
          
          <div className="max-w-7xl mx-auto mb-8 bg-white rounded-lg shadow-sm border p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Конкурс</Label>
                <Input
                  placeholder="Поиск по названию конкурса..."
                  value={resultFilters.contest}
                  onChange={(e) => setResultFilters({...resultFilters, contest: e.target.value})}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">ФИО участника</Label>
                <Input
                  placeholder="Поиск по ФИО..."
                  value={resultFilters.fullName}
                  onChange={(e) => setResultFilters({...resultFilters, fullName: e.target.value})}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Результат</Label>
                <Select
                  value={resultFilters.result}
                  onValueChange={(value) => setResultFilters({...resultFilters, result: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все результаты</SelectItem>
                    <SelectItem value="grand_prix">Гран-При</SelectItem>
                    <SelectItem value="first_degree">Диплом 1 степени</SelectItem>
                    <SelectItem value="second_degree">Диплом 2 степени</SelectItem>
                    <SelectItem value="third_degree">Диплом 3 степени</SelectItem>
                    <SelectItem value="participant">Участник</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            {filteredResults.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                <p className="text-lg text-muted-foreground">Результаты не найдены</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="hidden md:grid md:grid-cols-8 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm">
                  <div>№</div>
                  <div>ФИО участника</div>
                  <div>Возраст</div>
                  <div>Конкурс</div>
                  <div>Результат</div>
                  <div>Дата участия</div>
                  <div>Педагог</div>
                  <div>Учреждение</div>
                </div>
                
                <div className="divide-y">
                  {filteredResults.map((result, index) => (
                    <div key={result.id} className="grid md:grid-cols-8 gap-4 p-4 hover:bg-gray-50 transition-colors">
                      <div className="text-sm text-muted-foreground">
                        <span className="md:hidden font-semibold">№: </span>
                        {index + 1}
                      </div>
                      <div className="text-sm font-medium">
                        <span className="md:hidden font-semibold text-muted-foreground">ФИО: </span>
                        {result.full_name}
                      </div>
                      <div className="text-sm">
                        <span className="md:hidden font-semibold text-muted-foreground">Возраст: </span>
                        {result.age || '—'}
                      </div>
                      <div className="text-sm">
                        <span className="md:hidden font-semibold text-muted-foreground">Конкурс: </span>
                        {result.contest_name}
                      </div>
                      <div className="text-sm">
                        <span className="md:hidden font-semibold text-muted-foreground">Результат: </span>
                        <span className={`inline-block px-3 py-1 rounded-md font-semibold text-xs ${
                          result.result === 'grand_prix' 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                            : result.result === 'first_degree'
                            ? 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-white'
                            : result.result === 'second_degree'
                            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
                            : result.result === 'third_degree'
                            ? 'bg-gradient-to-r from-orange-300 to-orange-400 text-white'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {result.result === 'grand_prix' && 'Гран-При'}
                          {result.result === 'first_degree' && 'Диплом 1 степени'}
                          {result.result === 'second_degree' && 'Диплом 2 степени'}
                          {result.result === 'third_degree' && 'Диплом 3 степени'}
                          {result.result === 'participant' && 'Участник'}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="md:hidden font-semibold text-muted-foreground">Дата участия: </span>
                        {new Date(result.created_at).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="text-sm">
                        <span className="md:hidden font-semibold text-muted-foreground">Педагог: </span>
                        {result.teacher || '—'}
                      </div>
                      <div className="text-sm">
                        <span className="md:hidden font-semibold text-muted-foreground">Учреждение: </span>
                        {result.institution || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  <Icon name={item.icon} className="text-white" size={64} />
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

      {activeSection === "visual-arts" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">🎨 Конкурсы изобразительного искусства</h2>
          <div className="space-y-6 max-w-5xl mx-auto">
            {contests.filter(c => c.categoryId === "visual-arts").map((contest) => (
              <Card
                key={contest.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary rounded-3xl"
              >
                <div className="flex flex-col md:flex-row md:h-64">
                  <div className="md:w-64 h-48 md:h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
                  </div>
                  <CardContent className="p-6 flex-[0.6] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-2xl font-heading font-bold text-primary">{contest.title}</h4>
                        {contest.status === "new" && (
                          <Badge className="bg-success text-success-foreground">Новый!</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{contest.description}</p>
                      <button 
                        onClick={() => {
                          if (contest.rulesLink && contest.rulesLink !== '#') {
                            setPdfUrl(contest.rulesLink);
                            setIsPdfModalOpen(true);
                          }
                        }}
                        className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold mb-1"
                      >
                        <Icon name="FileText" size={16} />
                        Положение конкурса
                      </button>
                      <p className="text-sm font-semibold text-success">💰 Стоимость участия: {contest.price} ₽</p>
                    </div>
                    <Button 
                      className="w-full md:w-auto rounded-xl bg-primary hover:bg-primary/90 px-8"
                      onClick={() => {
                        setSelectedContest(contest.title);
                        setIsModalOpen(true);
                      }}
                    >
                      Участвовать
                    </Button>
                  </CardContent>
                  <div className="flex-[0.4] p-3 flex flex-col items-center justify-center border-l">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 text-center">Образец диплома</p>
                    <div 
                      className="w-full flex-1 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                      onClick={() => {
                        setImagePreview(contest.diplomaImage);
                        setIsImageModalOpen(true);
                      }}
                    >
                      <img 
                        src={contest.diplomaImage} 
                        alt="Образец диплома"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === "decorative-arts" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">✨ Конкурсы декоративно-прикладного искусства</h2>
          <div className="space-y-6 max-w-5xl mx-auto">
            {contests.filter(c => c.categoryId === "decorative-arts").map((contest) => (
              <Card
                key={contest.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary rounded-3xl"
              >
                <div className="flex flex-col md:flex-row md:h-64">
                  <div className="md:w-64 h-48 md:h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
                  </div>
                  <CardContent className="p-6 flex-[0.6] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-2xl font-heading font-bold text-primary">{contest.title}</h4>
                        {contest.status === "new" && (
                          <Badge className="bg-success text-success-foreground">Новый!</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{contest.description}</p>
                      <button 
                        onClick={() => {
                          if (contest.rulesLink && contest.rulesLink !== '#') {
                            setPdfUrl(contest.rulesLink);
                            setIsPdfModalOpen(true);
                          }
                        }}
                        className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold mb-1"
                      >
                        <Icon name="FileText" size={16} />
                        Положение конкурса
                      </button>
                      <p className="text-sm font-semibold text-success">💰 Стоимость участия: {contest.price} ₽</p>
                    </div>
                    <Button 
                      className="w-full md:w-auto rounded-xl bg-primary hover:bg-primary/90 px-8"
                      onClick={() => {
                        setSelectedContest(contest.title);
                        setIsModalOpen(true);
                      }}
                    >
                      Участвовать
                    </Button>
                  </CardContent>
                  <div className="flex-[0.4] p-3 flex flex-col items-center justify-center border-l">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 text-center">Образец диплома</p>
                    <div 
                      className="w-full flex-1 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                      onClick={() => {
                        setImagePreview(contest.diplomaImage);
                        setIsImageModalOpen(true);
                      }}
                    >
                      <img 
                        src={contest.diplomaImage} 
                        alt="Образец диплома"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === "nature" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">🌿 Конкурсы, посвященные теме природы</h2>
          <div className="space-y-6 max-w-5xl mx-auto">
            {contests.filter(c => c.categoryId === "nature").map((contest) => (
              <Card
                key={contest.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary rounded-3xl"
              >
                <div className="flex flex-col md:flex-row md:h-64">
                  <div className="md:w-64 h-48 md:h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
                  </div>
                  <CardContent className="p-6 flex-[0.6] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-2xl font-heading font-bold text-primary">{contest.title}</h4>
                        {contest.status === "new" && (
                          <Badge className="bg-success text-success-foreground">Новый!</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{contest.description}</p>
                      <button 
                        onClick={() => {
                          if (contest.rulesLink && contest.rulesLink !== '#') {
                            setPdfUrl(contest.rulesLink);
                            setIsPdfModalOpen(true);
                          }
                        }}
                        className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold mb-1"
                      >
                        <Icon name="FileText" size={16} />
                        Положение конкурса
                      </button>
                      <p className="text-sm font-semibold text-success">💰 Стоимость участия: {contest.price} ₽</p>
                    </div>
                    <Button 
                      className="w-full md:w-auto rounded-xl bg-primary hover:bg-primary/90 px-8"
                      onClick={() => {
                        setSelectedContest(contest.title);
                        setIsModalOpen(true);
                      }}
                    >
                      Участвовать
                    </Button>
                  </CardContent>
                  <div className="flex-[0.4] p-3 flex flex-col items-center justify-center border-l">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 text-center">Образец диплома</p>
                    <div 
                      className="w-full flex-1 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                      onClick={() => {
                        setImagePreview(contest.diplomaImage);
                        setIsImageModalOpen(true);
                      }}
                    >
                      <img 
                        src={contest.diplomaImage} 
                        alt="Образец диплома"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === "animals" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">🐾 Конкурсы, посвященные теме животных</h2>
          <div className="space-y-6 max-w-5xl mx-auto">
            {contests.filter(c => c.categoryId === "animals").map((contest) => (
              <Card
                key={contest.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary rounded-3xl"
              >
                <div className="flex flex-col md:flex-row md:h-64">
                  <div className="md:w-64 h-48 md:h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
                  </div>
                  <CardContent className="p-6 flex-[0.6] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-2xl font-heading font-bold text-primary">{contest.title}</h4>
                        {contest.status === "new" && (
                          <Badge className="bg-success text-success-foreground">Новый!</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{contest.description}</p>
                      <button 
                        onClick={() => {
                          if (contest.rulesLink && contest.rulesLink !== '#') {
                            setPdfUrl(contest.rulesLink);
                            setIsPdfModalOpen(true);
                          }
                        }}
                        className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold mb-1"
                      >
                        <Icon name="FileText" size={16} />
                        Положение конкурса
                      </button>
                      <p className="text-sm font-semibold text-success">💰 Стоимость участия: {contest.price} ₽</p>
                    </div>
                    <Button 
                      className="w-full md:w-auto rounded-xl bg-primary hover:bg-primary/90 px-8"
                      onClick={() => {
                        setSelectedContest(contest.title);
                        setIsModalOpen(true);
                      }}
                    >
                      Участвовать
                    </Button>
                  </CardContent>
                  <div className="flex-[0.4] p-3 flex flex-col items-center justify-center border-l">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 text-center">Образец диплома</p>
                    <div 
                      className="w-full flex-1 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                      onClick={() => {
                        setImagePreview(contest.diplomaImage);
                        setIsImageModalOpen(true);
                      }}
                    >
                      <img 
                        src={contest.diplomaImage} 
                        alt="Образец диплома"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSection === "plants" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">🌸 Конкурсы, посвященные теме растений</h2>
          <div className="space-y-6 max-w-5xl mx-auto">
            {contests.filter(c => c.categoryId === "plants").map((contest) => (
              <Card
                key={contest.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary rounded-3xl"
              >
                <div className="flex flex-col md:flex-row md:h-64">
                  <div className="md:w-64 h-48 md:h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
                    <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
                  </div>
                  <CardContent className="p-6 flex-[0.6] flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-2xl font-heading font-bold text-primary">{contest.title}</h4>
                        {contest.status === "new" && (
                          <Badge className="bg-success text-success-foreground">Новый!</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{contest.description}</p>
                      <button 
                        onClick={() => {
                          if (contest.rulesLink && contest.rulesLink !== '#') {
                            setPdfUrl(contest.rulesLink);
                            setIsPdfModalOpen(true);
                          }
                        }}
                        className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold mb-1"
                      >
                        <Icon name="FileText" size={16} />
                        Положение конкурса
                      </button>
                      <p className="text-sm font-semibold text-success">💰 Стоимость участия: {contest.price} ₽</p>
                    </div>
                    <Button 
                      className="w-full md:w-auto rounded-xl bg-primary hover:bg-primary/90 px-8"
                      onClick={() => {
                        setSelectedContest(contest.title);
                        setIsModalOpen(true);
                      }}
                    >
                      Участвовать
                    </Button>
                  </CardContent>
                  <div className="flex-[0.4] p-3 flex flex-col items-center justify-center border-l">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 text-center">Образец диплома</p>
                    <div 
                      className="w-full flex-1 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                      onClick={() => {
                        setImagePreview(contest.diplomaImage);
                        setIsImageModalOpen(true);
                      }}
                    >
                      <img 
                        src={contest.diplomaImage} 
                        alt="Образец диплома"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-heading font-bold text-primary">
              🎨 Оформление заявки на участие
            </DialogTitle>
            <DialogDescription className="text-base">
              Конкурс: <span className="font-semibold text-primary">{selectedContest}</span>
            </DialogDescription>
          </DialogHeader>
          
          <form 
            className="space-y-5 mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              
              if (!uploadedFile) {
                toast({
                  title: "Ошибка",
                  description: "Пожалуйста, загрузите файл работы",
                  variant: "destructive"
                });
                return;
              }
              
              const formData = new FormData(e.currentTarget);
              
              try {
                const reader = new FileReader();
                reader.onload = async () => {
                  const base64File = reader.result?.toString().split(',')[1];
                  
                  const response = await fetch(SUBMIT_APPLICATION_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      full_name: formData.get('fullName'),
                      age: parseInt(formData.get('age') as string),
                      teacher: formData.get('teacher') || null,
                      institution: formData.get('institution') || null,
                      work_title: formData.get('workTitle'),
                      email: formData.get('email'),
                      contest_name: selectedContest,
                      work_file: base64File,
                      file_name: uploadedFile.name,
                      file_type: uploadedFile.type,
                      gallery_consent: formData.get('gallery') === 'on'
                    })
                  });
                  
                  const result = await response.json();
                  
                  if (response.ok) {
                    toast({
                      title: "Заявка отправлена!",
                      description: `Ваша работа "${uploadedFile.name}" успешно отправлена на конкурс!`,
                    });
                    setIsModalOpen(false);
                    setUploadedFile(null);
                    e.currentTarget.reset();
                  } else {
                    toast({
                      title: "Ошибка",
                      description: result.error || "Не удалось отправить заявку",
                      variant: "destructive"
                    });
                  }
                };
                
                reader.readAsDataURL(uploadedFile);
              } catch (error) {
                toast({
                  title: "Ошибка",
                  description: "Произошла ошибка при отправке заявки",
                  variant: "destructive"
                });
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-semibold">ФИО *</Label>
              <Input 
                id="fullName"
                name="fullName"
                placeholder="Введите ФИО участника" 
                required 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-base font-semibold">Возраст *</Label>
              <Input 
                id="age"
                name="age"
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
                name="teacher"
                placeholder="ФИО педагога (если есть)" 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution" className="text-base font-semibold">Учреждение</Label>
              <Input 
                id="institution"
                name="institution"
                placeholder="Название школы, студии или учреждения" 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workTitle" className="text-base font-semibold">Название творческой работы *</Label>
              <Input 
                id="workTitle"
                name="workTitle"
                placeholder="Введите название работы" 
                required 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Электронная почта *</Label>
              <Input 
                id="email"
                name="email"
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
                  className="rounded-xl border-2 focus:border-primary h-10 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:cursor-pointer hover:file:bg-primary/90"
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
                <Checkbox id="gallery" name="gallery" required className="mt-1" />
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

      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0 overflow-hidden rounded-3xl">
          <div className="relative w-full h-[90vh] bg-white">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 rounded-full shadow-lg"
              onClick={() => setIsPdfModalOpen(false)}
            >
              <Icon name="X" size={24} />
            </Button>
            {pdfUrl && (
              <iframe 
                src={pdfUrl}
                className="w-full h-full"
                title="Положение конкурса"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-t border-primary/10 py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="mb-6">
                <img 
                  src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/2aa89901-38a4-48dd-b954-f55aec2d1508.png" 
                  alt="Мечтай, твори, дерзай!" 
                  className="h-32 w-auto object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Студия талантов для юных художников и творцов
              </p>
            </div>
            
            <div>
              <h3 className="font-heading font-bold text-lg mb-4 text-primary">Навигация</h3>
              <nav className="space-y-3">
                <button
                  onClick={() => setActiveSection('home')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <Icon name="Home" size={16} />
                  Главная
                </button>
                <button
                  onClick={() => setActiveSection('contests')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <Icon name="Trophy" size={16} />
                  Все конкурсы
                </button>
                <button
                  onClick={() => setActiveSection('documents')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <Icon name="FileText" size={16} />
                  Документы
                </button>
                <button
                  onClick={() => setActiveSection('results')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <Icon name="Award" size={16} />
                  Итоги
                </button>
                <button
                  onClick={() => setActiveSection('shop')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <Icon name="ShoppingBag" size={16} />
                  Магазин
                </button>
                <button
                  onClick={() => setActiveSection('reviews')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <Icon name="MessageSquare" size={16} />
                  Отзывы
                </button>
                <button
                  onClick={() => setActiveSection('about')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <Icon name="Info" size={16} />
                  О нас
                </button>
              </nav>
            </div>
            
            <div>
              <h3 className="font-heading font-bold text-lg mb-4 text-primary">Контакты</h3>
              <div className="space-y-3">
                <a 
                  href="https://студия-талантов.рф" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon name="Globe" size={16} />
                  студия-талантов.рф
                </a>
                <a 
                  href="mailto:studio-talantov@yandex.ru"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon name="Mail" size={16} />
                  studio-talantov@yandex.ru
                </a>
                <a 
                  href="tel:+79082433179"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon name="Phone" size={16} />
                  +7 (908) 243-31-79
                </a>
                <a 
                  href="https://vk.com/studio.talantov" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon name="MessageCircle" size={16} />
                  VK: studio.talantov
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-heading font-bold text-lg mb-4 text-primary">Реквизиты</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  <span className="font-semibold text-foreground">Организатор:</span><br />
                  Мозжерина Анна Владимировна
                </p>
                <p className="flex items-center gap-2">
                  <Icon name="FileText" size={14} className="flex-shrink-0" />
                  <span><span className="font-semibold">ИНН:</span> 590772408853</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary/10 pt-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2026 Студия талантов "Мечтай, твори, дерзай!". Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;