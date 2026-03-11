import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SurveyStepOneProps {
  onComplete: (data: StepOneData) => void;
  initialData?: StepOneData;
}

export interface StepOneData {
  name: string;
  gender: string;
  birthDate: string;
  email: string;
  goals: string[];
}

const AVAILABLE_GOALS = [
  'Поддержка иммунитета',
  'Качество сна',
  'Здоровье волос',
  'Здоровье кожи',
  'Здоровье ногтей',
  'Повышение либидо',
  'Улучшение качества сексуальной жизни',
  'Подготовка к зачатию ребенка',
  'Улучшение спортивных результатов',
  'Похудение',
  'Работа со стрессом',
  'Память и фокус',
  'Уровень энергии'
];

export default function SurveyStepOne({ onComplete, initialData }: SurveyStepOneProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<StepOneData>(initialData || {
    name: '',
    gender: '',
    birthDate: '',
    email: '',
    goals: []
  });
  const [showHint, setShowHint] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateCurrentQuestion = () => {
    const newErrors: Record<string, string> = {};

    switch (currentQuestion) {
      case 0:
        if (!formData.name.trim()) {
          newErrors.name = 'Пожалуйста, укажите ваше имя';
        }
        break;
      case 1:
        if (!formData.gender) {
          newErrors.gender = 'Пожалуйста, выберите пол';
        }
        break;
      case 2:
        if (!formData.birthDate) {
          newErrors.birthDate = 'Пожалуйста, укажите дату рождения';
        }
        break;
      case 3:
        if (!formData.email.trim()) {
          newErrors.email = 'Пожалуйста, укажите email';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Пожалуйста, укажите корректный email';
        }
        break;
      case 4:
        if (formData.goals.length !== 3) {
          newErrors.goals = 'Пожалуйста, выберите ровно 3 цели';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    if (currentQuestion < 4) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowHint(false);
      setErrors({});
    }
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => {
      const goals = prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : prev.goals.length < 3
          ? [...prev.goals, goal]
          : prev.goals;
      return { ...prev, goals };
    });
  };

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 0:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="name" className="text-lg font-medium">
                Как вас зовут?
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Введите ваше имя"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 text-lg h-12"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <Label className="text-lg font-medium">Ваш пол?</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.gender === 'male' ? 'default' : 'outline'}
                className="h-20 text-lg"
                onClick={() => setFormData({ ...formData, gender: 'male' })}
              >
                <Icon name="User" className="mr-2" size={24} />
                Мужской
              </Button>
              <Button
                type="button"
                variant={formData.gender === 'female' ? 'default' : 'outline'}
                className="h-20 text-lg"
                onClick={() => setFormData({ ...formData, gender: 'female' })}
              >
                <Icon name="User" className="mr-2" size={24} />
                Женский
              </Button>
            </div>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="birthDate" className="text-lg font-medium">
                  Укажите дату рождения
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="h-6 w-6 p-0 rounded-full"
                >
                  <Icon name="Info" size={16} />
                </Button>
              </div>
              {showHint && (
                <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-md">
                  Так мы сможем подобрать разные дозировки витаминов, в зависимости от возраста.
                </p>
              )}
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="mt-2 text-lg h-12"
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="email" className="text-lg font-medium">
                  Пожалуйста, укажите свой email
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="h-6 w-6 p-0 rounded-full"
                >
                  <Icon name="Info" size={16} />
                </Button>
              </div>
              {showHint && (
                <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-md">
                  Сервис запомнит вашу анкету, вы всегда сможете получить к ней доступ указав свой email
                </p>
              )}
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 text-lg h-12"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-2">
                <Label className="text-lg font-medium">
                  Переходим к самому важному, выберите 3 самые важные цели
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="h-6 w-6 p-0 rounded-full"
                >
                  <Icon name="Info" size={16} />
                </Button>
              </div>
              {showHint && (
                <p className="text-sm text-muted-foreground mt-2 p-3 bg-muted rounded-md">
                  Они станут основными для вашего курса витаминов
                </p>
              )}
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant={formData.goals.length === 3 ? 'default' : 'secondary'}>
                  {formData.goals.length} / 3
                </Badge>
                <span>выбрано</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {AVAILABLE_GOALS.map((goal) => (
                  <Card
                    key={goal}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.goals.includes(goal)
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                    onClick={() => toggleGoal(goal)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.goals.includes(goal)
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {formData.goals.includes(goal) && (
                          <Icon name="Check" size={14} className="text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{goal}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {errors.goals && <p className="text-red-500 text-sm mt-2">{errors.goals}</p>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto max-w-3xl">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Этап 1: Знакомство</h2>
                <Badge variant="outline">{currentQuestion + 1} / 5</Badge>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / 5) * 100}%` }}
                />
              </div>
            </div>

            {renderQuestion()}

            <div className="flex gap-4 mt-8">
              {currentQuestion > 0 && (
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  <Icon name="ChevronLeft" className="mr-2" size={20} />
                  Назад
                </Button>
              )}
              <Button type="button" onClick={handleNext} className="flex-1">
                {currentQuestion === 4 ? 'Продолжить →' : 'Далее'}
                {currentQuestion < 4 && <Icon name="ChevronRight" className="ml-2" size={20} />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}