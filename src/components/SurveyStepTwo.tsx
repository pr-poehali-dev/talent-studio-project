import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { StepOneData } from './SurveyStepOne';
import { getSurveyUrl } from '@/config/api';

interface Question {
  id: number;
  category: string;
  question_text: string;
  question_type: string;
  options?: {
    options?: string[];
    min?: number;
    max?: number;
    unit?: string;
    placeholder?: string;
  };
  placeholder?: string;
  required: boolean;
}

interface SurveyStepTwoProps {
  stepOneData: StepOneData;
  onComplete: (answers: Record<number, any>) => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  personal: 'Личные параметры',
  nutrition: 'Питание',
  lifestyle: 'Образ жизни',
  complaints: 'Жалобы и состояние здоровья'
};

export default function SurveyStepTwo({ stepOneData, onComplete, onBack }: SurveyStepTwoProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [errors, setErrors] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(getSurveyUrl('questions'));
      if (response.ok) {
        const data = await response.json();
        // Фильтруем вопросы: исключаем категорию 'nutrition' (она в Этапе 3)
        const filteredQuestions = (data.questions || []).filter(
          (q: Question) => q.category !== 'nutrition'
        );
        setQuestions(filteredQuestions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentCategory = currentQuestion?.category || '';
  const categoryQuestions = questions.filter(q => q.category === currentCategory);
  const questionIndexInCategory = categoryQuestions.findIndex(q => q.id === currentQuestion?.id);
  const totalCategories = [...new Set(questions.map(q => q.category))].length;
  const currentCategoryIndex = [...new Set(questions.map(q => q.category))].indexOf(currentCategory);

  const validateAnswer = () => {
    if (!currentQuestion.required) return true;

    const answer = answers[currentQuestion.id];
    
    if (currentQuestion.question_type === 'multiple_choice') {
      return answer && Array.isArray(answer) && answer.length > 0;
    }
    
    return answer !== undefined && answer !== null && answer !== '';
  };

  const handleNext = () => {
    if (!validateAnswer()) {
      setErrors('Пожалуйста, ответьте на вопрос');
      return;
    }

    setErrors('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setErrors('');
    } else {
      onBack();
    }
  };

  const handleAnswer = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setErrors('');
  };

  const handleMultipleChoice = (questionId: number, option: string) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      const newValue = current.includes(option)
        ? current.filter((item: string) => item !== option)
        : [...current, option];
      return { ...prev, [questionId]: newValue };
    });
    setErrors('');
  };

  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    const questionId = currentQuestion.id;
    const currentAnswer = answers[questionId];

    switch (currentQuestion.question_type) {
      case 'number':
        return (
          <div>
            <Input
              type="number"
              placeholder={currentQuestion.options?.placeholder || 'Введите значение'}
              value={currentAnswer || ''}
              onChange={(e) => handleAnswer(questionId, e.target.value)}
              min={currentQuestion.options?.min}
              max={currentQuestion.options?.max}
              className="text-lg h-12"
            />
            {currentQuestion.options?.unit && (
              <p className="text-sm text-muted-foreground mt-1">
                Единицы: {currentQuestion.options.unit}
              </p>
            )}
          </div>
        );

      case 'text':
        return (
          <Input
            type="text"
            placeholder={currentQuestion.placeholder || currentQuestion.options?.placeholder || 'Ваш ответ'}
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(questionId, e.target.value)}
            className="text-lg h-12"
          />
        );

      case 'single_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.options?.map((option) => (
              <Card
                key={option}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentAnswer === option ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handleAnswer(questionId, option)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      currentAnswer === option
                        ? 'bg-primary border-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {currentAnswer === option && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{option}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.options?.map((option) => (
              <Card
                key={option}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentAnswer?.includes(option) ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => handleMultipleChoice(questionId, option)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox
                    checked={currentAnswer?.includes(option) || false}
                    onCheckedChange={() => handleMultipleChoice(questionId, option)}
                  />
                  <span className="text-sm font-medium">{option}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-lg text-muted-foreground">Загрузка вопросов...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Icon name="AlertCircle" className="mx-auto mb-4 text-yellow-500" size={48} />
            <h3 className="text-xl font-bold mb-2">Вопросы не найдены</h3>
            <p className="text-muted-foreground mb-4">
              Пожалуйста, попробуйте позже или обратитесь к администратору.
            </p>
            <Button onClick={onBack}>Вернуться</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-3xl">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold">Этап 2: Подробная анкета</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Среднее время заполнения: ~10 минут
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {currentQuestionIndex + 1} / {questions.length}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[currentCategory]}
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mb-6">
              <Badge variant="secondary" className="mb-3">
                {CATEGORY_LABELS[currentCategory]} ({questionIndexInCategory + 1} / {categoryQuestions.length})
              </Badge>
            </div>

            <div className="space-y-6 animate-fade-in">
              <div>
                <Label className="text-lg font-medium mb-4 block">
                  {currentQuestion.question_text}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderQuestionInput()}
                {errors && <p className="text-red-500 text-sm mt-2">{errors}</p>}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                <Icon name="ChevronLeft" className="mr-2" size={20} />
                Назад
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1">
                {currentQuestionIndex === questions.length - 1 ? 'Завершить' : 'Далее'}
                {currentQuestionIndex < questions.length - 1 && (
                  <Icon name="ChevronRight" className="ml-2" size={20} />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}