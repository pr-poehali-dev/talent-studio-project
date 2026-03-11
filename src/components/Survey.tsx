import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { SurveyData } from '@/pages/Index';

interface SurveyProps {
  onComplete: (data: SurveyData) => void;
  onBack: () => void;
}

const Survey = ({ onComplete, onBack }: SurveyProps) => {
  const [step, setStep] = useState(1);
  const totalSteps = 9;
  
  const [formData, setFormData] = useState<SurveyData>({
    goals: [],
    diet: '',
    allergies: [],
    foodCategories: [],
    activity: '',
    gender: '',
    healthIssues: [],
    habits: [],
    workType: ''
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const toggleArrayItem = (field: keyof SurveyData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [field]: newArray });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Каковы ваши основные цели?</h2>
            {['Улучшить энергию и бодрость', 'Укрепить иммунитет', 'Поддержать здоровье кожи и волос', 'Снизить стресс', 'Улучшить сон', 'Поддержать здоровье сердца'].map((goal) => (
              <div key={goal} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <Checkbox
                  id={goal}
                  checked={formData.goals.includes(goal)}
                  onCheckedChange={() => toggleArrayItem('goals', goal)}
                />
                <Label htmlFor={goal} className="cursor-pointer flex-1 text-base">{goal}</Label>
              </div>
            ))}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Ваш пол?</h2>
            <RadioGroup value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              {['Мужской', 'Женский', 'Предпочитаю не указывать'].map((gender) => (
                <div key={gender} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={gender} id={gender} />
                  <Label htmlFor={gender} className="cursor-pointer flex-1 text-base">{gender}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Следуете ли вы какой-то диете?</h2>
            <RadioGroup value={formData.diet} onValueChange={(value) => setFormData({ ...formData, diet: value })}>
              {['Нет, обычное питание', 'Вегетарианство', 'Веганство', 'Кето-диета', 'Безглютеновая', 'Средиземноморская'].map((diet) => (
                <div key={diet} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={diet} id={diet} />
                  <Label htmlFor={diet} className="cursor-pointer flex-1 text-base">{diet}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Есть ли у вас аллергии?</h2>
            {['Нет аллергий', 'Молочные продукты', 'Глютен', 'Орехи', 'Рыба и морепродукты', 'Соя'].map((allergy) => (
              <div key={allergy} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <Checkbox
                  id={allergy}
                  checked={formData.allergies.includes(allergy)}
                  onCheckedChange={() => toggleArrayItem('allergies', allergy)}
                />
                <Label htmlFor={allergy} className="cursor-pointer flex-1 text-base">{allergy}</Label>
              </div>
            ))}
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Какие категории продуктов в вашем рационе?</h2>
            {['Мясо и птица', 'Рыба', 'Овощи и зелень', 'Фрукты', 'Молочные продукты', 'Крупы и злаки', 'Бобовые', 'Орехи и семена'].map((category) => (
              <div key={category} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <Checkbox
                  id={category}
                  checked={formData.foodCategories.includes(category)}
                  onCheckedChange={() => toggleArrayItem('foodCategories', category)}
                />
                <Label htmlFor={category} className="cursor-pointer flex-1 text-base">{category}</Label>
              </div>
            ))}
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Ваш уровень физической активности?</h2>
            <RadioGroup value={formData.activity} onValueChange={(value) => setFormData({ ...formData, activity: value })}>
              {[
                { value: 'Минимальная', desc: 'Сидячий образ жизни, нет тренировок' },
                { value: 'Легкая', desc: '1-2 тренировки в неделю' },
                { value: 'Умеренная', desc: '3-4 тренировки в неделю' },
                { value: 'Высокая', desc: '5+ тренировок в неделю' },
                { value: 'Профессиональная', desc: 'Ежедневные интенсивные нагрузки' }
              ].map((activity) => (
                <div key={activity.value} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={activity.value} id={activity.value} />
                  <Label htmlFor={activity.value} className="cursor-pointer flex-1">
                    <div className="text-base font-medium">{activity.value}</div>
                    <div className="text-sm text-muted-foreground">{activity.desc}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      
      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Есть ли особенности здоровья?</h2>
            {['Нет особенностей', 'Проблемы с ЖКТ', 'Гормональный дисбаланс', 'Частые простуды', 'Хроническая усталость', 'Проблемы со сном', 'Стресс и тревожность'].map((issue) => (
              <div key={issue} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <Checkbox
                  id={issue}
                  checked={formData.healthIssues.includes(issue)}
                  onCheckedChange={() => toggleArrayItem('healthIssues', issue)}
                />
                <Label htmlFor={issue} className="cursor-pointer flex-1 text-base">{issue}</Label>
              </div>
            ))}
          </div>
        );
      
      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Есть ли вредные привычки?</h2>
            {['Нет вредных привычек', 'Курение', 'Алкоголь регулярно', 'Много кофе', 'Недостаток сна'].map((habit) => (
              <div key={habit} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                <Checkbox
                  id={habit}
                  checked={formData.habits.includes(habit)}
                  onCheckedChange={() => toggleArrayItem('habits', habit)}
                />
                <Label htmlFor={habit} className="cursor-pointer flex-1 text-base">{habit}</Label>
              </div>
            ))}
          </div>
        );
      
      case 9:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Тип вашей работы?</h2>
            <RadioGroup value={formData.workType} onValueChange={(value) => setFormData({ ...formData, workType: value })}>
              {['Офисная работа', 'Физический труд', 'Работа на ногах', 'Удаленная работа', 'Ночные смены', 'Ненормированный график'].map((work) => (
                <div key={work} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={work} id={work} />
                  <Label htmlFor={work} className="cursor-pointer flex-1 text-base">{work}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="p-8 md:p-12 shadow-2xl animate-fade-in">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Шаг {step} из {totalSteps}
              </h3>
              <span className="text-sm font-medium text-primary">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>
          
          <div className="min-h-[400px]">
            {renderStep()}
          </div>
          
          <div className="flex gap-4 mt-8 pt-8 border-t">
            <Button variant="outline" onClick={handleBack} className="flex-1 rounded-full">
              <Icon name="ArrowLeft" className="mr-2" size={18} />
              Назад
            </Button>
            <Button onClick={handleNext} className="flex-1 rounded-full">
              {step === totalSteps ? 'Получить результаты' : 'Далее'}
              <Icon name={step === totalSteps ? 'Check' : 'ArrowRight'} className="ml-2" size={18} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Survey;
