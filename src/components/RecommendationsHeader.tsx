import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface RecommendationsHeaderProps {
  userName: string;
  allStagesCompleted: boolean;
  hasStage2Data: boolean;
  hasStage3Data: boolean;
  onBack: () => void;
}

const RecommendationsHeader = ({
  userName,
  allStagesCompleted,
  hasStage2Data,
  hasStage3Data,
  onBack,
}: RecommendationsHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="rounded-full">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Персональные рекомендации</h1>
            <p className="text-muted-foreground mt-1">
              {allStagesCompleted ? 'Комплексный анализ' : 'Предварительный анализ'} для {userName}
            </p>
          </div>
        </div>
        <Badge variant={allStagesCompleted ? 'default' : 'secondary'} className="text-sm px-4 py-2">
          <Icon name={allStagesCompleted ? 'CheckCircle2' : 'Clock'} size={16} className="mr-2" />
          {allStagesCompleted ? 'Полный анализ' : 'Предварительно'}
        </Badge>
      </div>

      {!allStagesCompleted && (
        <Card className="mb-8 border-2 border-yellow-500/50 bg-yellow-50/50 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-yellow-700" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2 text-yellow-900">
                  Повысьте точность рекомендаций
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Сейчас рекомендации основаны только на базовых данных (Этап 1). 
                  Пройдите дополнительные этапы опроса — {!hasStage2Data ? 'Этап 2 (образ жизни и здоровье)' : '✓ Этап 2'}
                  {' и '}
                  {!hasStage3Data ? 'Этап 3 (питание и привычки)' : '✓ Этап 3'} — 
                  чтобы получить максимально персонализированный курс витаминов с учётом:
                </p>
                <ul className="space-y-1 text-sm text-yellow-800">
                  {!hasStage2Data && (
                    <>
                      <li className="flex items-start gap-2">
                        <Icon name="Circle" size={8} className="text-yellow-600 mt-1.5 flex-shrink-0" />
                        <span>Ваших симптомов и жалоб на здоровье</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Circle" size={8} className="text-yellow-600 mt-1.5 flex-shrink-0" />
                        <span>Образа жизни и уровня стресса</span>
                      </li>
                    </>
                  )}
                  {!hasStage3Data && (
                    <>
                      <li className="flex items-start gap-2">
                        <Icon name="Circle" size={8} className="text-yellow-600 mt-1.5 flex-shrink-0" />
                        <span>Особенностей вашего рациона питания</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Circle" size={8} className="text-yellow-600 mt-1.5 flex-shrink-0" />
                        <span>Дефицита микронутриентов из-за недостатка определённых продуктов</span>
                      </li>
                    </>
                  )}
                </ul>
                <Button
                  onClick={onBack}
                  className="mt-4 bg-yellow-600 hover:bg-yellow-700"
                  size="sm"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Вернуться к анкетам
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default RecommendationsHeader;
