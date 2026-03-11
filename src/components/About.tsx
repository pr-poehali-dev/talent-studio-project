import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AboutProps {
  onBack: () => void;
}

const About = ({ onBack }: AboutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-secondary/20 to-muted/30">
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">О нас</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">VitaMatch — Ваш персональный нутрициолог</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Мы создали инновационную платформу, которая помогает людям заботиться о своем здоровье 
              через персонализированный подбор витаминов и микронутриентов.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon name="Target" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Наша миссия</h3>
              <p className="text-muted-foreground">
                Сделать персонализированную заботу о здоровье доступной каждому через 
                технологии и науку.
              </p>
            </Card>

            <Card className="p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="w-12 h-12 rounded-xl bg-secondary/60 flex items-center justify-center mb-4">
                <Icon name="Eye" size={24} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Наше видение</h3>
              <p className="text-muted-foreground">
                Мир, где каждый человек понимает потребности своего организма и получает 
                необходимую поддержку для здоровой жизни.
              </p>
            </Card>
          </div>

          <Card className="p-8 mb-12 bg-gradient-to-br from-primary/5 to-secondary/5 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h3 className="text-2xl font-bold mb-6">Почему мы?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong>Научный подход:</strong> Все рекомендации основаны на клинических 
                  исследованиях и актуальных данных доказательной медицины.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong>AI-технологии:</strong> Умные алгоритмы анализируют более 50 параметров 
                  для максимально точного подбора витаминов.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong>Качественные продукты:</strong> Работаем только с проверенными производителями, 
                  имеющими международные сертификаты GMP.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong>Доступность:</strong> Простой интерфейс и понятные рекомендации — 
                  забота о здоровье становится легкой и приятной.
                </div>
              </div>
            </div>
          </Card>

          <div className="text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <h3 className="text-2xl font-bold mb-4">Присоединяйтесь к нам!</h3>
            <p className="text-muted-foreground mb-6">
              Более 15 000 человек уже доверили нам заботу о своем здоровье
            </p>
            <Button size="lg" onClick={onBack}>
              <Icon name="Home" size={20} className="mr-2" />
              Вернуться на главную
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
