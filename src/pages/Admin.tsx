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

const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [contests, setContests] = useState<Contest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
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
    { id: "visual-arts", name: "Изобразительное искусство" },
    { id: "decorative-arts", name: "Декоративно-прикладное искусство" },
    { id: "nature", name: "Природа" },
    { id: "animals", name: "Животные" },
    { id: "plants", name: "Растения" },
    { id: "music", name: "Музыка" },
    { id: "literature", name: "Литература" }
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

  useEffect(() => {
    if (isAuthenticated) {
      loadContests();
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
    </div>
  );
};

export default Admin;