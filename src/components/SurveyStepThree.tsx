import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Icon from '@/components/ui/icon';
import { getSurveyUrl } from '@/config/api';

interface SurveyStepThreeProps {
  onComplete: (answers: Record<number, any>) => void;
  onBack: () => void;
}

interface Question {
  id: number;
  question_text: string;
  question_type: string;
  options?: { choices: string[] };
  required: boolean;
}

const NUTRITION_QUESTIONS: Question[] = [
  {
    id: 1001,
    question_text: 'Как часто вы употребляете следующие продукты?',
    question_type: 'info',
    required: false
  },
  {
    id: 1002,
    question_text: 'Красное мясо (говядина, свинина, баранина)',
    question_type: 'single_choice',
    options: { choices: ['Ежедневно', '3-5 раз в неделю', '1-2 раза в неделю', 'Редко/никогда'] },
    required: true
  },
  {
    id: 1003,
    question_text: 'Птица (курица, индейка)',
    question_type: 'single_choice',
    options: { choices: ['Ежедневно', '3-5 раз в неделю', '1-2 раза в неделю', 'Редко/никогда'] },
    required: true
  },
  {
    id: 1004,
    question_text: 'Рыба и морепродукты',
    question_type: 'single_choice',
    options: { choices: ['3+ раз в неделю', '1-2 раза в неделю', 'Раз в месяц', 'Редко/никогда'] },
    required: true
  },
  {
    id: 1005,
    question_text: 'Молочные продукты (молоко, сыр, йогурт)',
    question_type: 'single_choice',
    options: { choices: ['Ежедневно', 'Несколько раз в неделю', 'Редко', 'Никогда'] },
    required: true
  },
  {
    id: 1006,
    question_text: 'Яйца',
    question_type: 'single_choice',
    options: { choices: ['Ежедневно', '3-5 раз в неделю', '1-2 раза в неделю', 'Редко/никогда'] },
    required: true
  },
  {
    id: 1007,
    question_text: 'Свежие фрукты',
    question_type: 'single_choice',
    options: { choices: ['Ежедневно', 'Несколько раз в неделю', 'Редко', 'Никогда'] },
    required: true
  },
  {
    id: 1008,
    question_text: 'Свежие овощи и зелень',
    question_type: 'single_choice',
    options: { choices: ['Ежедневно', 'Несколько раз в неделю', 'Редко', 'Никогда'] },
    required: true
  },
  {
    id: 1009,
    question_text: 'Орехи и семена',
    question_type: 'single_choice',
    options: { choices: ['Ежедневно', 'Несколько раз в неделю', 'Редко', 'Никогда'] },
    required: true
  },
  {
    id: 1010,
    question_text: 'Бобовые (фасоль, чечевица, нут)',
    question_type: 'single_choice',
    options: { choices: ['Регулярно', 'Иногда', 'Редко', 'Никогда'] },
    required: true
  },
  {
    id: 1011,
    question_text: 'Цельнозерновые продукты (овсянка, гречка, коричневый рис)',
    question_type: 'single_choice',
    options: { choices: ['Ежедневно', 'Несколько раз в неделю', 'Редко', 'Никогда'] },
    required: true
  },
  {
    id: 1012,
    question_text: 'Соблюдаете ли вы какую-либо диету?',
    question_type: 'single_choice',
    options: { 
      choices: [
        'Нет, питаюсь обычно',
        'Вегетарианство',
        'Веганство',
        'Кето-диета',
        'Безглютеновая',
        'Низкоуглеводная',
        'Другое'
      ] 
    },
    required: true
  },
  {
    id: 1013,
    question_text: 'Есть ли у вас непереносимость каких-либо продуктов?',
    question_type: 'multiple_choice',
    options: { 
      choices: [
        'Нет',
        'Лактоза (молочные продукты)',
        'Глютен',
        'Орехи',
        'Морепродукты',
        'Яйца',
        'Соя',
        'Другое'
      ] 
    },
    required: true
  },
  {
    id: 1014,
    question_text: 'Сколько воды вы пьёте в день?',
    question_type: 'single_choice',
    options: { choices: ['Менее 1 литра', '1-1.5 литра', '1.5-2 литра', 'Более 2 литров'] },
    required: true
  },
  {
    id: 1015,
    question_text: 'Как часто вы употребляете следующие напитки?',
    question_type: 'info',
    required: false
  },
  {
    id: 1016,
    question_text: 'Кофе',
    question_type: 'single_choice',
    options: { choices: ['Не пью', '1 чашка в день', '2-3 чашки', '4+ чашек'] },
    required: true
  },
  {
    id: 1017,
    question_text: 'Чай (чёрный, зелёный)',
    question_type: 'single_choice',
    options: { choices: ['Не пью', '1-2 чашки в день', '3-4 чашки', '5+ чашек'] },
    required: true
  },
  {
    id: 1018,
    question_text: 'Сладкие газированные напитки',
    question_type: 'single_choice',
    options: { choices: ['Никогда', 'Редко', 'Несколько раз в неделю', 'Ежедневно'] },
    required: true
  },
  {
    id: 1019,
    question_text: 'Принимаете ли вы сейчас витамины или добавки?',
    question_type: 'single_choice',
    options: { choices: ['Нет', 'Да, регулярно', 'Да, периодически', 'Принимал(а) ранее'] },
    required: true
  },
  {
    id: 1020,
    question_text: 'Как вы оцениваете разнообразие своего рациона?',
    question_type: 'single_choice',
    options: { 
      choices: [
        'Очень разнообразно - ем много разных продуктов',
        'Умеренно - есть любимые продукты, которые ем часто',
        'Однообразно - обычно ем одно и то же',
        'Затрудняюсь ответить'
      ] 
    },
    required: true
  }
];

