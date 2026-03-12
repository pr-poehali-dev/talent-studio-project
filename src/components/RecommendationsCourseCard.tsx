import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import CheckoutDialog from '@/components/CheckoutDialog';

interface RecommendationsCourseCardProps {
  selectedDuration: 1 | 2 | 3;
  onSelectDuration: (d: 1 | 2 | 3) => void;
  checkoutOpen: boolean;
  onOpenCheckout: () => void;
  onCloseCheckout: () => void;
  userId: number;
  surveyId: number;
}

const RecommendationsCourseCard = ({
  selectedDuration,
  onSelectDuration,
  checkoutOpen,
  onOpenCheckout,
  onCloseCheckout,
  userId,
  surveyId,
}: RecommendationsCourseCardProps) => {
  return (
    <>
      <Card className="mt-8 border-2 border-primary animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="text-2xl md:text-3xl text-center">
            Подобрали для вас оптимальный витаминный комплекс
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Табы выбора длительности */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Button
                variant={selectedDuration === 1 ? "default" : "outline"}
                className="flex-1 min-w-[120px] border-2"
                onClick={() => onSelectDuration(1)}
              >
                <Icon name="Zap" size={18} className="mr-2" />
                1 месяц
              </Button>
              <Button
                variant={selectedDuration === 2 ? "default" : "outline"}
                className="flex-1 min-w-[120px] border-2"
                onClick={() => onSelectDuration(2)}
              >
                <Icon name="Package" size={18} className="mr-2" />
                2 месяца
              </Button>
              <Button
                variant={selectedDuration === 3 ? "default" : "outline"}
                className="flex-1 min-w-[120px] border-2 relative"
                onClick={() => onSelectDuration(3)}
              >
                <Icon name="Sparkles" size={18} className="mr-2" />
                3 месяца
                {selectedDuration === 3 && (
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                    Подходит вам
                  </Badge>
                )}
              </Button>
            </div>

            {/* Карточка выбранного курса */}
            <div className="border-2 border-primary rounded-xl p-6 bg-gradient-to-br from-primary/5 to-background">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-500 text-white">
                        <Icon name="Clock" size={14} className="mr-1" />
                        {selectedDuration * 30} дней
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">
                      Курс на {selectedDuration} {selectedDuration === 1 ? 'месяц' : selectedDuration < 5 ? 'месяца' : 'месяцев'}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {selectedDuration === 1 && 'Для быстрых первых изменений'}
                      {selectedDuration === 2 && 'Для заметных результатов'}
                      {selectedDuration === 3 && 'Оптимальная длительность для достижения стабильных результатов'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Icon name="Target" size={18} className="text-primary" />
                      Результаты курса:
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Icon name="Droplet" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {selectedDuration === 1 && 'Начнёте восполнять дефициты'}
                          {selectedDuration === 2 && 'Значительно восполните дефициты'}
                          {selectedDuration === 3 && 'Восполните основные дефициты'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="Smile" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {selectedDuration === 1 && 'Почувствуете первые улучшения'}
                          {selectedDuration === 2 && 'Заметите улучшение самочувствия'}
                          {selectedDuration === 3 && 'Стабильно улучшите самочувствие'}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="Sparkles" size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">
                          {selectedDuration === 1 && 'Попробуете витаминную поддержку'}
                          {selectedDuration === 2 && 'Начнёте формировать привычку'}
                          {selectedDuration === 3 && 'Сформируете здоровую привычку'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold">
                        {selectedDuration === 1 && '2 990 ₽'}
                        {selectedDuration === 2 && '5 490 ₽'}
                        {selectedDuration === 3 && '7 490 ₽'}
                      </span>
                      {selectedDuration === 3 && (
                        <span className="text-sm text-muted-foreground line-through">9 990 ₽</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <Icon name="CreditCard" size={12} className="inline mr-1" />
                      частями от {selectedDuration === 1 ? '997' : selectedDuration === 2 ? '1 830' : '2 497'} ₽
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full text-lg"
                    onClick={onOpenCheckout}
                  >
                    <Icon name="ShoppingCart" size={20} className="mr-2" />
                    Оформить заказ
                  </Button>
                </div>

                <div className="hidden md:block md:w-[200px] relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg"></div>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded-lg">
              <Icon name="Info" size={16} className="inline mr-2" />
              Рекомендуется консультация с врачом перед началом приёма витаминов
            </div>
          </div>
        </CardContent>
      </Card>

      <CheckoutDialog
        isOpen={checkoutOpen}
        onClose={onCloseCheckout}
        amount={selectedDuration === 1 ? 2990 : selectedDuration === 2 ? 5490 : 7490}
        duration={selectedDuration}
        userId={userId}
        surveyId={surveyId}
      />
    </>
  );
};

export default RecommendationsCourseCard;
