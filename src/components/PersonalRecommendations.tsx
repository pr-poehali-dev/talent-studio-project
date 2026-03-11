import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import CheckoutDialog from '@/components/CheckoutDialog';
import { getSurveyUrl } from '@/config/api';
import { analyzeUserProfile, consolidateDeficiencies } from '@/services/vitaminAnalysis';
import type { HealthAnalysis } from '@/services/vitaminAnalysis';

interface PersonalRecommendationsProps {
  userId: number;
  surveyId: number;
  onBack: () => void;
}

export default function PersonalRecommendations({ userId, surveyId, onBack }: PersonalRecommendationsProps) {
  const cleanUserId = typeof userId === 'number' ? userId : parseInt(String(userId).split(':')[0], 10);
  const cleanSurveyId = typeof surveyId === 'number' ? surveyId : parseInt(String(surveyId).split(':')[0], 10);
  
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [userName, setUserName] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<1 | 2 | 3>(3);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    console.log('🔬 PersonalRecommendations mounted:', { 
      original: { userId, surveyId }, 
      cleaned: { cleanUserId, cleanSurveyId } 
    });
    loadAnalysis();
  }, [cleanUserId, cleanSurveyId]);

  const loadAnalysis = async () => {
    try {
      const url = getSurveyUrl('status') + `&survey_id=${cleanSurveyId}`;
      console.log('📊 Loading user analysis from:', url);
      
      const userResponse = await fetch(url);
      console.log('📡 Analysis response:', { status: userResponse.status, ok: userResponse.ok });
      
      if (!userResponse.ok) {
        console.error('❌ Failed to load analysis');
        setLoading(false);
        return;
      }
      
      const userData = await userResponse.json();
      console.log('✅ User data loaded:', userData);
      setUserName(userData.user_name);

      // Загружаем ответы из всех этапов
      // TODO: Нужно создать endpoint для получения всех ответов
      // Пока используем mock данные с проверкой заполненности этапов
      
      const mockProfile = {
        name: userData.user_name,
        birthDate: '1990-01-01',
        goals: ['Поддержка иммунитета', 'Качество сна', 'Уровень энергии'],
        // Добавляем ответы только если этапы заполнены
        stage2Answers: userData.stage2_completed ? {
          19: 'Часто',
          20: 'Да, небольшие',
          21: 'Часто (3-5 раз)',
          24: 'Высокий',
          23: 'Да, иногда',
          27: 'Да, умеренное',
          28: 'Средняя (2-3 раза в неделю)',
          29: 'Менее 30 минут'
        } : undefined,
        stage3Answers: userData.stage3_completed ? {
          1002: 'Редко/никогда',
          1004: 'Раз в месяц',
          1005: 'Редко',
          1007: 'Несколько раз в неделю',
          1008: 'Несколько раз в неделю',
          1009: 'Редко',
          1012: 'Нет, питаюсь обычно',
          1014: '1-1.5 литра',
          1019: 'Нет',
          1020: 'Умеренно - есть любимые продукты, которые ем часто'
        } : undefined
      };

      const result = analyzeUserProfile(mockProfile);
      setAnalysis(result);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Анализируем ваши данные...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Не удалось загрузить анализ</p>
            <Button onClick={onBack} className="mt-4">
              Вернуться
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const consolidatedDeficiencies = consolidateDeficiencies(
    analysis.vitaminDeficiencies,
    analysis.nutrientDeficiencies
  );

  const criticalDeficiencies = consolidatedDeficiencies.filter(d => d.level === 'высокий');
  const moderateDeficiencies = consolidatedDeficiencies.filter(d => d.level === 'средний');

  // Проверяем заполненность этапов через наличие данных
  const hasStage2Data = analysis.healthConcerns.length > 0 || analysis.lifestyle.length > 2;
  const hasStage3Data = analysis.dietaryHabits.length > 0 || analysis.nutrientDeficiencies.length > 0;
  const allStagesCompleted = hasStage2Data && hasStage3Data;

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-5xl">
        {/* Заголовок */}
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

        {/* Уведомление о неполных данных */}
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

        {/* Сводка */}
        <div className="grid gap-4 md:grid-cols-3 mb-8 animate-fade-in">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Icon name="AlertTriangle" size={20} className="text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{criticalDeficiencies.length}</p>
                  <p className="text-sm text-muted-foreground">Критических дефицитов</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Icon name="AlertCircle" size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{moderateDeficiencies.length}</p>
                  <p className="text-sm text-muted-foreground">Умеренных дефицитов</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Target" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{analysis.priorities.length}</p>
                  <p className="text-sm text-muted-foreground">Приоритетных целей</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Основные разделы */}
        <Accordion type="multiple" defaultValue={['goals', 'deficiencies']} className="space-y-4">
          {/* Приоритетные цели */}
          <AccordionItem value="goals" className="border rounded-lg px-6 bg-card animate-scale-in">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Icon name="Target" size={24} className="text-primary" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Ваши приоритетные цели</h3>
                  <p className="text-sm text-muted-foreground">Цели, выбранные вами</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-3">
                {analysis.priorities.map((goal, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                    <Icon name="CheckCircle2" size={20} className="text-primary mt-0.5" />
                    <span className="font-medium">{goal}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Образ жизни */}
          <AccordionItem value="lifestyle" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Icon name="Activity" size={24} className="text-blue-500" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Образ жизни</h3>
                  <p className="text-sm text-muted-foreground">Факторы, влияющие на здоровье</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-2">
                {analysis.lifestyle.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Icon name="Circle" size={8} className="text-blue-500 mt-2" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Особенности здоровья */}
          {analysis.healthConcerns.length > 0 && (
            <AccordionItem value="health" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Icon name="Heart" size={24} className="text-red-500" />
                  <div className="text-left">
                    <h3 className="text-xl font-semibold">Особенности здоровья</h3>
                    <p className="text-sm text-muted-foreground">На что обратить внимание</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-2">
                  {analysis.healthConcerns.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                      <Icon name="AlertCircle" size={18} className="text-red-500 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Пищевые привычки */}
          {analysis.dietaryHabits.length > 0 && (
            <AccordionItem value="diet" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Icon name="Apple" size={24} className="text-green-500" />
                  <div className="text-left">
                    <h3 className="text-xl font-semibold">Пищевые привычки</h3>
                    <p className="text-sm text-muted-foreground">Особенности вашего рациона</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-2">
                  {analysis.dietaryHabits.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Icon name="Circle" size={8} className="text-green-500 mt-2" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Географические факторы */}
          <AccordionItem value="geo" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Icon name="MapPin" size={24} className="text-purple-500" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Географические факторы</h3>
                  <p className="text-sm text-muted-foreground">Климат и окружающая среда</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-2">
                {analysis.geographicFactors.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Icon name="Circle" size={8} className="text-purple-500 mt-2" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Выявленные дефициты */}
          <AccordionItem value="deficiencies" className="border rounded-lg px-6 bg-card animate-scale-in" style={{ animationDelay: '0.5s' }}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Icon name="Pill" size={24} className="text-orange-500" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold">Выявленные дефициты</h3>
                  <p className="text-sm text-muted-foreground">Витамины и микронутриенты</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-4">
                {/* Критические */}
                {criticalDeficiencies.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="destructive">Критический уровень</Badge>
                      <span className="text-sm text-muted-foreground">Требуется немедленное внимание</span>
                    </h4>
                    <div className="space-y-3">
                      {criticalDeficiencies.map((def, index) => (
                        <Card key={index} className="border-red-200 bg-red-50/50">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold text-lg">{def.name}</h5>
                              <Badge variant="destructive" className="text-xs">Высокий</Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Причины дефицита:</p>
                              <ul className="space-y-1">
                                {def.reasons.map((reason, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <Icon name="AlertTriangle" size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Умеренные */}
                {moderateDeficiencies.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="outline" className="border-yellow-600 text-yellow-700">Умеренный уровень</Badge>
                      <span className="text-sm text-muted-foreground">Рекомендуется восполнить</span>
                    </h4>
                    <div className="space-y-3">
                      {moderateDeficiencies.map((def, index) => (
                        <Card key={index} className="border-yellow-200 bg-yellow-50/30">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold">{def.name}</h5>
                              <Badge variant="outline" className="text-xs border-yellow-600 text-yellow-700">Средний</Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-muted-foreground">Рекомендации:</p>
                              <ul className="space-y-1">
                                {def.reasons.map((reason, i) => (
                                  <li key={i} className="text-sm flex items-start gap-2">
                                    <Icon name="Info" size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Оптимальный витаминный комплекс */}
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
                  onClick={() => setSelectedDuration(1)}
                >
                  <Icon name="Zap" size={18} className="mr-2" />
                  1 месяц
                </Button>
                <Button 
                  variant={selectedDuration === 2 ? "default" : "outline"} 
                  className="flex-1 min-w-[120px] border-2"
                  onClick={() => setSelectedDuration(2)}
                >
                  <Icon name="Package" size={18} className="mr-2" />
                  2 месяца
                </Button>
                <Button 
                  variant={selectedDuration === 3 ? "default" : "outline"} 
                  className="flex-1 min-w-[120px] border-2 relative"
                  onClick={() => setSelectedDuration(3)}
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
                      onClick={() => setCheckoutOpen(true)}
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
      </div>

      <CheckoutDialog
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        amount={selectedDuration === 1 ? 2990 : selectedDuration === 2 ? 5490 : 7490}
        duration={selectedDuration}
        userId={cleanUserId}
        surveyId={cleanSurveyId}
      />
    </div>
  );
}