import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { SurveyData } from '@/pages/Index';
import { calculateRecommendations, getSynergies } from '@/services/vitaminRecommendations';

interface ResultsProps {
  data: SurveyData;
  onViewCatalog: () => void;
  onBack: () => void;
}

const Results = ({ data, onViewCatalog, onBack }: ResultsProps) => {
  const [recommendations, setRecommendations] = useState<Array<{
    product: any;
    reason: string;
    score: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://functions.poehali.dev/6278c723-8882-4348-a57b-4a0136730417');
        const catalogData = await response.json();
        const products = catalogData.products || [];
        
        const smartRecommendations = calculateRecommendations(data, products);
        setRecommendations(smartRecommendations);
        
        const { saveRecommendations } = await import('@/services/recommendationsHistory');
        saveRecommendations(data, smartRecommendations);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [data]);

  const getPriorityColor = (score: number) => {
    if (score >= 30) return 'bg-primary text-primary-foreground';
    if (score >= 15) return 'bg-accent text-accent-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 30) return 'Необходимо';
    if (score >= 15) return 'Рекомендовано';
    return 'Опционально';
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
            <Icon name="Sparkles" size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Ваш персональный план
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            На основе анализа ваших данных, мы подобрали оптимальный комплекс витаминов и добавок
          </p>
        </div>

        <Card className="p-8 mb-8 bg-gradient-to-br from-secondary/50 to-accent/30 border-0 shadow-lg animate-scale-in">
          <div className="flex items-center gap-4 mb-6">
            <Icon name="Target" size={32} className="text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Ваши цели</h3>
              <p className="text-muted-foreground">На что направлен подбор витаминов</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.goals.map((goal, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-2 px-4">
                {goal}
              </Badge>
            ))}
          </div>
        </Card>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Рекомендованные витамины</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Icon name="Loader2" size={48} className="animate-spin text-primary" />
            </div>
          ) : recommendations.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Не удалось подобрать витамины. Попробуйте пройти анкету заново.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recommendations.map((item, index) => (
                <Card 
                  key={index} 
                  className="p-6 hover-scale transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{item.product.emoji || '💊'}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{item.product.name}</h3>
                        <Badge className={getPriorityColor(item.score)}>
                          {getPriorityLabel(item.score)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{item.reason}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Icon name="Pill" size={16} className="text-primary" />
                          <span className="font-medium">{item.product.dosage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Package" size={16} className="text-primary" />
                          <span className="text-muted-foreground">{item.product.count}</span>
                        </div>
                        <span className="font-semibold text-primary ml-auto">{item.product.price} ₽</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Icon name="Plus" size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/5 to-muted/30 border-0 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <Icon name="Info" size={32} className="text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Рекомендации по приему</h3>
              <p className="text-muted-foreground">Как правильно принимать витамины</p>
            </div>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Принимайте витамины во время еды для лучшего усвоения</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Омега-3 и жирорастворимые витамины лучше усваиваются с жирной пищей</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Магний рекомендуется принимать вечером для улучшения сна</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Курс приема: минимум 3 месяца для накопительного эффекта</span>
            </li>
          </ul>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button variant="outline" onClick={onBack} className="flex-1 rounded-full">
            <Icon name="ArrowLeft" className="mr-2" size={18} />
            Вернуться
          </Button>
          <Button onClick={onViewCatalog} size="lg" className="flex-1 rounded-full">
            <Icon name="ShoppingCart" className="mr-2" size={18} />
            Перейти в каталог
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;