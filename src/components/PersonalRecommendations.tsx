import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { getSurveyUrl } from '@/config/api';
import { analyzeUserProfile } from '@/services/vitaminAnalysis';
import type { HealthAnalysis } from '@/services/vitaminAnalysis';
import RecommendationsHeader from '@/components/RecommendationsHeader';
import RecommendationsSummaryCards from '@/components/RecommendationsSummaryCards';
import RecommendationsAnalysisAccordion from '@/components/RecommendationsAnalysisAccordion';
import RecommendationsCourseCard from '@/components/RecommendationsCourseCard';
import { consolidateDeficiencies } from '@/services/vitaminAnalysis';

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

  const hasStage2Data = analysis.healthConcerns.length > 0 || analysis.lifestyle.length > 2;
  const hasStage3Data = analysis.dietaryHabits.length > 0 || analysis.nutrientDeficiencies.length > 0;
  const allStagesCompleted = hasStage2Data && hasStage3Data;

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-5xl">
        <RecommendationsHeader
          userName={userName}
          allStagesCompleted={allStagesCompleted}
          hasStage2Data={hasStage2Data}
          hasStage3Data={hasStage3Data}
          onBack={onBack}
        />

        <RecommendationsSummaryCards
          criticalCount={criticalDeficiencies.length}
          moderateCount={moderateDeficiencies.length}
          prioritiesCount={analysis.priorities.length}
        />

        <RecommendationsAnalysisAccordion analysis={analysis} />

        <RecommendationsCourseCard
          selectedDuration={selectedDuration}
          onSelectDuration={setSelectedDuration}
          checkoutOpen={checkoutOpen}
          onOpenCheckout={() => setCheckoutOpen(true)}
          onCloseCheckout={() => setCheckoutOpen(false)}
          userId={cleanUserId}
          surveyId={cleanSurveyId}
        />
      </div>
    </div>
  );
}