export default function SurveyStepThree({ onComplete, onBack }: SurveyStepThreeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [questions] = useState<Question[]>(NUTRITION_QUESTIONS);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswer = (questionId: number, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion.question_type === 'info') {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
      return;
    }

    const currentAnswer = answers[currentQuestion.id];
    if (currentQuestion.required && !currentAnswer) {
      alert('Пожалуйста, ответьте на вопрос');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };

  const renderQuestion = () => {
    if (currentQuestion.question_type === 'info') {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Info" size={32} className="text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{currentQuestion.question_text}</h3>
          <p className="text-muted-foreground">
            Следующие вопросы помогут нам лучше понять ваш рацион
          </p>
        </div>
      );
    }

    if (currentQuestion.question_type === 'single_choice') {
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold mb-6">{currentQuestion.question_text}</h3>
          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {currentQuestion.options?.choices.map((choice) => (
                <Card 
                  key={choice}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    answers[currentQuestion.id] === choice 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                  onClick={() => handleAnswer(currentQuestion.id, choice)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <RadioGroupItem value={choice} id={choice} />
                    <Label 
                      htmlFor={choice} 
                      className="flex-1 cursor-pointer text-base"
                    >
                      {choice}
                    </Label>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>
        </div>
      );
    }

    if (currentQuestion.question_type === 'multiple_choice') {
      const selectedAnswers = answers[currentQuestion.id] || [];
      
      return (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold mb-2">{currentQuestion.question_text}</h3>
          <p className="text-sm text-muted-foreground mb-6">Можно выбрать несколько вариантов</p>
          <div className="space-y-3">
            {currentQuestion.options?.choices.map((choice) => {
              const isSelected = selectedAnswers.includes(choice);
              
              return (
                <Card 
                  key={choice}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => {
                    const newAnswers = isSelected
                      ? selectedAnswers.filter((a: string) => a !== choice)
                      : [...selectedAnswers, choice];
                    handleAnswer(currentQuestion.id, newAnswers);
                  }}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newAnswers = checked
                          ? [...selectedAnswers, choice]
                          : selectedAnswers.filter((a: string) => a !== choice);
                        handleAnswer(currentQuestion.id, newAnswers);
                      }}
                    />
                    <Label className="flex-1 cursor-pointer text-base">
                      {choice}
                    </Label>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-3xl">
        {/* Заголовок и прогресс */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              Этап 3: Питание и микронутриенты
            </Badge>
            <span className="text-sm text-muted-foreground">
              Вопрос {currentQuestionIndex + 1} из {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Вопрос */}
        <Card className="mb-8 animate-scale-in">
          <CardContent className="pt-8 pb-8">
            {renderQuestion()}
          </CardContent>
        </Card>

        {/* Навигация */}
        <div className="flex gap-4 justify-between animate-fade-in">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrev}
            className="min-w-32"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
          
          <Button
            size="lg"
            onClick={handleNext}
            className="min-w-32"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Завершить' : 'Далее'}
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
        </div>

        {/* Подсказка */}
        <div className="mt-6 text-center text-sm text-muted-foreground animate-fade-in">
          <p>💡 Все данные конфиденциальны и используются только для персональных рекомендаций</p>
        </div>
      </div>
    </div>
  );
}
