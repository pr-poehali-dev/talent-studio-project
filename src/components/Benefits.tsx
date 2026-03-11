import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export const benefits = [
  {
    icon: 'Brain',
    title: 'Умный алгоритм',
    description: 'AI анализирует 50+ параметров здоровья для точных рекомендаций',
    color: 'from-primary/20 to-primary/5'
  },
  {
    icon: 'UserCheck',
    title: 'Персональный подход',
    description: 'Учитываем ваш образ жизни, питание, цели и особенности здоровья',
    color: 'from-secondary/60 to-secondary/20'
  },
  {
    icon: 'Microscope',
    title: 'Научная база',
    description: 'Рекомендации основаны на клинических исследованиях и доказательной медицине',
    color: 'from-accent/60 to-accent/20'
  },
  {
    icon: 'TrendingUp',
    title: 'Отслеживание прогресса',
    description: 'Следите за результатами и корректируйте программу приема витаминов',
    color: 'from-muted/80 to-muted/30'
  }
];

const Benefits = () => {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Почему выбирают нас
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Современный подход к здоровью с научной точностью и персональным вниманием
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => (
          <Card 
            key={index} 
            className="p-6 hover-scale cursor-pointer transition-all duration-300 border-0 shadow-lg animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4`}>
              <Icon name={benefit.icon as any} size={28} className="text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
            <p className="text-muted-foreground">{benefit.description}</p>
          </Card>
        ))}
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="text-4xl font-bold text-primary mb-2">15 000+</div>
          <div className="text-muted-foreground">Довольных клиентов</div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="text-4xl font-bold text-primary mb-2">98%</div>
          <div className="text-muted-foreground">Точность рекомендаций</div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="text-4xl font-bold text-primary mb-2">60+</div>
          <div className="text-muted-foreground">Витаминов в каталоге</div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;