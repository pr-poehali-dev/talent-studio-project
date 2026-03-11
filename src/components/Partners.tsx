import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface PartnersProps {
  onBack: () => void;
}

const Partners = ({ onBack }: PartnersProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-secondary/20 to-muted/30">
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Партнерская программа</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Icon name="Handshake" size={40} className="text-primary" />
            </div>
            <h2 className="text-4xl font-bold mb-6">Зарабатывайте вместе с VitaMatch</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Станьте нашим партнером и получайте стабильный доход, помогая людям заботиться о здоровье
            </p>
          </div>

          <Card className="p-8 mb-12 bg-gradient-to-br from-primary/10 to-secondary/10 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Icon name="TrendingUp" size={28} className="text-primary" />
              Условия программы
            </h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  15%
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Комиссия с каждой продажи</h4>
                  <p className="text-muted-foreground">
                    Получайте 15% от стоимости каждого заказа, оформленного по вашей ссылке
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                  30
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Срок cookie — 30 дней</h4>
                  <p className="text-muted-foreground">
                    Вы получите комиссию, даже если клиент оформит заказ в течение месяца после первого клика
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <Icon name="Wallet" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">Еженедельные выплаты</h4>
                  <p className="text-muted-foreground">
                    Автоматический вывод средств каждую неделю на вашу карту или электронный кошелек
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="Users" size={32} className="text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Для блогеров</h3>
              <p className="text-muted-foreground text-sm">
                Делитесь полезным контентом и монетизируйте аудиторию
              </p>
            </Card>

            <Card className="p-6 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="w-16 h-16 rounded-xl bg-secondary/60 flex items-center justify-center mx-auto mb-4">
                <Icon name="Stethoscope" size={32} className="text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Для специалистов</h3>
              <p className="text-muted-foreground text-sm">
                Диетологи, тренеры, врачи — рекомендуйте проверенные продукты
              </p>
            </Card>

            <Card className="p-6 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="w-16 h-16 rounded-xl bg-accent/60 flex items-center justify-center mx-auto mb-4">
                <Icon name="Globe" size={32} className="text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-2">Для вебмастеров</h3>
              <p className="text-muted-foreground text-sm">
                Владельцы сайтов о здоровье — зарабатывайте на трафике
              </p>
            </Card>
          </div>

          <Card className="p-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <h3 className="text-2xl font-bold mb-6">Как начать?</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                  1
                </div>
                <p>Заполните форму заявки с контактными данными</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                  2
                </div>
                <p>Дождитесь одобрения (обычно 1-2 рабочих дня)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                  3
                </div>
                <p>Получите персональную партнерскую ссылку</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                  4
                </div>
                <p>Начните продвигать сервис и зарабатывать!</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t">
              <div className="text-center">
                <Button size="lg" className="text-lg px-8">
                  <Icon name="Mail" size={20} className="mr-2" />
                  Отправить заявку на partners@vitamatch.ru
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Вопросы? Пишите на почту или в Telegram: @vitamatch_partner
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Partners;
