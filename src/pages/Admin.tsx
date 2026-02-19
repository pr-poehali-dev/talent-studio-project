import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Contest {
  id?: number;
  title: string;
  description: string;
  categoryId: string;
  deadline: string;
  price: number;
  status: string;
  rulesLink: string;
  diplomaImage: string;
  image: string;
  isPopular?: boolean;
}

interface Application {
  id: number;
  full_name: string;
  age: number;
  teacher: string | null;
  institution: string | null;
  work_title: string;
  email: string;
  contest_id: number | null;
  contest_name: string;
  work_file_url: string;
  status: 'new' | 'viewed' | 'sent';
  result: 'grand_prix' | 'first_degree' | 'second_degree' | 'third_degree' | 'participant' | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Result {
  id: number;
  application_id: number | null;
  full_name: string;
  age: number | null;
  teacher: string | null;
  institution: string | null;
  work_title: string | null;
  email: string | null;
  contest_id: number | null;
  contest_name: string | null;
  work_file_url: string | null;
  result: string | null;
  place: number | null;
  score: number | null;
  diploma_url: string | null;
  notes: string | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Review {
  id: number;
  author_name: string;
  author_role: string | null;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
const RESULTS_API_URL = "https://functions.poehali.dev/e1f9698c-ec8a-4b24-89c2-72bb579d7f9b";
const APPLICATIONS_API_URL = "https://functions.poehali.dev/ff2c7334-750b-418e-8468-152fae1d68ef";
const SUBMIT_APPLICATION_URL = "https://functions.poehali.dev/2d352955-9c6c-4bbb-ad1e-944c7ea04d84";
const REVIEWS_API_URL = "https://functions.poehali.dev/3daafc39-174c-4669-8e8a-71172a246929";
const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<'contests' | 'applications' | 'results' | 'reviews' | 'settings'>('contests');
  const [applicationsSubTab, setApplicationsSubTab] = useState<'active' | 'trash'>('active');
  const [contests, setContests] = useState<Contest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deletedApplications, setDeletedApplications] = useState<Application[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [applicationsWithResults, setApplicationsWithResults] = useState<Set<number>>(new Set());
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [resultFilters, setResultFilters] = useState({
    contest_name: '',
    full_name: '',
    result: 'all',
    date: undefined as Date | undefined
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [appStatus, setAppStatus] = useState<'new' | 'viewed' | 'sent'>('new');
  const [appResult, setAppResult] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'viewed' | 'sent'>('all');
  const [workPreview, setWorkPreview] = useState<string | null>(null);
  const [isWorkPreviewOpen, setIsWorkPreviewOpen] = useState(false);
  const [formData, setFormData] = useState<Contest>({
    title: "",
    description: "",
    categoryId: "visual-arts",
    deadline: "",
    price: 200,
    status: "active",
    rulesLink: "#",
    diplomaImage: "",
    image: ""
  });
  const [uploadingRules, setUploadingRules] = useState(false);
  const [uploadingDiploma, setUploadingDiploma] = useState(false);
  const [uploadingAppForm, setUploadingAppForm] = useState(false);
  const [applicationFormUrl, setApplicationFormUrl] = useState<string>('');
  const [isManualAppModalOpen, setIsManualAppModalOpen] = useState(false);
  const [manualAppFile, setManualAppFile] = useState<File | null>(null);
  const [manualContestName, setManualContestName] = useState("");
  const [submittingManualApp, setSubmittingManualApp] = useState(false);
  const [manualAppUploadProgress, setManualAppUploadProgress] = useState(0);
  const { toast } = useToast();

  const categories = [
    { id: "visual-arts", name: "Конкурсы изобразительного искусства" },
    { id: "decorative-arts", name: "Конкурсы декоративно-прикладного искусства" },
    { id: "nature", name: "Конкурсы, посвященные теме природы" },
    { id: "animals", name: "Конкурсы, посвященные теме животных" },
    { id: "plants", name: "Конкурсы, посвященные теме растений" },
    { id: "holidays", name: "Конкурсы, посвященные теме праздников" },
    { id: "thematic", name: "Тематические конкурсы ИЗО и творчества" }
  ];

  const loadContests = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setContests(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить конкурсы",
        variant: "destructive"
      });
    }
  };

  const loadApplications = async () => {
    try {
      const response = await fetch(APPLICATIONS_API_URL);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заявки",
        variant: "destructive"
      });
    }
  };

  const loadDeletedApplications = async () => {
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?deleted=true`);
      const data = await response.json();
      setDeletedApplications(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить корзину",
        variant: "destructive"
      });
    }
  };

  const loadResults = async () => {
    try {
      const response = await fetch(RESULTS_API_URL);
      const data = await response.json();
      setResults(data);
      
      const appIds = new Set(data.filter((r: Result) => r.application_id).map((r: Result) => r.application_id));
      setApplicationsWithResults(appIds);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить результаты",
        variant: "destructive"
      });
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`${REVIEWS_API_URL}?status=all`);
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить отзывы",
        variant: "destructive"
      });
    }
  };

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

  useEffect(() => {
    if (isAuthenticated) {
      loadContests();
      loadApplications();
      loadDeletedApplications();
      loadResults();
      loadReviews();
      loadSettings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = [...results];

    if (resultFilters.contest_name) {
      filtered = filtered.filter(r => 
        r.contest_name?.toLowerCase().includes(resultFilters.contest_name.toLowerCase())
      );
    }

    if (resultFilters.full_name) {
      filtered = filtered.filter(r => 
        r.full_name?.toLowerCase().includes(resultFilters.full_name.toLowerCase())
      );
    }

    if (resultFilters.result !== 'all') {
      filtered = filtered.filter(r => r.result === resultFilters.result);
    }

    if (resultFilters.date) {
      filtered = filtered.filter(r => {
        if (!r.created_at) return false;
        const resultDate = new Date(r.created_at);
        const filterDate = new Date(resultFilters.date!);
        return resultDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredResults(filtered);
  }, [results, resultFilters]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Вход выполнен",
        description: "Добро пожаловать в админ-панель!",
      });
    } else {
      toast({
        title: "Ошибка входа",
        description: "Неверный логин или пароль",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLogin("");
    setPassword("");
    toast({
      title: "Выход выполнен",
      description: "Вы вышли из админ-панели",
    });
  };

  const handleCreateContest = () => {
    setEditingContest(null);
    setFormData({
      title: "",
      description: "",
      categoryId: "visual-arts",
      deadline: "",
      price: 200,
      status: "active",
      rulesLink: "#",
      diplomaImage: "",
      image: ""
    });
    setIsModalOpen(true);
  };

  const handleEditContest = (contest: Contest) => {
    setEditingContest(contest);
    setFormData({
      ...contest,
      deadline: contest.deadline ? new Date(contest.deadline).toISOString().split('T')[0] : ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingContest ? 'PUT' : 'POST';
      const body = editingContest ? { ...formData, id: editingContest.id } : formData;
      
      const response = await fetch(API_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: editingContest ? "Конкурс обновлен" : "Конкурс создан"
        });
        setIsModalOpen(false);
        loadContests();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить конкурс",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот конкурс?")) return;
    
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Конкурс удален"
        });
        loadContests();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить конкурс",
        variant: "destructive"
      });
    }
  };

  const handleDeleteApplication = async (id: number) => {
    if (!confirm("Переместить заявку в корзину?")) return;
    
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Заявка перемещена в корзину"
        });
        loadApplications();
        loadDeletedApplications();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заявку",
        variant: "destructive"
      });
    }
  };

  const handleRestoreApplication = async (id: number) => {
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?id=${id}&restore=true`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Заявка восстановлена"
        });
        loadApplications();
        loadDeletedApplications();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось восстановить заявку",
        variant: "destructive"
      });
    }
  };

  const handleEditResult = (result: Result) => {
    setEditingResult(result);
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;

    try {
      const response = await fetch(RESULTS_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingResult)
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Результат обновлен"
        });
        setIsResultModalOpen(false);
        loadResults();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить результат",
        variant: "destructive"
      });
    }
  };

  const handleDeleteResult = async (id: number) => {
    if (!confirm("Удалить этот результат?")) return;

    try {
      const response = await fetch(`${RESULTS_API_URL}?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Результат удален"
        });
        loadResults();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить результат",
        variant: "destructive"
      });
    }
  };

  const handleCreateResultFromApplication = async (app: Application) => {
    if (!app.result) {
      toast({
        title: "Результат не указан",
        description: "Сначала установите результат в заявке",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(RESULTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: app.id,
          full_name: app.full_name,
          age: app.age,
          teacher: app.teacher,
          institution: app.institution,
          work_title: app.work_title,
          email: app.email,
          contest_id: app.contest_id,
          contest_name: app.contest_name,
          work_file_url: app.work_file_url,
          result: app.result,
          gallery_consent: app.gallery_consent,
          place: null,
          score: null,
          diploma_url: null,
          notes: null,
          diploma_issued_at: app.diploma_issued_at || null
        })
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Результат создан из заявки"
        });
        loadResults();
      } else if (response.status === 409) {
        toast({
          title: "Дубликат",
          description: "Результат из этой заявки уже существует",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось создать результат",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать результат",
        variant: "destructive"
      });
    }
  };

  const handleManualAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAppFile) {
      toast({ title: "Ошибка", description: "Загрузите файл работы", variant: "destructive" });
      return;
    }
    if (!manualContestName) {
      toast({ title: "Ошибка", description: "Выберите конкурс", variant: "destructive" });
      return;
    }
    setSubmittingManualApp(true);
    setManualAppUploadProgress(5);
    
    try {
      const formEl = e.currentTarget as HTMLFormElement;
      const fd = new FormData(formEl);
      
      const CHUNK_SIZE = 2 * 1024 * 1024;
      const totalChunks = Math.ceil(manualAppFile.size / CHUNK_SIZE);
      let uploadId = '';
      let file_url = '';

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, manualAppFile.size);
        const chunk = manualAppFile.slice(start, end);

        const chunkBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.onerror = () => reject(new Error('Ошибка чтения файла'));
          reader.readAsDataURL(chunk);
        });

        const chunkProgress = 5 + Math.round((chunkIndex / totalChunks) * 45);
        setManualAppUploadProgress(chunkProgress);

        const uploadResponse = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chunk: chunkBase64,
            chunkIndex,
            totalChunks,
            fileName: manualAppFile.name,
            fileType: manualAppFile.type,
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

      setManualAppUploadProgress(60);

      const response = await fetch(SUBMIT_APPLICATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fd.get('manualFullName'),
          age: parseInt(fd.get('manualAge') as string),
          teacher: fd.get('manualTeacher') || null,
          institution: fd.get('manualInstitution') || null,
          work_title: fd.get('manualWorkTitle'),
          email: fd.get('manualEmail'),
          contest_name: manualContestName,
          work_file_url: file_url,
          gallery_consent: fd.get('manualGallery') === 'on'
        })
      });
      
      setManualAppUploadProgress(90);
      
      const result = await response.json();
      if (response.ok && result.success) {
        setManualAppUploadProgress(100);
        toast({ title: "Успешно", description: "Заявка добавлена вручную" });
        setIsManualAppModalOpen(false);
        setManualAppFile(null);
        setManualAppUploadProgress(0);
        loadApplications();
      } else {
        toast({ title: "Ошибка", description: result.error || "Не удалось создать заявку", variant: "destructive" });
      }
      setSubmittingManualApp(false);
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      toast({ title: "Ошибка", description: error instanceof Error ? error.message : "Произошла ошибка при создании заявки", variant: "destructive" });
      setSubmittingManualApp(false);
      setManualAppUploadProgress(0);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-heading font-bold text-primary">
              🔐 Вход в админ-панель
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-base font-semibold">Логин</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Введите логин"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  className="rounded-xl border-2 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-2 focus:border-primary"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-lg py-6"
              >
                <Icon name="LogIn" className="mr-2" />
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 backdrop-blur-md shadow-md bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-white">Админ-панель</h1>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <Icon name="LogOut" className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-4 mb-8 border-b">
          <Button
            variant={activeTab === 'contests' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('contests')}
            className="rounded-t-xl rounded-b-none"
          >
            <Icon name="Trophy" className="mr-2" />
            Конкурсы
          </Button>
          <Button
            variant={activeTab === 'applications' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('applications')}
            className="rounded-t-xl rounded-b-none"
          >
            <Icon name="FileText" className="mr-2" />
            Заявки ({applications.length + deletedApplications.length})
          </Button>
          <Button
            variant={activeTab === 'results' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('results')}
            className="rounded-t-xl rounded-b-none"
          >
            <Icon name="Award" className="mr-2" />
            Результаты ({results.length})
          </Button>
          <Button
            variant={activeTab === 'reviews' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('reviews')}
            className="rounded-t-xl rounded-b-none"
          >
            <Icon name="MessageSquare" className="mr-2" />
            Отзывы ({reviews.length})
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="rounded-t-xl rounded-b-none"
          >
            <Icon name="Settings" className="mr-2" />
            Настройки
          </Button>
        </div>

        {activeTab === 'contests' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-heading font-bold text-primary">Управление конкурсами</h2>
              <Button 
                onClick={handleCreateContest}
                className="rounded-xl bg-primary hover:bg-primary/90"
              >
                <Icon name="Plus" className="mr-2" />
                Создать конкурс
              </Button>
            </div>

            <div className="grid gap-4">
          {contests.map((contest) => (
            <Card key={contest.id} className="rounded-3xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-2">{contest.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{contest.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="bg-secondary/20 px-3 py-1 rounded-lg">
                        {categories.find(c => c.id === contest.categoryId)?.name}
                      </span>
                      <span className="bg-info/20 px-3 py-1 rounded-lg">
                        До: {contest.deadline}
                      </span>
                      <span className="bg-success/20 px-3 py-1 rounded-lg">
                        {contest.price} ₽
                      </span>
                      <span className={`px-3 py-1 rounded-lg ${contest.status === 'new' ? 'bg-success/20' : 'bg-primary/20'}`}>
                        {contest.status === 'new' ? 'Новый' : 'Активный'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleEditContest(contest)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      onClick={() => contest.id && handleDelete(contest.id)}
                      variant="destructive"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>
          </>
        )}

        {activeTab === 'applications' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-heading font-bold text-primary">Заявки на участие</h2>
              <Button
                onClick={() => { setManualAppFile(null); setManualContestName(""); setIsManualAppModalOpen(true); }}
                className="rounded-xl bg-primary hover:bg-primary/90"
              >
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить заявку
              </Button>
            </div>
            
            <div className="flex gap-2 mb-6">
              <Button
                variant={applicationsSubTab === 'active' ? 'default' : 'outline'}
                onClick={() => setApplicationsSubTab('active')}
                className="rounded-xl"
              >
                <Icon name="FileText" className="mr-2" size={16} />
                Активные ({applications.length})
              </Button>
              <Button
                variant={applicationsSubTab === 'trash' ? 'default' : 'outline'}
                onClick={() => setApplicationsSubTab('trash')}
                className="rounded-xl"
              >
                <Icon name="Trash2" className="mr-2" size={16} />
                Корзина ({deletedApplications.length})
              </Button>
            </div>
            
            {applicationsSubTab === 'active' && (
            <div className="grid gap-4">
              {applications.map((app) => (
                <Card key={`app-${app.id}`} className="rounded-2xl shadow-md">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">ФИО</p>
                          <p className="font-semibold text-sm">{app.full_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Возраст</p>
                          <p className="font-semibold text-sm">{app.age} лет</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Название работы</p>
                          <p className="font-semibold text-sm">{app.work_title}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Конкурс</p>
                          <p className="font-semibold text-sm">{app.contest_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Педагог</p>
                          <p className="font-semibold text-sm">{app.teacher || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Учреждение</p>
                          <p className="font-semibold text-sm">{app.institution || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="font-semibold text-sm">{app.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Дата подачи</p>
                          <p className="font-semibold text-sm">
                            {app.created_at ? new Date(app.created_at).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Работа</p>
                          <button
                            onClick={() => {
                              setWorkPreview(app.work_file_url);
                              setIsWorkPreviewOpen(true);
                            }}
                            className="text-primary hover:underline flex items-center gap-1 text-xs cursor-pointer"
                          >
                            <Icon name="Eye" size={14} />
                            Посмотреть
                          </button>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Публикация в галерее</p>
                          <span className={`text-sm font-semibold ${app.gallery_consent ? 'text-green-600' : 'text-red-600'}`}>
                            {app.gallery_consent ? '✓ Согласен' : '✗ Не согласен'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Дата вручения</p>
                          <p className="font-semibold text-sm">
                            {app.diploma_issued_at
                              ? new Date(app.diploma_issued_at).toLocaleDateString('ru-RU')
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleCreateResultFromApplication(app)}
                          variant="default"
                          size="sm"
                          className={`rounded-xl ${applicationsWithResults.has(app.id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                          title={applicationsWithResults.has(app.id) ? "Результат уже создан" : "Добавить в результаты"}
                          disabled={applicationsWithResults.has(app.id)}
                        >
                          <Icon name={applicationsWithResults.has(app.id) ? "Check" : "Award"} size={16} />
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingApplication(app);
                            setAppStatus(app.status);
                            setAppResult(app.result || undefined);
                            setIsAppModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteApplication(app.id)}
                          variant="destructive"
                          size="sm"
                          className="rounded-xl"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-start gap-3">
                        <Icon name="Award" size={20} className={app.result ? "text-orange-500" : "text-gray-400"} />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-2">Результат</p>
                          {app.result ? (
                            <span className="inline-block px-4 py-2 rounded-lg text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md">
                              {app.result === 'grand_prix' ? '🏆 Гран-При' :
                               app.result === 'first_degree' ? '🥇 Диплом 1 степени' :
                               app.result === 'second_degree' ? '🥈 Диплом 2 степени' :
                               app.result === 'third_degree' ? '🥉 Диплом 3 степени' : '✨ Участник'}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-md text-xs bg-gray-200 text-gray-600">
                              Не выбран
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            )}
            
            {applicationsSubTab === 'trash' && (
            <div className="grid gap-4">
              {deletedApplications.length === 0 ? (
                <Card className="rounded-2xl p-8 text-center">
                  <Icon name="Trash2" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">Корзина пуста</p>
                </Card>
              ) : (
                deletedApplications.map((app) => (
                  <Card key={app.id} className="rounded-2xl shadow-md opacity-60">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">ФИО</p>
                            <p className="font-semibold text-sm">{app.full_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Возраст</p>
                            <p className="font-semibold text-sm">{app.age} лет</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Название работы</p>
                            <p className="font-semibold text-sm">{app.work_title}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Конкурс</p>
                            <p className="font-semibold text-sm">{app.contest_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-semibold text-sm">{app.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Удалено</p>
                            <p className="font-semibold text-sm">
                              {app.deleted_at ? new Date(app.deleted_at).toLocaleString('ru-RU', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleRestoreApplication(app.id)}
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                          >
                            <Icon name="RotateCcw" size={16} className="mr-1" />
                            Восстановить
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-heading font-bold text-primary">Результаты конкурсов</h2>
            </div>

            <Card className="rounded-2xl shadow-md mb-6 p-6">
              <h3 className="text-lg font-semibold mb-4">Фильтры</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Название конкурса</Label>
                  <Input
                    placeholder="Поиск по названию..."
                    value={resultFilters.contest_name}
                    onChange={(e) => setResultFilters({...resultFilters, contest_name: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ФИО участника</Label>
                  <Input
                    placeholder="Поиск по ФИО..."
                    value={resultFilters.full_name}
                    onChange={(e) => setResultFilters({...resultFilters, full_name: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Результат</Label>
                  <Select 
                    value={resultFilters.result} 
                    onValueChange={(value) => setResultFilters({...resultFilters, result: value})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все результаты</SelectItem>
                      <SelectItem value="grand_prix">🏆 Гран-При</SelectItem>
                      <SelectItem value="first_degree">🥇 Диплом 1 степени</SelectItem>
                      <SelectItem value="second_degree">🥈 Диплом 2 степени</SelectItem>
                      <SelectItem value="third_degree">🥉 Диплом 3 степени</SelectItem>
                      <SelectItem value="participant">✨ Участник</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Дата участия</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal rounded-xl">
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
              </div>
            </Card>

            <div className="grid gap-4">
              {filteredResults.length === 0 ? (
                <Card className="rounded-2xl p-8 text-center">
                  <Icon name="Award" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">Результатов пока нет</p>
                </Card>
              ) : (
                filteredResults.map((result) => (
                  <Card key={result.id} className="rounded-2xl shadow-md">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">ФИО</p>
                            <p className="font-semibold text-sm">{result.full_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Возраст</p>
                            <p className="font-semibold text-sm">{result.age} лет</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Название работы</p>
                            <p className="font-semibold text-sm">{result.work_title}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Конкурс</p>
                            <p className="font-semibold text-sm">{result.contest_name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Педагог</p>
                            <p className="font-semibold text-sm">{result.teacher || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Учреждение</p>
                            <p className="font-semibold text-sm">{result.institution || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-semibold text-sm">{result.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Дата участия</p>
                            <p className="font-semibold text-sm">
                              {result.created_at ? new Date(result.created_at).toLocaleDateString('ru-RU') : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Работа</p>
                            <button
                              onClick={() => {
                                setWorkPreview(result.work_file_url);
                                setIsWorkPreviewOpen(true);
                              }}
                              className="text-primary hover:underline flex items-center gap-1 text-xs cursor-pointer"
                            >
                              <Icon name="Eye" size={14} />
                              Посмотреть
                            </button>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Результат</p>
                            <span className="inline-block px-3 py-1 rounded-lg text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              {result.result === 'grand_prix' ? '🏆 Гран-При' :
                               result.result === 'first_degree' ? '🥇 Диплом 1 степени' :
                               result.result === 'second_degree' ? '🥈 Диплом 2 степени' :
                               result.result === 'third_degree' ? '🥉 Диплом 3 степени' : '✨ Участник'}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Публикация в галерее</p>
                            <span className={`text-sm font-semibold ${result.gallery_consent ? 'text-green-600' : 'text-red-600'}`}>
                              {result.gallery_consent ? '✓ Согласен' : '✗ Не согласен'}
                            </span>
                          </div>
                          {result.diploma_issued_at && (
                            <div>
                              <p className="text-xs text-muted-foreground">Дата вручения</p>
                              <p className="font-semibold text-sm">{new Date(result.diploma_issued_at).toLocaleDateString('ru-RU')}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleDeleteResult(result.id)}
                            variant="destructive"
                            size="sm"
                            className="rounded-xl"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-heading font-bold text-primary">Модерация отзывов</h2>
            </div>

            <div className="grid gap-4">
              {reviews.length === 0 ? (
                <Card className="rounded-2xl p-8 text-center">
                  <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground">Отзывов пока нет</p>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className={`rounded-2xl shadow-md ${review.status === 'pending' ? 'border-2 border-orange-400' : review.status === 'approved' ? 'border-2 border-green-400' : 'border-2 border-red-400 opacity-60'}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Icon key={i} name="Star" className="text-secondary fill-secondary" size={18} />
                              ))}
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                              review.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              review.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {review.status === 'pending' ? '⏳ На модерации' :
                               review.status === 'approved' ? '✅ Опубликован' : '❌ Отклонен'}
                            </span>
                          </div>
                          
                          <p className="text-lg mb-4 italic">"{review.text}"</p>
                          
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground">Автор</p>
                              <p className="font-semibold">{review.author_name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Роль</p>
                              <p className="font-semibold">{review.author_role || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Дата создания</p>
                              <p className="font-semibold">
                                {new Date(review.created_at).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {review.published_at && (
                              <div>
                                <p className="text-xs text-muted-foreground">Дата публикации</p>
                                <p className="font-semibold">
                                  {new Date(review.published_at).toLocaleString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          {review.status === 'pending' && (
                            <>
                              <Button
                                onClick={async () => {
                                  try {
                                    const response = await fetch(REVIEWS_API_URL, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: review.id, status: 'approved' })
                                    });
                                    if (response.ok) {
                                      toast({ title: 'Успешно', description: 'Отзыв опубликован' });
                                      loadReviews();
                                    }
                                  } catch (error) {
                                    toast({ title: 'Ошибка', description: 'Не удалось опубликовать отзыв', variant: 'destructive' });
                                  }
                                }}
                                variant="default"
                                size="sm"
                                className="rounded-xl bg-green-600 hover:bg-green-700"
                              >
                                <Icon name="Check" size={16} className="mr-1" />
                                Одобрить
                              </Button>
                              <Button
                                onClick={async () => {
                                  try {
                                    const response = await fetch(REVIEWS_API_URL, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ id: review.id, status: 'rejected' })
                                    });
                                    if (response.ok) {
                                      toast({ title: 'Успешно', description: 'Отзыв отклонен' });
                                      loadReviews();
                                    }
                                  } catch (error) {
                                    toast({ title: 'Ошибка', description: 'Не удалось отклонить отзыв', variant: 'destructive' });
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                              >
                                <Icon name="X" size={16} className="mr-1" />
                                Отклонить
                              </Button>
                            </>
                          )}
                          {review.status === 'approved' && (
                            <Button
                              onClick={async () => {
                                try {
                                  const response = await fetch(REVIEWS_API_URL, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ id: review.id, status: 'rejected' })
                                  });
                                  if (response.ok) {
                                    toast({ title: 'Успешно', description: 'Отзыв снят с публикации' });
                                    loadReviews();
                                  }
                                } catch (error) {
                                  toast({ title: 'Ошибка', description: 'Не удалось снять с публикации', variant: 'destructive' });
                                }
                              }}
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Icon name="EyeOff" size={16} className="mr-1" />
                              Снять
                            </Button>
                          )}
                          <Button
                            onClick={async () => {
                              if (!confirm('Удалить этот отзыв?')) return;
                              try {
                                const response = await fetch(`${REVIEWS_API_URL}?id=${review.id}`, {
                                  method: 'DELETE'
                                });
                                if (response.ok) {
                                  toast({ title: 'Успешно', description: 'Отзыв удален' });
                                  loadReviews();
                                }
                              } catch (error) {
                                toast({ title: 'Ошибка', description: 'Не удалось удалить отзыв', variant: 'destructive' });
                              }
                            }}
                            variant="destructive"
                            size="sm"
                            className="rounded-xl"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="text-3xl font-heading font-bold text-primary mb-8">Настройки</h2>
            <Card className="p-6 rounded-2xl max-w-2xl">
              <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
                <Icon name="ClipboardList" size={20} className="text-primary" />
                Лист подачи заявки
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Загрузите файл листа подачи заявки (DOCX, DOC или PDF). Он будет доступен для скачивания в разделе «Документы» на сайте.
              </p>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".docx,.doc,.pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingAppForm(true);
                      try {
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const base64 = reader.result?.toString().split(',')[1];
                          const response = await fetch(UPLOAD_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              file: base64,
                              fileName: file.name,
                              fileType: file.type || 'application/octet-stream',
                              folder: 'application-forms'
                            })
                          });
                          const data = await response.json();
                          setApplicationFormUrl(data.url);
                          await fetch(SETTINGS_API_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ key: 'application_form_url', value: data.url })
                          });
                          toast({ title: 'Файл загружен', description: 'Лист подачи заявки успешно загружен' });
                        };
                        reader.readAsDataURL(file);
                      } catch (error) {
                        toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
                      } finally {
                        setUploadingAppForm(false);
                      }
                    }}
                    disabled={uploadingAppForm}
                    className="rounded-xl h-10"
                  />
                  {uploadingAppForm && <Icon name="Loader2" className="animate-spin" />}
                </div>
                {applicationFormUrl && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <Icon name="CheckCircle" size={18} className="text-green-600" />
                    <a href={applicationFormUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Icon name="ExternalLink" size={14} />
                      Просмотреть загруженный файл
                    </a>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-destructive hover:text-destructive"
                      onClick={async () => {
                        setApplicationFormUrl('');
                        await fetch(SETTINGS_API_URL, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ key: 'application_form_url', value: '' })
                        });
                        toast({ title: 'Удалено', description: 'Ссылка на лист подачи заявки удалена' });
                      }}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary">
              {editingContest ? "Редактировать конкурс" : "Создать конкурс"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Название конкурса *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Описание *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Категория *</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => setFormData({...formData, categoryId: value})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Дедлайн *</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Стоимость участия (₽) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Статус *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="new">Новый</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isPopular" 
                checked={formData.isPopular || false}
                onCheckedChange={(checked) => setFormData({...formData, isPopular: checked as boolean})}
              />
              <Label htmlFor="isPopular" className="cursor-pointer">
                Популярный конкурс (показывать на главной странице)
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Положение конкурса (PDF)</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setUploadingRules(true);
                    try {
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = reader.result?.toString().split(',')[1];
                        const response = await fetch(UPLOAD_URL, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            file: base64,
                            fileName: file.name,
                            fileType: 'application/pdf',
                            folder: 'rules'
                          })
                        });
                        const data = await response.json();
                        setFormData({...formData, rulesLink: data.url});
                        toast({ title: 'Файл загружен', description: 'Положение конкурса загружено успешно' });
                      };
                      reader.readAsDataURL(file);
                    } catch (error) {
                      toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
                    } finally {
                      setUploadingRules(false);
                    }
                  }}
                  disabled={uploadingRules}
                  className="rounded-xl h-10"
                />
                {uploadingRules && <Icon name="Loader2" className="animate-spin" />}
              </div>
              {formData.rulesLink && formData.rulesLink !== '#' && (
                <a href={formData.rulesLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <Icon name="ExternalLink" size={14} />
                  Просмотреть файл
                </a>
              )}
            </div>

            <div className="space-y-2">
              <Label>Образец диплома (изображение)</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setUploadingDiploma(true);
                    try {
                      const reader = new FileReader();
                      reader.onload = async () => {
                        const base64 = reader.result?.toString().split(',')[1];
                        const response = await fetch(UPLOAD_URL, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            file: base64,
                            fileName: file.name,
                            fileType: file.type,
                            folder: 'diplomas'
                          })
                        });
                        const data = await response.json();
                        setFormData({...formData, diplomaImage: data.url});
                        toast({ title: 'Файл загружен', description: 'Образец диплома загружен успешно' });
                      };
                      reader.readAsDataURL(file);
                    } catch (error) {
                      toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
                    } finally {
                      setUploadingDiploma(false);
                    }
                  }}
                  disabled={uploadingDiploma}
                  className="rounded-xl h-10"
                />
                {uploadingDiploma && <Icon name="Loader2" className="animate-spin" />}
              </div>
              {formData.diplomaImage && (
                <div className="mt-2">
                  <img src={formData.diplomaImage} alt="Превью диплома" className="w-32 h-auto rounded-lg border" />
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-xl bg-primary hover:bg-primary/90"
            >
              {editingContest ? "Сохранить изменения" : "Создать конкурс"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAppModalOpen} onOpenChange={setIsAppModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary">
              Редактирование заявки
            </DialogTitle>
          </DialogHeader>
          
          {editingApplication && (
            <form 
              className="space-y-5 mt-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                try {
                  const diplomaDate = formData.get('diplomaIssuedAt') as string;
                  const updateData = {
                    id: editingApplication.id,
                    full_name: formData.get('fullName') as string,
                    age: parseInt(formData.get('age') as string),
                    teacher: formData.get('teacher') as string || null,
                    institution: formData.get('institution') as string || null,
                    work_title: formData.get('workTitle') as string,
                    email: formData.get('email') as string,
                    result: appResult && appResult !== 'none' ? appResult : null,
                    diploma_issued_at: diplomaDate || null
                  };
                  
                  const response = await fetch(APPLICATIONS_API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                  });
                  
                  if (response.ok) {
                    toast({
                      title: "Успешно",
                      description: "Заявка обновлена"
                    });
                    setIsAppModalOpen(false);
                    loadApplications();
                  }
                } catch (error) {
                  toast({
                    title: "Ошибка",
                    description: "Не удалось обновить заявку",
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
                  defaultValue={editingApplication.full_name}
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
                  defaultValue={editingApplication.age}
                  required 
                  className="rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher" className="text-base font-semibold">Педагог</Label>
                <Input 
                  id="teacher"
                  name="teacher"
                  defaultValue={editingApplication.teacher || ''}
                  className="rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution" className="text-base font-semibold">Учреждение</Label>
                <Input 
                  id="institution"
                  name="institution"
                  defaultValue={editingApplication.institution || ''}
                  className="rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workTitle" className="text-base font-semibold">Название работы *</Label>
                <Input 
                  id="workTitle"
                  name="workTitle"
                  defaultValue={editingApplication.work_title}
                  required 
                  className="rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingApplication.email}
                  required 
                  className="rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="result" className="text-base font-semibold">Результат</Label>
                <Select value={appResult || 'none'} onValueChange={(val) => setAppResult(val === 'none' ? undefined : val)}>
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue placeholder="Не выбран" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не выбран</SelectItem>
                    <SelectItem value="grand_prix">Гран-При</SelectItem>
                    <SelectItem value="first_degree">1 степень</SelectItem>
                    <SelectItem value="second_degree">2 степень</SelectItem>
                    <SelectItem value="third_degree">3 степень</SelectItem>
                    <SelectItem value="participant">Участник</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diplomaIssuedAt" className="text-base font-semibold">Дата вручения</Label>
                <Input
                  id="diplomaIssuedAt"
                  name="diplomaIssuedAt"
                  type="date"
                  defaultValue={editingApplication.diploma_issued_at || ''}
                  className="rounded-xl border-2 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Файл работы</Label>
                <button
                  type="button"
                  onClick={() => {
                    setWorkPreview(editingApplication.work_file_url);
                    setIsWorkPreviewOpen(true);
                  }}
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Icon name="Eye" size={16} />
                  Посмотреть работу
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full rounded-xl bg-primary hover:bg-primary/90"
              >
                Сохранить изменения
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isWorkPreviewOpen} onOpenChange={setIsWorkPreviewOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden rounded-3xl">
          <div className="relative w-full h-full flex items-center justify-center bg-black/95">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsWorkPreviewOpen(false)}
            >
              <Icon name="X" size={24} />
            </Button>
            {workPreview && (
              <>
                {workPreview.endsWith('.pdf') ? (
                  <iframe 
                    src={workPreview}
                    className="w-full h-[90vh]"
                    title="Работа участника"
                  />
                ) : (
                  <img 
                    src={workPreview} 
                    alt="Работа участника"
                    className="max-w-full max-h-[85vh] object-contain"
                  />
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary">
              Редактировать результат
            </DialogTitle>
          </DialogHeader>
          
          {editingResult && (
            <form onSubmit={handleSaveResult} className="space-y-4">
              <div className="space-y-2">
                <Label>ФИО *</Label>
                <Input
                  value={editingResult.full_name}
                  onChange={(e) => setEditingResult({...editingResult, full_name: e.target.value})}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Возраст</Label>
                <Input
                  type="number"
                  value={editingResult.age || ''}
                  onChange={(e) => setEditingResult({...editingResult, age: parseInt(e.target.value) || null})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Педагог</Label>
                <Input
                  value={editingResult.teacher || ''}
                  onChange={(e) => setEditingResult({...editingResult, teacher: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Учреждение</Label>
                <Input
                  value={editingResult.institution || ''}
                  onChange={(e) => setEditingResult({...editingResult, institution: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Название работы</Label>
                <Input
                  value={editingResult.work_title || ''}
                  onChange={(e) => setEditingResult({...editingResult, work_title: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingResult.email || ''}
                  onChange={(e) => setEditingResult({...editingResult, email: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Название конкурса</Label>
                <Input
                  value={editingResult.contest_name || ''}
                  onChange={(e) => setEditingResult({...editingResult, contest_name: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Результат</Label>
                <Select 
                  value={editingResult.result || 'none'} 
                  onValueChange={(value) => setEditingResult({...editingResult, result: value === 'none' ? null : value})}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не указан</SelectItem>
                    <SelectItem value="Победитель">Победитель</SelectItem>
                    <SelectItem value="Призер">Призер</SelectItem>
                    <SelectItem value="Участник">Участник</SelectItem>
                    <SelectItem value="Гран-при">Гран-при</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Место</Label>
                <Input
                  type="number"
                  value={editingResult.place || ''}
                  onChange={(e) => setEditingResult({...editingResult, place: parseInt(e.target.value) || null})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Баллы</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingResult.score || ''}
                  onChange={(e) => setEditingResult({...editingResult, score: parseFloat(e.target.value) || null})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Ссылка на диплом</Label>
                <Input
                  value={editingResult.diploma_url || ''}
                  onChange={(e) => setEditingResult({...editingResult, diploma_url: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Дата вручения</Label>
                <Input
                  type="date"
                  value={editingResult.diploma_issued_at || ''}
                  onChange={(e) => setEditingResult({...editingResult, diploma_issued_at: e.target.value || null})}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Примечания</Label>
                <Textarea
                  value={editingResult.notes || ''}
                  onChange={(e) => setEditingResult({...editingResult, notes: e.target.value})}
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
                >
                  Сохранить
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResultModalOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isWorkPreviewOpen} onOpenChange={setIsWorkPreviewOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary">
              Просмотр работы
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {workPreview && (
              <img 
                src={workPreview} 
                alt="Работа участника" 
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isManualAppModalOpen} onOpenChange={setIsManualAppModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary">
              Добавить заявку вручную
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleManualAppSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>ФИО участника *</Label>
              <Input name="manualFullName" placeholder="Введите ФИО участника" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Возраст *</Label>
              <Input name="manualAge" type="number" min="5" max="18" placeholder="Введите возраст" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Педагог</Label>
              <Input name="manualTeacher" placeholder="ФИО педагога (если есть)" className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Учреждение</Label>
              <Input name="manualInstitution" placeholder="Название школы, студии или учреждения" className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Название творческой работы *</Label>
              <Input name="manualWorkTitle" placeholder="Введите название работы" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Электронная почта *</Label>
              <Input name="manualEmail" type="email" placeholder="example@mail.ru" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Конкурс *</Label>
              <Select value={manualContestName} onValueChange={setManualContestName}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Выберите конкурс" />
                </SelectTrigger>
                <SelectContent>
                  {contests.map((c) => (
                    <SelectItem key={c.id || c.title} value={c.title}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Загрузить работу *</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const maxSize = 15 * 1024 * 1024;
                    if (file.size > maxSize) {
                      toast({
                        title: "Файл слишком большой",
                        description: `Максимальный размер файла — 15 МБ. Ваш файл: ${(file.size / 1024 / 1024).toFixed(1)} МБ`,
                        variant: "destructive"
                      });
                      e.target.value = '';
                      setManualAppFile(null);
                      return;
                    }
                    setManualAppFile(file);
                  } else {
                    setManualAppFile(null);
                  }
                }}
                className="rounded-xl h-10"
              />
              {manualAppFile && !submittingManualApp && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-xl text-sm">
                  <Icon name="CheckCircle" className="text-green-600" size={16} />
                  <span className="text-green-700 font-semibold">{manualAppFile.name} ({(manualAppFile.size / 1024 / 1024).toFixed(1)} МБ)</span>
                </div>
              )}
              {submittingManualApp && manualAppUploadProgress > 0 && (
                <div className="space-y-2 p-3 bg-primary/10 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">Загрузка файла...</span>
                    <span className="text-primary">{manualAppUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${manualAppUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Форматы: JPG, PNG, PDF (макс. 15 МБ)</p>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-xl">
              <Checkbox id="manualGallery" name="manualGallery" />
              <Label htmlFor="manualGallery" className="text-sm cursor-pointer">
                Согласие на публикацию работы в галерее сайта
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submittingManualApp}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {submittingManualApp ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                    {manualAppUploadProgress < 60 ? `Загрузка ${manualAppUploadProgress}%` : 'Создание заявки...'}
                  </>
                ) : (
                  <><Icon name="Plus" className="mr-2" size={16} />Создать заявку</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsManualAppModalOpen(false)}
                className="flex-1 rounded-xl"
              >
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;