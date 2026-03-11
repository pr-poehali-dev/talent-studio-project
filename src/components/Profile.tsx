import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { SurveyData } from '@/pages/Index';
import { getRecommendationsHistory, deleteRecommendation, formatDate } from '@/services/recommendationsHistory';
import { getSynergies } from '@/services/vitaminRecommendations';

interface ProfileProps {
  data: SurveyData;
  onBack: () => void;
  onCheckout: (items?: Array<{id: number; name: string; price: number; quantity: number; emoji: string}>) => void;
}

const Profile = ({ data, onBack, onCheckout }: ProfileProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<any | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const historyData = getRecommendationsHistory();
    setHistory(historyData);
    if (historyData.length > 0 && !selectedHistory) {
      setSelectedHistory(historyData[0]);
    }
  };

  const handleDeleteHistory = (id: number) => {
    if (confirm('Удалить эту историю рекомендаций?')) {
      deleteRecommendation(id);
      loadHistory();
    }
  };

  const recommendedVitamins = selectedHistory?.recommendations.map((rec: any) => ({
    id: rec.product.id,
    name: rec.product.name,
    dosage: rec.product.dosage,
    count: rec.product.count,
    price: rec.product.price,
    emoji: rec.product.emoji || '💊',
    reason: rec.reason,
    timing: 'По инструкции',
    quantity: 1
  })) || [];

  const totalPrice = recommendedVitamins.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const productNames = recommendedVitamins.map(v => v.name);
  const synergies = getSynergies(productNames);

  const morningVitamins = recommendedVitamins
    .filter(v => !v.name.toLowerCase().includes('магний') && !v.name.toLowerCase().includes('мелатонин'))
    .map(v => v.name);
  
  const eveningVitamins = recommendedVitamins
    .filter(v => v.name.toLowerCase().includes('магний') || v.name.toLowerCase().includes('мелатонин'))
    .map(v => v.name);

  const schedule = [
    ...(morningVitamins.length > 0 ? [{ time: '8:00 - 9:00', items: morningVitamins, meal: 'С завтраком' }] : []),
    ...(eveningVitamins.length > 0 ? [{ time: '22:00 - 23:00', items: eveningVitamins, meal: 'За час до сна' }] : [])
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-full">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Личный кабинет</h1>
              <p className="text-muted-foreground mt-1">Ваш персональный план витаминов</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2">
            <Icon name="CheckCircle" size={16} className="mr-2" />
            План составлен
          </Badge>
        </div>

        {/* История рекомендаций */}
        {history.length > 1 && (
          <div className="mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Icon name="History" size={24} className="text-primary" />
              История рекомендаций
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item, index) => (
                <Card
                  key={item.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedHistory?.id === item.id
                      ? 'border-primary border-2 shadow-lg'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedHistory(item)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon name="FileText" size={18} className="text-primary" />
                      <Badge variant={selectedHistory?.id === item.id ? 'default' : 'outline'}>
                        {index === 0 ? 'Актуальный' : formatDate(item.created_at)}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHistory(item.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Target" size={14} />
                      <span className="line-clamp-1">{item.survey_data.goals.slice(0, 2).join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Package" size={14} />
                      <span>{item.recommendations.length} витаминов</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Ваш курс витаминов */}
        {recommendedVitamins.length > 0 ? (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Icon name="Sparkles" size={24} className="text-primary" />
              Ваш персональный курс
            </h2>
            <div className="grid gap-4">
              {recommendedVitamins.map((vitamin, index) => (
              <Card 
                key={vitamin.id} 
                className="p-6 hover-scale animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{vitamin.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold">{vitamin.name}</h3>
                        <p className="text-sm text-muted-foreground">{vitamin.dosage} • {vitamin.count}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{vitamin.price} ₽</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Target" size={16} className="mt-0.5 text-primary flex-shrink-0" />
                        <span><strong>Зачем:</strong> {vitamin.reason}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Icon name="Clock" size={16} className="mt-0.5 text-primary flex-shrink-0" />
                        <span><strong>Когда принимать:</strong> {vitamin.timing}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        ) : (
          <Card className="p-8 text-center mb-8">
            <Icon name="ClipboardList" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">История рекомендаций пуста</h3>
            <p className="text-muted-foreground mb-4">Пройдите анкету, чтобы получить персональные рекомендации</p>
            <Button onClick={onBack}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Вернуться на главную
            </Button>
          </Card>
        )}

        {/* FAQ секция */}
        {recommendedVitamins.length > 0 && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Icon name="MessageCircleQuestion" size={24} className="text-primary" />
            Частые вопросы о вашем курсе
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-1" className="border rounded-2xl px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Calendar" size={20} className="text-primary" />
                  </div>
                  <span className="font-semibold">Когда вы почувствуете результат?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 text-muted-foreground">
                <div className="space-y-3 pl-13">
                  <p><strong>1-2 недели:</strong> Улучшение сна и снижение стресса (магний), больше энергии утром (B-комплекс)</p>
                  <p><strong>3-4 недели:</strong> Повышение концентрации, улучшение настроения (D3, Омега-3)</p>
                  <p><strong>2-3 месяца:</strong> Укрепление иммунитета, улучшение состояния кожи и волос</p>
                  <Progress value={33} className="mt-4" />
                  <p className="text-sm">Оптимальный курс: 3 месяца для стабильного эффекта</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-2xl px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Zap" size={20} className="text-primary" />
                  </div>
                  <span className="font-semibold">Как витамины усиливают друг друга в вашем курсе?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 text-muted-foreground">
                <div className="space-y-4 pl-13">
                  {synergies.map((synergy, index) => (
                    <div key={index} className="flex gap-3 p-4 rounded-xl bg-secondary/20">
                      <Icon name="Sparkles" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground mb-1">{synergy.combo}</p>
                        <p className="text-sm">{synergy.effect}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-2xl px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Pill" size={20} className="text-primary" />
                  </div>
                  <span className="font-semibold">Сколько витаминов можно принимать вам?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 text-muted-foreground">
                <div className="space-y-3 pl-13">
                  <p>Ваш план включает <strong>4 добавки</strong> — это безопасное количество для одновременного приёма.</p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="CheckCircle" size={18} className="text-green-600" />
                        <span className="font-semibold text-green-600">Безопасно</span>
                      </div>
                      <p className="text-sm">4-6 добавок в день — норма для комплексного подхода</p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Info" size={18} className="text-blue-600" />
                        <span className="font-semibold text-blue-600">Важно</span>
                      </div>
                      <p className="text-sm">Следуйте указанным дозировкам и времени приёма</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-2xl px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="Clock" size={20} className="text-primary" />
                  </div>
                  <span className="font-semibold">Ваш оптимальный режим приёма витаминов</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 text-muted-foreground">
                <div className="space-y-4 pl-13">
                  {schedule.map((slot, index) => (
                    <div key={index} className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {slot.time.split(' - ')[0].split(':')[0]}:00
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{slot.time}</p>
                          <p className="text-sm">{slot.meal}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {slot.items.map((item, i) => (
                          <Badge key={i} variant="secondary">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex gap-3">
                      <Icon name="Lightbulb" size={20} className="text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-yellow-600 mb-1">Совет</p>
                        <p className="text-sm text-muted-foreground">Принимайте витамины в одно и то же время каждый день для лучшего эффекта</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border rounded-2xl px-6 bg-card">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon name="TrendingUp" size={20} className="text-primary" />
                  </div>
                  <span className="font-semibold">Как отслеживать ваш прогресс?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6 text-muted-foreground">
                <div className="space-y-3 pl-13">
                  <p className="mb-4">Ведите дневник самочувствия и отмечайте изменения:</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                      <Icon name="Moon" size={18} className="text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-foreground">Качество сна</p>
                        <p className="text-sm">Засыпание, глубина сна, бодрость утром</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                      <Icon name="Battery" size={18} className="text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-foreground">Уровень энергии</p>
                        <p className="text-sm">Оцените по 10-балльной шкале утром и вечером</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                      <Icon name="Smile" size={18} className="text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-foreground">Настроение</p>
                        <p className="text-sm">Стрессоустойчивость, общий эмоциональный фон</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20">
                      <Icon name="Brain" size={18} className="text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-foreground">Концентрация</p>
                        <p className="text-sm">Способность фокусироваться на задачах</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        )}

        {/* Корзина */}
        {recommendedVitamins.length > 0 && (
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Icon name="ShoppingBag" size={24} className="text-primary" />
              Готовая корзина с вашими витаминами
            </h2>
            
            <div className="space-y-4 mb-6">
              {recommendedVitamins.map((vitamin) => (
                <div key={vitamin.id} className="flex items-center justify-between p-4 rounded-xl bg-card">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{vitamin.emoji}</div>
                    <div>
                      <p className="font-semibold">{vitamin.name}</p>
                      <p className="text-sm text-muted-foreground">{vitamin.dosage} • {vitamin.count}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{vitamin.price} ₽</p>
                    <p className="text-xs text-muted-foreground">× {vitamin.quantity} шт</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-muted-foreground mb-1">Итого к оплате</p>
                  <p className="text-4xl font-bold">{totalPrice.toLocaleString()} ₽</p>
                  <p className="text-sm text-muted-foreground mt-1">Курс на 2-3 месяца</p>
                </div>
                <Button size="lg" className="rounded-full px-8" onClick={() => onCheckout(recommendedVitamins)}>
                  Оформить заказ
                  <Icon name="ArrowRight" className="ml-2" size={20} />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Truck" size={18} className="text-primary" />
                  <span>Доставка 2-3 дня</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Shield" size={18} className="text-primary" />
                  <span>Гарантия качества</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Percent" size={18} className="text-primary" />
                  <span>Скидка на повтор</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
};

export default Profile;