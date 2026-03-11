import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

const Partnership = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Партнерская программа</h1>
            <p className="text-xl text-muted-foreground">
              Зарабатывайте вместе с нами, рекомендуя качественные витамины своей аудитории
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-4">до 30%</div>
                <p className="text-xl font-semibold mb-2">Комиссия с продаж</p>
                <p className="text-muted-foreground">
                  Получайте до 30% от стоимости каждого заказа, совершенного по вашей реферальной ссылке
                </p>
              </div>
            </Card>

            <Card className="p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Icon name="Gift" size={28} className="text-primary" />
                Что мы предлагаем
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name="Check" size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Высокие комиссии</h3>
                    <p className="text-muted-foreground">От 15% до 30% с каждой продажи в зависимости от объема</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name="Check" size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Пожизненные отчисления</h3>
                    <p className="text-muted-foreground">Получайте комиссию от всех покупок приведенных клиентов</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name="Check" size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Готовые маркетинговые материалы</h3>
                    <p className="text-muted-foreground">Баннеры, тексты и креативы для продвижения</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon name="Check" size={16} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Персональный менеджер</h3>
                    <p className="text-muted-foreground">Поддержка и консультации по всем вопросам</p>
                  </div>
                </li>
              </ul>
            </Card>

            <Card className="p-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Icon name="Users" size={28} className="text-secondary" />
                Кто может стать партнером
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={20} className="text-secondary mt-0.5 flex-shrink-0" />
                    <span>Блогеры и инфлюенсеры</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={20} className="text-secondary mt-0.5 flex-shrink-0" />
                    <span>Фитнес-тренеры и нутрициологи</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={20} className="text-secondary mt-0.5 flex-shrink-0" />
                    <span>Владельцы тематических сайтов</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={20} className="text-secondary mt-0.5 flex-shrink-0" />
                    <span>Медицинские специалисты</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={20} className="text-secondary mt-0.5 flex-shrink-0" />
                    <span>Владельцы Telegram-каналов</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Icon name="CheckCircle" size={20} className="text-secondary mt-0.5 flex-shrink-0" />
                    <span>Все, кто хочет зарабатывать</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Icon name="Rocket" size={28} className="text-accent" />
                Как начать
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-accent">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Регистрация</h3>
                  <p className="text-sm text-muted-foreground">Заполните заявку на участие в программе</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-accent">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Получите ссылку</h3>
                  <p className="text-sm text-muted-foreground">Мы вышлем вам уникальную партнерскую ссылку</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-accent">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Зарабатывайте</h3>
                  <p className="text-sm text-muted-foreground">Делитесь ссылкой и получайте комиссию</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12 space-y-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <Button size="lg" className="text-lg px-8 py-6 w-full md:w-auto">
              <Icon name="UserPlus" size={24} className="mr-3" />
              Стать партнером
            </Button>
            <div>
              <Link to="/">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  <Icon name="Home" size={20} className="mr-2" />
                  На главную
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partnership;
