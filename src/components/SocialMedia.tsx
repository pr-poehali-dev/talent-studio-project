import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const SocialMedia = () => {
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-2 shadow-xl animate-fade-in">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-6">
            <Icon name="Gift" size={48} className="text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Подпишись на наши социальные сети
            </h2>
            <p className="text-lg text-muted-foreground">
              Начни заботиться о себе уже сегодня. Подпишитесь на наши соц.сети и заберите подарок
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto hover-scale group"
              onClick={() => window.open('https://vk.com/', '_blank')}
            >
              <Icon name="MessageCircle" size={20} className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">ВКонтакте</span>
            </Button>

            <Button 
              size="lg" 
              className="w-full sm:w-auto hover-scale group"
              onClick={() => window.open('https://t.me/', '_blank')}
            >
              <Icon name="Send" size={20} className="mr-2 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">Telegram</span>
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Icon name="Sparkles" size={16} />
            <span>Эксклюзивные советы по здоровью и специальные предложения для подписчиков</span>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SocialMedia;
