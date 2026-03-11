import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">О нас</h1>
            <p className="text-xl text-muted-foreground">
              Мы помогаем людям заботиться о своем здоровье с помощью персонализированного подбора витаминов
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="Target" size={24} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Наша миссия</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Сделать персонализированный подход к здоровью доступным каждому. Мы верим, что правильно подобранные 
                    витамины и БАДы могут значительно улучшить качество жизни, повысить энергию и укрепить иммунитет.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Lightbulb" size={24} className="text-secondary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Как мы работаем</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Наш сервис использует алгоритмы искусственного интеллекта для анализа более 50 параметров вашего здоровья, 
                    образа жизни и целей. На основе этих данных мы формируем персональные рекомендации по витаминам и БАДам.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-primary mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">Научный подход на основе клинических исследований</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-primary mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">Учет индивидуальных особенностей организма</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={16} className="text-primary mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground">Только сертифицированные производители</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="p-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Users" size={24} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Наша команда</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Мы — команда специалистов в области нутрициологии, медицины и IT. Наша цель — сделать сложные медицинские 
                    знания понятными и доступными для каждого, кто хочет улучшить свое здоровье.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">15 000+</div>
                <div className="text-muted-foreground">Довольных клиентов</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Точность рекомендаций</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">5 лет</div>
                <div className="text-muted-foreground">На рынке</div>
              </Card>
            </div>
          </div>

          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <Link to="/">
              <Button size="lg" className="text-lg px-8">
                <Icon name="Home" size={20} className="mr-2" />
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
