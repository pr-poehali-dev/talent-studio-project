import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import SurveyStepTwo from '@/components/SurveyStepTwo';
import SurveyStepThree from '@/components/SurveyStepThree';
import PersonalRecommendations from '@/components/PersonalRecommendations';
import { getSurveyUrl } from '@/config/api';

interface ProfileNewProps {
  userId: number;
  surveyId: number;
  onBack: () => void;
}

interface SurveyStatus {
  stage1_completed: boolean;
  stage2_completed: boolean;
  stage3_completed: boolean;
  user_name: string;
  user_email: string;
}

export default function ProfileNew({ userId, surveyId, onBack }: ProfileNewProps) {
  // Очищаем ID от возможных артефактов вроде "24:1"
  const cleanUserId = typeof userId === 'number' ? userId : parseInt(String(userId).split(':')[0], 10);
  const cleanSurveyId = typeof surveyId === 'number' ? surveyId : parseInt(String(surveyId).split(':')[0], 10);
  
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus | null>(null);
  const [currentStage, setCurrentStage] = useState<'dashboard' | 'stage2' | 'stage3' | 'recommendations'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🏠 ProfileNew mounted with:', { 
      original: { userId, surveyId }, 
      cleaned: { cleanUserId, cleanSurveyId } 
    });
    if (!cleanUserId || !cleanSurveyId || isNaN(cleanUserId) || isNaN(cleanSurveyId)) {
      console.error('❌ ProfileNew: Invalid userId or surveyId!', { cleanUserId, cleanSurveyId });
      return;
    }
    loadSurveyStatus();
  }, [cleanUserId, cleanSurveyId]);

  // DEBUG: Выводим состояние для отладки
  useEffect(() => {
    if (surveyStatus) {
      console.log('📊 ProfileNew render state:', {
        surveyId: cleanSurveyId,
        stage1: surveyStatus.stage1_completed,
        stage2: surveyStatus.stage2_completed,
        stage3: surveyStatus.stage3_completed,
        showRecommendations: surveyStatus.stage1_completed === true
      });
    }
  }, [surveyStatus, cleanSurveyId]);

  const loadSurveyStatus = async (isRefresh = false) => {
    try {
      const url = getSurveyUrl('status') + `&survey_id=${cleanSurveyId}`;
      console.log('🔄 Loading survey status from:', url);
      
      const response = await fetch(url);
      console.log('📡 Survey status response:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Survey status loaded:', data);
        setSurveyStatus(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load survey status:', { status: response.status, error: errorText });
      }
    } catch (error) {
      console.error('💥 Error loading survey status:', error);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  };

  const handleStage2Complete = async (answers: Record<number, any>) => {
    console.log('Saving Stage 2 answers:', { surveyId: cleanSurveyId, answersCount: Object.keys(answers).length });
    try {
      const response = await fetch(getSurveyUrl('submit-stage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: cleanSurveyId,
          stage: 2,
          answers
        })
      });

      const data = await response.json();
      console.log('Stage 2 response:', { status: response.status, data });

      if (response.ok) {
        console.log('🎯 Stage 2 saved successfully, refreshing status...');
        setRefreshing(true);
        
        await loadSurveyStatus(true);
        
        setRefreshing(false);
        setCurrentStage('dashboard');
        console.log('✅ Stage 2 complete, returning to dashboard');
        
        setTimeout(() => {
          alert('✅ Анкета успешно сохранена! Ваши персональные рекомендации обновлены.');
        }, 300);
      } else {
        console.error('❌ Stage 2 save failed:', data);
        alert(`Ошибка при сохранении анкеты: ${data.error || 'Попробуйте снова'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    }
  };

  const handleStage3Complete = async (answers: Record<number, any>) => {
    console.log('Saving Stage 3 answers:', { surveyId: cleanSurveyId, answersCount: Object.keys(answers).length });
    try {
      const response = await fetch(getSurveyUrl('submit-stage'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: cleanSurveyId,
          stage: 3,
          answers
        })
      });

      const data = await response.json();
      console.log('Stage 3 response:', { status: response.status, data });

      if (response.ok) {
        // Показываем индикатор обновления
        setRefreshing(true);
        
        // Перезагружаем статус для обновления индикаторов
        await loadSurveyStatus(true);
        
        setRefreshing(false);
        setCurrentStage('dashboard');
        
        // Показываем уведомление об успехе с указанием завершения всех этапов
        setTimeout(() => {
          alert('🎉 Поздравляем! Все анкеты заполнены. Теперь ваши персональные рекомендации максимально точные.');
        }, 300);
      } else {
        console.error('Stage 3 save failed:', data);
        alert(`Ошибка при сохранении анкеты: ${data.error || 'Попробуйте снова'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (currentStage === 'stage2') {
    return (
      <SurveyStepTwo
        stepOneData={{ name: '', email: '', gender: '', birthDate: '', goals: [] }}
        onComplete={handleStage2Complete}
        onBack={() => setCurrentStage('dashboard')}
      />
    );
  }

  if (currentStage === 'stage3') {
    return (
      <SurveyStepThree
        onComplete={handleStage3Complete}
        onBack={() => setCurrentStage('dashboard')}
      />
    );
  }

  if (currentStage === 'recommendations') {
    return (
      <PersonalRecommendations
        userId={cleanUserId}
        surveyId={cleanSurveyId}
        onBack={() => setCurrentStage('dashboard')}
      />
    );
  }

  const totalProgress = 
    (surveyStatus?.stage1_completed ? 33 : 0) +
    (surveyStatus?.stage2_completed ? 33 : 0) +
    (surveyStatus?.stage3_completed ? 34 : 0);

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="rounded-full">
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Личный кабинет</h1>
              <p className="text-muted-foreground mt-1">
                {surveyStatus?.user_name} • {surveyStatus?.user_email}
              </p>
            </div>
          </div>
          
          {/* Индикатор обновления */}
          {refreshing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
              <Icon name="RefreshCw" size={16} className="animate-spin" />
              <span>Обновление данных...</span>
            </div>
          )}
        </div>

        {/* Прогресс заполнения */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={24} className="text-primary" />
              Прогресс заполнения анкет
            </CardTitle>
            <CardDescription>
              Заполните все анкеты для получения точных рекомендаций
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Общий прогресс</span>
                <span className="font-medium">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Карточки этапов */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Этап 1 - Предварительная анкета */}
          <Card className="relative overflow-hidden animate-scale-in">
            <div className={`absolute top-0 left-0 w-full h-1 ${
              surveyStatus?.stage1_completed ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={surveyStatus?.stage1_completed ? 'default' : 'secondary'}>
                  Этап 1
                </Badge>
                {surveyStatus?.stage1_completed && (
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                )}
              </div>
              <CardTitle className="text-xl">Предварительная анкета</CardTitle>
              <CardDescription className="text-sm">
                Базовая информация о вас (5 вопросов)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {surveyStatus?.stage1_completed ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Icon name="Check" size={16} />
                  <span>Завершено</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Уже заполнено
                </div>
              )}
            </CardContent>
          </Card>

          {/* Этап 2 - Расширенная анкета */}
          <Card className="relative overflow-hidden animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className={`absolute top-0 left-0 w-full h-1 ${
              surveyStatus?.stage2_completed ? 'bg-green-500' : 'bg-primary'
            }`} />
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={surveyStatus?.stage2_completed ? 'default' : 'outline'}>
                  Этап 2
                </Badge>
                {surveyStatus?.stage2_completed && (
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                )}
              </div>
              <CardTitle className="text-xl">Расширенная анкета</CardTitle>
              <CardDescription className="text-sm">
                Детальная информация о здоровье и образе жизни
              </CardDescription>
            </CardHeader>
            <CardContent>
              {surveyStatus?.stage2_completed ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <Icon name="Check" size={16} />
                    <span>Завершено</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setCurrentStage('stage2')}
                  >
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => setCurrentStage('stage2')}
                >
                  <Icon name="Play" size={16} className="mr-2" />
                  Начать заполнение
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Этап 3 - Анкета о питании */}
          <Card className="relative overflow-hidden animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className={`absolute top-0 left-0 w-full h-1 ${
              surveyStatus?.stage3_completed ? 'bg-green-500' : 'bg-primary'
            }`} />
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={surveyStatus?.stage3_completed ? 'default' : 'outline'}>
                  Этап 3
                </Badge>
                {surveyStatus?.stage3_completed && (
                  <Icon name="CheckCircle" size={20} className="text-green-500" />
                )}
              </div>
              <CardTitle className="text-xl">Питание и микронутриенты</CardTitle>
              <CardDescription className="text-sm">
                Информация о рационе и пищевых привычках
              </CardDescription>
            </CardHeader>
            <CardContent>
              {surveyStatus?.stage3_completed ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                    <Icon name="Check" size={16} />
                    <span>Завершено</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setCurrentStage('stage3')}
                  >
                    <Icon name="Edit" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => setCurrentStage('stage3')}
                >
                  <Icon name="Play" size={16} className="mr-2" />
                  Начать заполнение
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Персональные рекомендации - доступны на любом этапе */}
        {surveyStatus?.stage1_completed && (
          <Card className={`mt-8 animate-fade-in ${
            surveyStatus?.stage2_completed && surveyStatus?.stage3_completed 
              ? 'border-2 border-primary shadow-lg' 
              : 'border-2 border-yellow-500/50 shadow-md'
          }`}>
            <CardHeader className={`${
              surveyStatus?.stage2_completed && surveyStatus?.stage3_completed
                ? 'bg-gradient-to-r from-primary/10 to-primary/5'
                : 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5'
            }`}>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Icon name="Sparkles" size={28} className={
                  surveyStatus?.stage2_completed && surveyStatus?.stage3_completed 
                    ? 'text-primary' 
                    : 'text-yellow-600'
                } />
                Ваши персональные рекомендации
              </CardTitle>
              <CardDescription className="text-base">
                {surveyStatus?.stage2_completed && surveyStatus?.stage3_completed 
                  ? 'Комплексный анализ на основе всех заполненных анкет'
                  : 'Предварительные рекомендации на основе заполненных этапов'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Индикаторы заполненности */}
                <div className="grid gap-3 md:grid-cols-3 mb-4">
                  <div className={`p-3 rounded-lg text-center ${
                    surveyStatus?.stage1_completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}>
                    <Icon 
                      name={surveyStatus?.stage1_completed ? 'CheckCircle2' : 'Circle'} 
                      size={24} 
                      className={`mx-auto mb-2 ${surveyStatus?.stage1_completed ? 'text-green-600' : 'text-gray-400'}`} 
                    />
                    <p className="text-sm font-medium">Ваши цели</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {surveyStatus?.stage1_completed ? 'Заполнено' : 'Не заполнено'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${
                    surveyStatus?.stage2_completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}>
                    <Icon 
                      name={surveyStatus?.stage2_completed ? 'CheckCircle2' : 'Circle'} 
                      size={24} 
                      className={`mx-auto mb-2 ${surveyStatus?.stage2_completed ? 'text-green-600' : 'text-gray-400'}`} 
                    />
                    <p className="text-sm font-medium">Образ жизни</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {surveyStatus?.stage2_completed ? 'Заполнено' : 'Не заполнено'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg text-center ${
                    surveyStatus?.stage3_completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                  }`}>
                    <Icon 
                      name={surveyStatus?.stage3_completed ? 'CheckCircle2' : 'Circle'} 
                      size={24} 
                      className={`mx-auto mb-2 ${surveyStatus?.stage3_completed ? 'text-green-600' : 'text-gray-400'}`} 
                    />
                    <p className="text-sm font-medium">Питание</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {surveyStatus?.stage3_completed ? 'Заполнено' : 'Не заполнено'}
                    </p>
                  </div>
                </div>

                {/* Уведомление о точности */}
                {(!surveyStatus?.stage2_completed || !surveyStatus?.stage3_completed) && (
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-4">
                    <div className="flex gap-3">
                      <Icon name="AlertCircle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-900 mb-1">
                          Повысьте точность рекомендаций
                        </p>
                        <p className="text-sm text-yellow-800">
                          Чем больше информации мы знаем о вас, тем точнее будут подобраны витамины. 
                          Заполните {!surveyStatus?.stage2_completed && 'Этап 2'}
                          {!surveyStatus?.stage2_completed && !surveyStatus?.stage3_completed && ' и '}
                          {!surveyStatus?.stage3_completed && 'Этап 3'} для максимально персонализированных рекомендаций.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setCurrentStage('recommendations')}
                  variant={surveyStatus?.stage2_completed && surveyStatus?.stage3_completed ? 'default' : 'outline'}
                >
                  <Icon name="Eye" size={20} className="mr-2" />
                  {surveyStatus?.stage2_completed && surveyStatus?.stage3_completed 
                    ? 'Посмотреть полные рекомендации' 
                    : 'Посмотреть предварительные рекомендации'
                  }
                </Button>

                {surveyStatus?.stage2_completed && surveyStatus?.stage3_completed && (
                  <p className="text-xs text-center text-green-600 flex items-center justify-center gap-1">
                    <Icon name="CheckCircle2" size={14} />
                    Все анкеты заполнены - рекомендации максимально точные
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}