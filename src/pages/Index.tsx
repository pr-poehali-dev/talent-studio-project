import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useState } from "react";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");

  const navItems = [
    { id: "home", label: "Главная", icon: "Home" },
    { id: "contests", label: "Конкурсы", icon: "Trophy" },
    { id: "gallery", label: "Галерея", icon: "Image" },
    { id: "documents", label: "Документы", icon: "FileText" },
    { id: "results", label: "Итоги", icon: "Award" },
    { id: "shop", label: "Магазин", icon: "ShoppingBag" },
    { id: "about", label: "О нас", icon: "Users" },
  ];

  const contests = [
    {
      id: 1,
      title: "Мой любимый питомец",
      category: "Рисунок",
      deadline: "15 марта 2026",
      participants: 127,
      status: "active",
    },
    {
      id: 2,
      title: "Космос будущего",
      category: "Акварель",
      deadline: "22 марта 2026",
      participants: 89,
      status: "active",
    },
    {
      id: 3,
      title: "Весенние цветы",
      category: "Живопись",
      deadline: "10 апреля 2026",
      participants: 156,
      status: "new",
    },
  ];

  const galleryWorks = [
    { id: 1, title: "Рыжий кот", author: "Маша, 8 лет", likes: 42, contest: "Мой любимый питомец" },
    { id: 2, title: "Ракета Мечты", author: "Саша, 10 лет", likes: 38, contest: "Космос будущего" },
    { id: 3, title: "Золотая рыбка", author: "Лиза, 7 лет", likes: 55, contest: "Мой любимый питомец" },
    { id: 4, title: "Звездный путь", author: "Ваня, 9 лет", likes: 29, contest: "Космос будущего" },
    { id: 5, title: "Веселый щенок", author: "Катя, 11 лет", likes: 47, contest: "Мой любимый питомец" },
    { id: 6, title: "Планета мечты", author: "Дима, 12 лет", likes: 33, contest: "Космос будущего" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 backdrop-blur-md shadow-md" style={{ background: 'linear-gradient(to right, #FEFEFE, #FFFBDB)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <img 
              src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/e82b8f7c-a118-41b6-8b0e-c286cb3902bb.png" 
              alt="Мечтай, твори, дерзай!" 
              className="h-32 w-auto object-contain"
            />
            <div className="hidden md:flex gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "text-foreground hover:bg-accent hover:scale-105"
                  }`}
                >
                  <Icon name={item.icon as any} size={18} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {activeSection === "home" && (
        <div className="container mx-auto px-4 py-12">
          <section className="text-center mb-16 animate-in fade-in duration-700">
            <div className="inline-block mb-6">
              <Badge className="text-lg px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white border-0">
                ✨ Раскрой свой талант!
              </Badge>
            </div>
            <h2 className="text-5xl md:text-7xl font-heading font-bold mb-6" style={{ color: '#E31E24' }}>
              Твори и побеждай!
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Участвуй в онлайн-конкурсах изобразительного искусства, делись работами и получай призы!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="text-lg px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl">
                <Icon name="Palette" className="mr-2" />
                Участвовать в конкурсе
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-2xl border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
              >
                <Icon name="Image" className="mr-2" />
                Смотреть галерею
              </Button>
            </div>
          </section>

          <section className="mb-16">
            <h3 className="text-4xl font-heading font-bold text-center mb-8 text-primary">🏆 Активные конкурсы</h3>
            <div className="grid md:grid-cols-3 gap-6">
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
          </section>

          <section>
            <h3 className="text-4xl font-heading font-bold text-center mb-8 text-secondary">🎨 Галерея лучших работ</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {galleryWorks.map((work) => (
                <Card
                  key={work.id}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl"
                >
                  <div className="h-56 bg-gradient-to-br from-secondary via-info/30 to-success/30 flex items-center justify-center">
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

      <footer className="bg-gradient-to-r from-primary via-secondary to-success text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/e82b8f7c-a118-41b6-8b0e-c286cb3902bb.png" 
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