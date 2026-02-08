import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

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
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon name="Users" className="text-primary" size={48} />
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Участников</p>
                  <p className="text-3xl font-bold text-primary">1,234</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon name="Trophy" className="text-secondary" size={48} />
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Конкурсов</p>
                  <p className="text-3xl font-bold text-secondary">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl hover:shadow-2xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon name="Image" className="text-success" size={48} />
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Работ</p>
                  <p className="text-3xl font-bold text-success">5,678</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-heading font-bold text-primary">
                🏆 Управление конкурсами
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 justify-start">
                <Icon name="Plus" className="mr-2" />
                Создать новый конкурс
              </Button>
              <Button className="w-full rounded-xl bg-secondary hover:bg-secondary/90 justify-start">
                <Icon name="Edit" className="mr-2" />
                Редактировать конкурсы
              </Button>
              <Button className="w-full rounded-xl bg-info hover:bg-info/90 justify-start">
                <Icon name="Eye" className="mr-2" />
                Просмотреть заявки
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-heading font-bold text-primary">
                👥 Управление пользователями
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 justify-start">
                <Icon name="UserPlus" className="mr-2" />
                Добавить участника
              </Button>
              <Button className="w-full rounded-xl bg-secondary hover:bg-secondary/90 justify-start">
                <Icon name="Users" className="mr-2" />
                Список участников
              </Button>
              <Button className="w-full rounded-xl bg-success hover:bg-success/90 justify-start">
                <Icon name="Award" className="mr-2" />
                Выдать дипломы
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
