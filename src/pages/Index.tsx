import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

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
  isPopular?: boolean;
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
  diploma_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

interface GalleryWork {
  id: number;
  full_name: string;
  age: number | null;
  work_title: string;
  contest_name: string;
  work_file_url: string;
  result: 'grand_prix' | 'first_degree' | 'second_degree' | 'third_degree' | 'participant';
  created_at: string;
}

interface Review {
  id: number;
  author_name: string;
  author_role: string | null;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  published_at: string | null;
}

const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
const SUBMIT_APPLICATION_URL = "https://functions.poehali.dev/2d352955-9c6c-4bbb-ad1e-944c7ea04d84";
const GALLERY_API_URL = "https://functions.poehali.dev/eddc53e6-7462-4e4b-95fe-3b3ce3e6f95a";
const REVIEWS_API_URL = "https://functions.poehali.dev/3daafc39-174c-4669-8e8a-71172a246929";
const PAYMENT_API_URL = "https://functions.poehali.dev/f40bd7c6-a503-4165-8673-e8091832d07c";
const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
const UPLOAD_PRESIGNED_URL = "https://functions.poehali.dev/be7b31ca-63ff-4082-9667-d4ab8c4c7f94";

const Index = () => {
  const [searchParams] = useSearchParams();
  const initialSection = searchParams.get('section') || 'home';
  const categoryParam = searchParams.get('category');
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [applicationFormUrl, setApplicationFormUrl] = useState<string | null>(null);
  const [showContestsDropdown, setShowContestsDropdown] = useState(false);
  const [contestFilter, setContestFilter] = useState<string | null>(categoryParam);
  const [contests, setContests] = useState<Contest[]>([]);
  const [results, setResults] = useState<PublicResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<PublicResult[]>([]);
  const [galleryWorks, setGalleryWorks] = useState<GalleryWork[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [resultFilters, setResultFilters] = useState({
    contest: '',
    fullName: '',
    result: 'all',
    date: undefined as Date | undefined
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
    if (categoryParam) {
      setActiveSection('contests');
      setContestFilter(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(SETTINGS_API_URL);
        const data = await response.json();
        if (data.application_form_url) {
          setApplicationFormUrl(data.application_form_url);
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const loadGalleryWorks = async () => {
      try {
        const response = await fetch(GALLERY_API_URL);
        const data = await response.json();
        setGalleryWorks(data);
      } catch (error) {
        console.error('Ошибка загрузки работ галереи:', error);
      }
    };
    if (activeSection === 'gallery' || activeSection === 'home') {
      loadGalleryWorks();
    }
  }, [activeSection]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch(`${REVIEWS_API_URL}?status=approved`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
      }
    };
    if (activeSection === 'reviews') {
      loadReviews();
    }
  }, [activeSection]);

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

    if (resultFilters.date) {
      filtered = filtered.filter(r => {
        if (!r.diploma_issued_at) return false;
        const resultDate = new Date(r.diploma_issued_at);
        const filterDate = new Date(resultFilters.date!);
        return resultDate.toDateString() === filterDate.toDateString();
      });
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
    { id: "designer", label: "Услуги дизайнера", icon: "PenTool" },
    { id: "about", label: "О нас", icon: "Users" },
  ];

  const contestCategories = [
    { id: "visual-arts", label: "Конкурсы изобразительного искусства", icon: "Palette", heading: "Конкурсы изобразительного искусства" },
    { id: "decorative-arts", label: "Конкурсы декоративно-прикладного искусства", icon: "Scissors", heading: "Конкурсы декоративно-прикладного искусства" },
    { id: "nature", label: "Конкурсы, посвященные теме природы", icon: "TreePine", heading: "Конкурсы о природе" },
    { id: "animals", label: "Конкурсы, посвященные теме животных", icon: "PawPrint", heading: "Конкурсы о животных" },
    { id: "plants", label: "Конкурсы, посвященные теме растений", icon: "Flower2", heading: "Конкурсы о растениях" },
    { id: "holidays", label: "Конкурсы, посвященные теме праздников", icon: "PartyPopper", heading: "Праздничные конкурсы" },
    { id: "thematic", label: "Тематические конкурсы ИЗО и творчества", icon: "Sparkles", heading: "Тематические конкурсы" },
  ];

  const getCategoryIcon = (categoryId: string) => {
    const category = contestCategories.find(cat => cat.id === categoryId);
    return category?.icon || "Trophy";
  };

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
            <p className="max-w-4xl mx-auto mb-8 py-[3px] text-xl font-normal text-center text-slate-600">Кот Ван Гог и студия талантов "Мечтай, твори, дерзай!" приглашают учащихся и педагогов художественных школ и студий, художников‑любителей и профессионалов, а также всех, кто любит творить и хочет представить свои работы широкой аудитории к участию во Всероссийских конкурсах изобразительного и декоративно-прикладного искусства!</p>
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

          <section className="mb-16">
            <h3 className="text-4xl font-heading font-bold text-center mb-8 text-secondary">⭐ Популярные конкурсы</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {contests.filter(c => c.isPopular).map((contest) => (
                <Card
                  key={contest.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl cursor-pointer"
                  onClick={() => {
                    setSelectedContest(contest.title);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="h-56 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center">
                    <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-lg font-heading font-bold mb-2">{contest.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{contest.description}</p>
                    <p className="text-sm font-semibold text-success">💰 {contest.price} ₽</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h3 className="text-4xl font-heading font-bold text-center mb-12 text-primary">🌟 Почему выбирают нас?</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Icon name="Award" className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-heading font-bold text-center mb-3 text-primary">Официальные дипломы</h4>
                <p className="text-center text-muted-foreground">
                  Каждый участник получает красочный диплом в электронном виде — отличное пополнение портфолио! Дипломы соответствуют требованиям для школьных конкурсов и мероприятий.
                </p>
              </Card>

              <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Icon name="Zap" className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-heading font-bold text-center mb-3 text-secondary">Быстрые результаты</h4>
                <p className="text-center text-muted-foreground">Итоги конкурсов публикуются в течение 1-2 дней после принятия заявки на участие. </p>
              </Card>

              <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Icon name="Trophy" className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-heading font-bold text-center mb-3 text-accent">Широкий выбор номинаций</h4>
                <p className="text-center text-muted-foreground">
                  Более 50 различных конкурсов по изобразительному искусству, декоративно-прикладному творчеству, тематическим направлениям — каждый найдет что-то своё!
                </p>
              </Card>

              <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-success to-info rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Icon name="Wallet" className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-heading font-bold text-center mb-3 text-success">Доступная стоимость</h4>
                <p className="text-center text-muted-foreground">Всего 200 ₽ за участие. Никаких скрытых платежей — стоимость фиксирована и указана заранее.</p>
              </Card>

              <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-info to-primary rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Icon name="Users" className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-heading font-bold text-center mb-3 text-info">Для всех возрастов</h4>
                <p className="text-center text-muted-foreground">
                  Принимаем работы детей, подростков и взрослых. Участвовать могут и учащиеся художественных школ, и любители творчества!
                </p>
              </Card>

              <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-success rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Icon name="Smartphone" className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-heading font-bold text-center mb-3 text-primary">Удобная подача работ</h4>
                <p className="text-center text-muted-foreground">Заполните простую форму, загрузите фото работы — и готово! </p>
              </Card>
            </div>
          </section>

          <section>
            <h3 className="text-4xl font-heading font-bold text-center mb-8 text-secondary">🎨 Галерея лучших работ</h3>
            <div className="grid md:grid-cols-4 gap-6">
              {galleryWorks.filter(w => w.result === 'grand_prix' || w.result === 'first_degree').slice(0, 8).map((work) => (
                <Card
                  key={work.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl cursor-pointer"
                  onClick={() => {
                    setImagePreview(work.work_file_url);
                    setIsImageModalOpen(true);
                  }}
                >
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={work.work_file_url} 
                      alt={work.work_title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="text-base font-heading font-bold mb-1">{work.work_title}</h4>
                    <p className="text-xs text-muted-foreground mb-1">👤 {work.full_name}{work.age ? `, ${work.age} лет` : ''}</p>
                    <p className="text-xs text-muted-foreground">🏆 {work.contest_name}</p>
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

          <div className="mb-6 max-w-5xl mx-auto">
            {contestFilter === null ? (
              <h3 className="text-3xl font-heading font-bold text-center text-primary" data-editable="contest-heading-all">Всероссийские конкурсы изобразительного и 
декоративно-прикладного искусства</h3>
            ) : contestFilter === "visual-arts" ? (
              <h3 className="text-3xl font-heading font-bold text-center text-primary" data-editable="contest-heading-visual-arts">Всероссийские конкурсы изобразительного искусства</h3>
            ) : contestFilter === "decorative-arts" ? (
              <h3 className="text-3xl font-heading font-bold text-center text-primary" data-editable="contest-heading-decorative-arts">Всероссийские конкурсы декоративно-прикладного искусства</h3>
            ) : contestFilter === "nature" ? (
              <h3 className="text-3xl font-heading font-bold text-center text-primary" data-editable="contest-heading-nature">Всероссийские конкурсы изобразительного и декоративно-прикладного искусства, посвященные теме природы</h3>
            ) : contestFilter === "animals" ? (
              <h3 className="text-3xl font-heading font-bold text-center text-primary" data-editable="contest-heading-animals">Всероссийские конкурсы изобразительного и декоративно-прикладного искусства, посвященные теме животных</h3>
            ) : contestFilter === "plants" ? (
              <h3 className="text-3xl font-heading font-bold text-center text-primary" data-editable="contest-heading-plants">Всероссийские конкурсы изобразительного и декоративно-прикладного искусства, посвященные теме растений</h3>
            ) : contestFilter === "holidays" ? (
              <h3 className="text-3xl font-heading font-bold text-center text-primary" data-editable="contest-heading-holidays">Всероссийские конкурсы изобразительного и декоративно-прикладного искусства, посвященные теме праздников</h3>
            ) : contestFilter === "thematic" ? (
              <h3 className="text-3xl font-heading font-bold text-center text-primary" data-editable="contest-heading-thematic">Всероссийские тематические конкурсы изобразительного и декоративно-прикладного искусства</h3>
            ) : null}
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
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl cursor-pointer"
                onClick={() => {
                  setImagePreview(work.work_file_url);
                  setIsImageModalOpen(true);
                }}
              >
                <div className="h-56 overflow-hidden">
                  <img 
                    src={work.work_file_url} 
                    alt={work.work_title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h4 className="text-lg font-heading font-bold mb-2">{work.work_title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">👤 {work.full_name}{work.age ? `, ${work.age} лет` : ''}</p>
                  <p className="text-xs text-muted-foreground">🏆 {work.contest_name}</p>
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
            {applicationFormUrl && (
              <a href={applicationFormUrl} download className="block">
                <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-x-2 rounded-2xl cursor-pointer border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                        <Icon name="ClipboardList" className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-heading font-semibold">Лист подачи заявки</h3>
                        <p className="text-sm text-muted-foreground">Бланк заявки для участия в конкурсе (скачать)</p>
                      </div>
                    </div>
                    <Icon name="Download" className="text-primary" size={24} />
                  </div>
                </Card>
              </a>
            )}
            {contests
              .filter(c => c.rulesLink && c.rulesLink !== '#')
              .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
              .map((contest, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-x-2 rounded-2xl cursor-pointer"
                onClick={() => {
                  setPdfUrl(contest.rulesLink);
                  setIsPdfModalOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-info to-success rounded-xl flex items-center justify-center">
                      <Icon name="FileText" className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-heading font-semibold">{contest.title} - положение</h3>
                  </div>
                  <Icon name="ExternalLink" className="text-info" size={24} />
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
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Дата вручения</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      {resultFilters.date ? format(resultFilters.date, 'dd.MM.yyyy', { locale: ru }) : 'Выберите дату'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={resultFilters.date}
                      onSelect={(date) => setResultFilters({...resultFilters, date: date})}
                      locale={ru}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
                <div className="hidden md:grid gap-4 p-4 bg-gray-50 border-b font-semibold text-sm" style={{gridTemplateColumns: '120px 2fr 60px 1.5fr 1.5fr 1.5fr 2.5fr'}}>
                  <div>Дата вручения</div>
                  <div>ФИО участника</div>
                  <div>Возраст</div>
                  <div>Конкурс</div>
                  <div>Результат</div>
                  <div>Педагог</div>
                  <div>Учреждение</div>
                </div>
                
                <div className="divide-y">
                  {filteredResults.map((result, index) => (
                    <div key={result.id} className="grid gap-4 p-4 hover:bg-gray-50 transition-colors md:grid-cols-[120px_2fr_60px_1.5fr_1.5fr_1.5fr_2.5fr]">
                      <div className="text-sm">
                        <span className="md:hidden font-semibold text-muted-foreground">Дата вручения: </span>
                        {result.diploma_issued_at ? new Date(result.diploma_issued_at).toLocaleDateString('ru-RU') : '—'}
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
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">🛍️ Магазин наградной атрибутики</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden rounded-3xl shadow-2xl border-2 border-primary/20">
              <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-12 text-center">
                <div className="mb-8">
                  <Icon name="Award" className="mx-auto text-primary mb-4" size={80} />
                </div>
                <h3 className="text-3xl font-heading font-bold text-primary mb-6">
                  Скоро открытие!
                </h3>
                <div className="max-w-2xl mx-auto space-y-4 text-lg text-muted-foreground leading-relaxed">
                  <p>
                    Мы рады сообщить, что в ближайшее время в нашем магазине появится возможность 
                    заказать <span className="font-semibold text-primary">наградную атрибутику</span> для 
                    юных победителей!
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-8 text-left">
                    <div className="flex items-start gap-3">
                      <Icon name="Trophy" className="text-primary flex-shrink-0 mt-1" size={24} />
                      <div>
                        <p className="font-semibold text-primary">Кубки и медали</p>
                        <p className="text-sm text-muted-foreground">Именные награды для настоящих победителей</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Award" className="text-primary flex-shrink-0 mt-1" size={24} />
                      <div>
                        <p className="font-semibold text-primary">Оригиналы дипломов</p>
                        <p className="text-sm text-muted-foreground">Красочные дипломы с печатью и подписью</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="Medal" className="text-primary flex-shrink-0 mt-1" size={24} />
                      <div>
                        <p className="font-semibold text-primary">Памятные награды</p>
                        <p className="text-sm text-muted-foreground">Значки, ленты и другая атрибутика</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Icon name="FileText" className="text-primary flex-shrink-0 mt-1" size={24} />
                      <div>
                        <p className="font-semibold text-primary">Благодарственные письма</p>
                        <p className="text-sm text-muted-foreground">Для педагогов и родителей</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-primary/20">
                    <p className="text-base">
                      Следите за обновлениями! Уже совсем скоро вы сможете увековечить достижения 
                      ваших талантливых детей с помощью качественной наградной продукции.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeSection === "reviews" && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">💬 Отзывы</h2>
          
          <div className="max-w-2xl mx-auto mb-12">
            <Card className="p-8 rounded-3xl shadow-2xl border-2 border-primary/20">
              <h3 className="text-2xl font-heading font-bold text-primary mb-6 text-center">Оставьте свой отзыв</h3>
              <p className="text-center text-muted-foreground mb-6">Поделитесь своим мнением о работе нашей студии. Все отзывы проходят модерацию перед публикацией.</p>
              <Button 
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-lg py-6"
              >
                <Icon name="MessageSquare" className="mr-2" />
                Написать отзыв
              </Button>
            </Card>
          </div>

          <div className="max-w-5xl mx-auto">
            {reviews.length === 0 ? (
              <Card className="p-12 rounded-3xl text-center">
                <Icon name="MessageSquare" size={64} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">Пока нет опубликованных отзывов</p>
                <p className="text-sm text-muted-foreground mt-2">Станьте первым, кто поделится мнением!</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <Card key={review.id} className="p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Icon key={i} name="Star" className="text-secondary fill-secondary" size={20} />
                      ))}
                    </div>
                    <p className="text-lg mb-4 italic">"{review.text}"</p>
                    <div>
                      <p className="font-semibold text-primary">{review.author_name}</p>
                      {review.author_role && (
                        <p className="text-sm text-muted-foreground">{review.author_role}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
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

      {activeSection === "designer" && (
        <div className="min-h-screen">
          <div className="relative overflow-hidden py-20" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
                  <Icon name="PenTool" size={16} className="mr-2" />
                  Профессиональный дизайн
                </Badge>
                <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
                  Услуги дизайнера
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-4 leading-relaxed">
                  Нужна яркая афиша или официальный диплом для мероприятия?
                </p>
                <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                  Разработаем дизайн анонсов, афиш, грамот, дипломов и благодарственных писем под ваши задачи. Для музыкальных школ, концертных залов, домов культуры и творческих организаций.
                </p>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Что мы создаём</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Предоставляем услуги по созданию дизайн-макетов официальной и рекламной полиграфии для мероприятий любого масштаба
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/7f67c92e-7c9f-4693-9b5c-92d2659ee74a.jpg"); setIsImageModalOpen(true); }}>
                    <img 
                      src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/7f67c92e-7c9f-4693-9b5c-92d2659ee74a.jpg" 
                      alt="Афиши и анонсы" 
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon name="Megaphone" size={20} className="text-primary" />
                      </div>
                      <h3 className="text-xl font-heading font-bold">Афиши и анонсы</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Яркие, привлекающие внимание афиши для концертов, фестивалей, отчётных выступлений и творческих вечеров. Анонсы мероприятий для социальных сетей и печати.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/0759c799-d612-4cdf-9c5f-89383ed43558.jpg"); setIsImageModalOpen(true); }}>
                    <img 
                      src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/0759c799-d612-4cdf-9c5f-89383ed43558.jpg" 
                      alt="Дипломы и грамоты" 
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <Icon name="Award" size={20} className="text-secondary" />
                      </div>
                      <h3 className="text-xl font-heading font-bold">Дипломы и грамоты</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Официальные дипломы лауреатов, почётные грамоты для победителей конкурсов и участников мероприятий. Индивидуальный дизайн с учётом фирменного стиля вашей организации.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/1d0a1cce-ff11-4433-a55c-79a222878f38.jpg"); setIsImageModalOpen(true); }}>
                    <img 
                      src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/1d0a1cce-ff11-4433-a55c-79a222878f38.jpg" 
                      alt="Благодарственные письма" 
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                        <Icon name="Heart" size={20} className="text-accent" />
                      </div>
                      <h3 className="text-xl font-heading font-bold">Благодарственные письма</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Элегантные благодарственные письма для педагогов, спонсоров, партнёров и организаторов. Торжественное оформление, подчёркивающее значимость вклада каждого.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/c7540fd7-567e-45e1-b1c5-b48bdda48180.jpg"); setIsImageModalOpen(true); }}>
                    <img 
                      src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/c7540fd7-567e-45e1-b1c5-b48bdda48180.jpg" 
                      alt="Программки" 
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
                        <Icon name="BookOpen" size={20} className="text-info" />
                      </div>
                      <h3 className="text-xl font-heading font-bold">Программки</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Красочные программки для концертов, фестивалей и творческих вечеров. Удобный формат с расписанием выступлений, информацией об участниках и организаторах.
                    </p>
                  </CardContent>
                </Card>

                <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/66a65365-9ded-4574-b8d8-27565e077116.jpg"); setIsImageModalOpen(true); }}>
                    <img 
                      src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/66a65365-9ded-4574-b8d8-27565e077116.jpg" 
                      alt="Сертификаты" 
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                        <Icon name="BadgeCheck" size={20} className="text-success" />
                      </div>
                      <h3 className="text-xl font-heading font-bold">Сертификаты</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Профессиональные сертификаты для участников мастер-классов, семинаров и курсов повышения квалификации. Солидное оформление с логотипами организаций.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl p-8 md:p-12 mb-20">
                <h2 className="text-3xl font-heading font-bold text-center mb-12">Для кого наши услуги</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 bg-white/80 rounded-2xl p-6 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name="Music" size={24} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-1">Музыкальные школы</h3>
                      <p className="text-muted-foreground">Афиши отчётных концертов, дипломы выпускников, грамоты для конкурсантов</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/80 rounded-2xl p-6 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="Building2" size={24} className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-1">Концертные залы</h3>
                      <p className="text-muted-foreground">Программки, плакаты, пригласительные билеты для концертов и представлений</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/80 rounded-2xl p-6 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="Landmark" size={24} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-1">Дома культуры и творчества</h3>
                      <p className="text-muted-foreground">Рекламные материалы для кружков, секций, фестивалей и праздничных мероприятий</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-white/80 rounded-2xl p-6 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="GraduationCap" size={24} className="text-info" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-1">Образовательные учреждения</h3>
                      <p className="text-muted-foreground">Дипломы олимпиад, благодарности педагогам, оформление школьных мероприятий</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-20">
                <h2 className="text-3xl font-heading font-bold text-center mb-12">Почему выбирают нас</h2>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon name="Palette" size={32} className="text-primary" />
                    </div>
                    <h3 className="font-heading font-bold mb-2">Уникальный дизайн</h3>
                    <p className="text-sm text-muted-foreground">Каждый макет создаётся индивидуально, никаких шаблонных решений</p>
                  </div>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <Icon name="Clock" size={32} className="text-secondary" />
                    </div>
                    <h3 className="font-heading font-bold mb-2">Быстрые сроки</h3>
                    <p className="text-sm text-muted-foreground">Готовый макет от 1 рабочего дня. Срочные заказы — в день обращения</p>
                  </div>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                      <Icon name="RefreshCw" size={32} className="text-accent" />
                    </div>
                    <h3 className="font-heading font-bold mb-2">Правки включены</h3>
                    <p className="text-sm text-muted-foreground">Вносим корректировки до полного согласования результата</p>
                  </div>
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-4">
                      <Icon name="FileCheck" size={32} className="text-success" />
                    </div>
                    <h3 className="font-heading font-bold mb-2">Готово к печати</h3>
                    <p className="text-sm text-muted-foreground">Передаём файлы в форматах для типографии и цифрового использования</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-3xl p-8 md:p-12 text-center text-white">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Готовы обсудить ваш проект?</h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Свяжитесь с нами — расскажите о вашем мероприятии, и мы предложим лучшее решение по дизайну полиграфии
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <a href="mailto:sidio-talantov@yandex.ru">
                    <Button size="lg" className="text-lg px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl">
                      <Icon name="Mail" className="mr-2" size={20} />
                      Написать на почту
                    </Button>
                  </a>
                  <a href="https://vk.com/studio.talantov" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="text-lg px-8 py-6 rounded-2xl bg-[#0077FF] hover:bg-[#0066DD] text-white shadow-xl">
                      <Icon name="MessageCircle" className="mr-2" size={20} />
                      Написать в ВК
                    </Button>
                  </a>
                  <a href="tel:+79082433179">
                    <Button size="lg" className="text-lg px-8 py-6 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-xl">
                      <Icon name="Phone" className="mr-2" size={20} />
                      Позвонить
                    </Button>
                  </a>
                </div>
              </div>
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
              const contestPrice = contests.find(c => c.title === selectedContest)?.price || 300;
              
              try {
                setIsUploading(true);
                setUploadProgress(10);

                const CHUNK_SIZE = 2 * 1024 * 1024;
                const totalChunks = Math.ceil(uploadedFile.size / CHUNK_SIZE);
                let uploadId = '';
                let file_url = '';

                for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                  const start = chunkIndex * CHUNK_SIZE;
                  const end = Math.min(start + CHUNK_SIZE, uploadedFile.size);
                  const chunk = uploadedFile.slice(start, end);

                  const chunkBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = reader.result as string;
                      resolve(result.split(',')[1]);
                    };
                    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
                    reader.readAsDataURL(chunk);
                  });

                  const chunkProgress = 10 + Math.round((chunkIndex / totalChunks) * 70);
                  setUploadProgress(chunkProgress);

                  const uploadResponse = await fetch("https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      chunk: chunkBase64,
                      chunkIndex,
                      totalChunks,
                      fileName: uploadedFile.name,
                      fileType: uploadedFile.type,
                      folder: 'works',
                      uploadId: uploadId || undefined
                    })
                  });

                  if (!uploadResponse.ok) {
                    throw new Error('Не удалось загрузить файл');
                  }

                  const result = await uploadResponse.json();
                  
                  if (!uploadId) {
                    uploadId = result.uploadId;
                  }

                  if (result.complete) {
                    file_url = result.url;
                  }
                }

                setUploadProgress(85);

                const applicationData = {
                  full_name: formData.get('fullName'),
                  age: parseInt(formData.get('age') as string),
                  teacher: formData.get('teacher') || null,
                  institution: formData.get('institution') || null,
                  work_title: formData.get('workTitle'),
                  email: formData.get('email'),
                  contest_name: selectedContest,
                  work_file_url: file_url,
                  gallery_consent: formData.get('gallery') === 'on'
                };

                const paymentResponse = await fetch(PAYMENT_API_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    amount: contestPrice,
                    description: `Оплата участия в конкурсе "${selectedContest}"`,
                    contest_name: selectedContest,
                    email: formData.get('email'),
                    application_data: applicationData
                  })
                });

                const paymentResult = await paymentResponse.json();

                setUploadProgress(100);
                setIsUploading(false);

                if (paymentResponse.ok && paymentResult.confirmation_url) {
                  window.location.href = paymentResult.confirmation_url;
                } else {
                  toast({
                    title: "Ошибка оплаты",
                    description: paymentResult.error || "Не удалось создать платёж",
                    variant: "destructive"
                  });
                }
              } catch (error) {
                setIsUploading(false);
                setUploadProgress(0);
                console.error('Ошибка при подаче заявки:', error);
                toast({
                  title: "Ошибка",
                  description: error instanceof Error ? error.message : "Произошла ошибка при загрузке файла или создании платежа",
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
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const maxSize = 15 * 1024 * 1024; // 15 МБ
                      if (file.size > maxSize) {
                        toast({
                          title: "Файл слишком большой",
                          description: `Максимальный размер файла — 15 МБ. Ваш файл: ${(file.size / 1024 / 1024).toFixed(1)} МБ`,
                          variant: "destructive"
                        });
                        e.target.value = '';
                        setUploadedFile(null);
                        return;
                      }
                      setUploadedFile(file);
                    } else {
                      setUploadedFile(null);
                    }
                  }}
                  className="rounded-xl border-2 focus:border-primary h-10 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:cursor-pointer hover:file:bg-primary/90"
                />
              </div>
              {uploadedFile && !isUploading && (
                <div className="flex items-center gap-2 p-3 bg-success/10 rounded-xl text-sm">
                  <Icon name="CheckCircle" className="text-success" size={20} />
                  <span className="text-success font-semibold">Файл выбран: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(1)} МБ)</span>
                </div>
              )}
              {isUploading && (
                <div className="space-y-2 p-3 bg-primary/10 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">Загрузка файла...</span>
                    <span className="text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Форматы: JPG, PNG, PDF (макс. 15 МБ)</p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3 p-3 bg-accent/10 rounded-xl">
                <Checkbox id="gallery" name="gallery" className="mt-1" />
                <Label htmlFor="gallery" className="text-sm leading-relaxed cursor-pointer">
                  Согласен на публикацию работы в галерее сайта
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
              disabled={isUploading}
              className="w-full text-lg py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" />
                  Загрузка файла {uploadProgress}%
                </>
              ) : (
                <>
                  <Icon name="CreditCard" className="mr-2" />
                  Оплатить и подать заявку
                </>
              )}
            </Button>

            <div className="mt-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Если у Вас возникли проблемы с подачей заявки, Вы можете отправить пакет документов (
                {applicationFormUrl ? (
                  <a 
                    href={applicationFormUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    заполненный лист подачи заявки
                  </a>
                ) : (
                  <span className="font-semibold">заполненный лист подачи заявки</span>
                )}, квитанцию об оплате орг. взноса, фото работы) на электронную почту{' '}
                <a 
                  href="mailto:studio-talantov@yandex.ru" 
                  className="text-primary hover:underline font-semibold"
                >
                  studio-talantov@yandex.ru
                </a>
              </p>
            </div>
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

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-heading font-bold text-primary">
              ✍️ Напишите отзыв
            </DialogTitle>
            <DialogDescription className="text-base">
              Ваш отзыв будет опубликован после проверки модератором
            </DialogDescription>
          </DialogHeader>
          
          <form 
            className="space-y-5 mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              try {
                const response = await fetch(REVIEWS_API_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    author_name: formData.get('author_name'),
                    author_role: formData.get('author_role') || null,
                    rating: parseInt(formData.get('rating') as string),
                    text: formData.get('text')
                  })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                  toast({
                    title: "Отзыв отправлен!",
                    description: "Ваш отзыв будет опубликован после модерации. Спасибо!",
                  });
                  setIsReviewModalOpen(false);
                  e.currentTarget.reset();
                } else {
                  toast({
                    title: "Ошибка",
                    description: result.error || "Не удалось отправить отзыв",
                    variant: "destructive"
                  });
                }
              } catch (error) {
                toast({
                  title: "Ошибка",
                  description: "Произошла ошибка при отправке отзыва",
                  variant: "destructive"
                });
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="author_name" className="text-base font-semibold">Ваше имя *</Label>
              <Input 
                id="author_name"
                name="author_name"
                placeholder="Как вас зовут?" 
                required 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author_role" className="text-base font-semibold">Ваша роль</Label>
              <Input 
                id="author_role"
                name="author_role"
                placeholder="Например: Мама участника, Педагог, и т.д." 
                className="rounded-xl border-2 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating" className="text-base font-semibold">Оценка *</Label>
              <Select name="rating" required>
                <SelectTrigger className="rounded-xl border-2 focus:border-primary">
                  <SelectValue placeholder="Выберите оценку" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ Отлично</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ Хорошо</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ Нормально</SelectItem>
                  <SelectItem value="2">⭐⭐ Плохо</SelectItem>
                  <SelectItem value="1">⭐ Ужасно</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text" className="text-base font-semibold">Ваш отзыв *</Label>
              <textarea 
                id="text"
                name="text"
                placeholder="Расскажите о вашем опыте участия в конкурсах студии..."
                required
                rows={6}
                className="flex min-h-[120px] w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full text-lg py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              <Icon name="Send" className="mr-2" />
              Отправить отзыв
            </Button>
          </form>
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
                <button
                  onClick={() => setActiveSection('designer')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left"
                >
                  <Icon name="PenTool" size={16} />
                  Услуги дизайнера
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