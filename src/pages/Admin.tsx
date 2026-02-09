import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

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
  created_at: string;
  updated_at: string;
}

const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
const APPLICATIONS_API_URL = "https://functions.poehali.dev/bdd5d0da-4fc3-4f8e-9d5e-b2129ec3c8d0";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<'contests' | 'applications'>('contests');
  const [contests, setContests] = useState<Contest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [appStatus, setAppStatus] = useState<'new' | 'viewed' | 'sent'>('new');
  const [appResult, setAppResult] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'viewed' | 'sent'>('all');
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

  useEffect(() => {
    if (isAuthenticated) {
      loadContests();
      loadApplications();
    }
  }, [isAuthenticated]);

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
            Заявки ({applications.length})
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
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-heading font-bold text-primary">Заявки на участие</h2>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  className="rounded-xl"
                  size="sm"
                >
                  Все ({applications.length})
                </Button>
                <Button
                  variant={statusFilter === 'new' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('new')}
                  className="rounded-xl"
                  size="sm"
                >
                  <Icon name="Bell" className="mr-1" size={14} />
                  Новые ({applications.filter(a => a.status === 'new').length})
                </Button>
                <Button
                  variant={statusFilter === 'viewed' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('viewed')}
                  className="rounded-xl"
                  size="sm"
                >
                  <Icon name="Eye" className="mr-1" size={14} />
                  Отсмотрены ({applications.filter(a => a.status === 'viewed').length})
                </Button>
                <Button
                  variant={statusFilter === 'sent' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('sent')}
                  className="rounded-xl"
                  size="sm"
                >
                  <Icon name="Send" className="mr-1" size={14} />
                  Отправлены ({applications.filter(a => a.status === 'sent').length})
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              {applications.filter(app => statusFilter === 'all' || app.status === statusFilter).map((app) => (
                <Card key={app.id} className="rounded-2xl shadow-md">
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
                          <p className="text-xs text-muted-foreground">Статус</p>
                          <span className={`px-2 py-0.5 rounded-md text-xs ${
                            app.status === 'new' ? 'bg-success/20 text-success' :
                            app.status === 'viewed' ? 'bg-info/20 text-info' :
                            'bg-primary/20 text-primary'
                          }`}>
                            {app.status === 'new' ? 'Новая' :
                             app.status === 'viewed' ? 'Отсмотрена' : 'Отправлена'}
                          </span>
                        </div>
                        {app.result && (
                          <div>
                            <p className="text-xs text-muted-foreground">Результат</p>
                            <span className="px-2 py-0.5 rounded-md text-xs bg-secondary/20">
                              {app.result === 'grand_prix' ? 'Гран-При' :
                               app.result === 'first_degree' ? '1 степень' :
                               app.result === 'second_degree' ? '2 степень' :
                               app.result === 'third_degree' ? '3 степень' : 'Участник'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Работа</p>
                          <a 
                            href={app.work_file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-xs"
                          >
                            <Icon name="ExternalLink" size={14} />
                            Посмотреть
                          </a>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  const updateData = {
                    id: editingApplication.id,
                    full_name: formData.get('fullName') as string,
                    age: parseInt(formData.get('age') as string),
                    teacher: formData.get('teacher') as string || null,
                    institution: formData.get('institution') as string || null,
                    work_title: formData.get('workTitle') as string,
                    email: formData.get('email') as string,
                    status: appStatus,
                    result: appResult && appResult !== 'none' ? appResult : null
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
                <Label htmlFor="status" className="text-base font-semibold">Статус *</Label>
                <Select value={appStatus} onValueChange={(value: 'new' | 'viewed' | 'sent') => setAppStatus(value)}>
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Новая</SelectItem>
                    <SelectItem value="viewed">Отсмотрена</SelectItem>
                    <SelectItem value="sent">Отправлена</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label className="text-base font-semibold">Файл работы</Label>
                <a 
                  href={editingApplication.work_file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Icon name="ExternalLink" size={16} />
                  Посмотреть работу
                </a>
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
    </div>
  );
};

export default Admin;