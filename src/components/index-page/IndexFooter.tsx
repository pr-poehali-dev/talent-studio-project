import Icon from "@/components/ui/icon";

interface IndexFooterProps {
  setActiveSection: (s: string) => void;
}

const IndexFooter = ({ setActiveSection }: IndexFooterProps) => {
  return (
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
              <button onClick={() => setActiveSection('home')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left">
                <Icon name="Home" size={16} />Главная
              </button>
              <button onClick={() => setActiveSection('contests')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left">
                <Icon name="Trophy" size={16} />Все конкурсы
              </button>
              <button onClick={() => setActiveSection('documents')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left">
                <Icon name="FileText" size={16} />Документы
              </button>
              <button onClick={() => setActiveSection('results')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left">
                <Icon name="Award" size={16} />Итоги
              </button>
              <button onClick={() => setActiveSection('shop')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left">
                <Icon name="ShoppingBag" size={16} />Магазин
              </button>
              <button onClick={() => setActiveSection('reviews')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left">
                <Icon name="MessageSquare" size={16} />Отзывы
              </button>
              <button onClick={() => setActiveSection('about')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left">
                <Icon name="Info" size={16} />О нас
              </button>
              <button onClick={() => setActiveSection('designer')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-full text-left">
                <Icon name="PenTool" size={16} />Услуги дизайнера
              </button>
            </nav>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4 text-primary">Контакты</h3>
            <div className="space-y-3">
              <a href="https://студия-талантов.рф" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Globe" size={16} />студия-талантов.рф
              </a>
              <a href="mailto:studio-talantov@yandex.ru" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Mail" size={16} />studio-talantov@yandex.ru
              </a>
              <a href="tel:+79082433179" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Icon name="Phone" size={16} />+7 (908) 243-31-79
              </a>
              <a href="https://vk.com/studio.talantov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Icon name="MessageCircle" size={16} />VK: studio.talantov
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
  );
};

export default IndexFooter;
