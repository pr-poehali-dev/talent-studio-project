import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const SocialSubscribe = () => {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-0 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-8 md:p-12 text-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Подпишись на наши социальные сети
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Начни заботиться о себе уже сегодня. Подпишитесь на наши соц.сети и заберите подарок
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-6 bg-[#0077FF] hover:bg-[#0066DD] text-white"
              onClick={() => window.open('https://vk.com', '_blank')}
            >
              <Icon name="Users" size={24} className="mr-3" />
              ВКонтакте
            </Button>
            
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-6 bg-[#229ED9] hover:bg-[#1E8BC3] text-white"
              onClick={() => window.open('https://t.me', '_blank')}
            >
              <Icon name="Send" size={24} className="mr-3" />
              Telegram
            </Button>
          </div>

          <div className="mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent/20 rounded-full">
              <Icon name="Gift" size={20} className="text-accent" />
              <span className="font-semibold">Бонус при подписке — скидка 10% на первый заказ!</span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SocialSubscribe;
