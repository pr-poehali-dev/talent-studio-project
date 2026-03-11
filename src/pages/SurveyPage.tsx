import { useState } from 'react';
import SurveyStepOne, { StepOneData } from '@/components/SurveyStepOne';
import SurveyRestore from '@/components/SurveyRestore';
import { getSurveyUrl } from '@/config/api';

interface SurveyPageProps {
  onComplete: (userId: number, surveyId: number) => void;
}

export default function SurveyPage({ onComplete }: SurveyPageProps) {
  const [view, setView] = useState<'choice' | 'new' | 'restore'>('choice');
  const [stepOneData, setStepOneData] = useState<StepOneData | null>(null);

  const handleRestore = (data: any) => {
    const user = data.user;
    const survey = data.survey;

    // Если предварительная анкета уже заполнена, переходим в личный кабинет
    if (survey.stage >= 1 || survey.completed) {
      onComplete(user.id, survey.id);
    } else {
      // Если даже предварительная анкета не заполнена, показываем её
      const restoredStepOneData: StepOneData = {
        name: user.name,
        email: user.email,
        gender: user.gender,
        birthDate: user.birth_date,
        goals: survey.goals || []
      };

      setStepOneData(restoredStepOneData);
      setView('new');
    }
  };

  const handleStartNew = () => {
    setView('new');
  };

  const handleStepOneComplete = async (data: StepOneData) => {
    try {
      const response = await fetch(getSurveyUrl('register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📨 Backend response:', result);
        
        // Очищаем ID от возможных артефактов
        const userId = typeof result.user_id === 'number' 
          ? result.user_id 
          : parseInt(String(result.user_id).split(':')[0], 10);
        const surveyId = typeof result.survey_id === 'number' 
          ? result.survey_id 
          : parseInt(String(result.survey_id).split(':')[0], 10);
        
        console.log('🧹 Cleaned IDs:', { userId, surveyId });
        
        // Сразу переходим в личный кабинет после предварительной анкеты
        onComplete(userId, surveyId);
      } else {
        alert('Ошибка при регистрации. Попробуйте снова.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Ошибка подключения. Проверьте интернет и попробуйте снова.');
    }
  };



  if (view === 'choice') {
    return (
      <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">Анкета подбора витаминов</h1>
            <p className="text-muted-foreground text-lg">
              Выберите, как вы хотите продолжить
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={handleStartNew}
              className="group p-8 bg-card rounded-xl border-2 border-border hover:border-primary transition-all hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Начать новую анкету</h3>
                  <p className="text-muted-foreground">
                    Заполнить анкету с нуля и получить персональные рекомендации
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setView('restore')}
              className="group p-8 bg-card rounded-xl border-2 border-border hover:border-primary transition-all hover:shadow-lg"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Продолжить анкету</h3>
                  <p className="text-muted-foreground">
                    Восстановить незавершенную анкету по email
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'restore') {
    return (
      <SurveyRestore
        onRestore={handleRestore}
        onCancel={() => setView('choice')}
      />
    );
  }

  return (
    <SurveyStepOne 
      onComplete={handleStepOneComplete}
      initialData={stepOneData || undefined}
    />
  );
}