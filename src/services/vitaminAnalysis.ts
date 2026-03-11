// Анализ дефицитов витаминов на основе ответов пользователя

interface UserProfile {
  name: string;
  birthDate: string;
  goals: string[];
  stage2Answers?: Record<number, any>;
  stage3Answers?: Record<number, any>;
}

interface VitaminDeficiency {
  vitamin: string;
  deficiencyLevel: 'high' | 'medium' | 'low';
  reasons: string[];
  symptoms: string[];
}

interface NutrientDeficiency {
  nutrient: string;
  deficiencyLevel: 'high' | 'medium' | 'low';
  foodSources: string[];
  reasons: string[];
}

export interface HealthAnalysis {
  priorities: string[];
  lifestyle: string[];
  healthConcerns: string[];
  dietaryHabits: string[];
  geographicFactors: string[];
  vitaminDeficiencies: VitaminDeficiency[];
  nutrientDeficiencies: NutrientDeficiency[];
}

// Маппинг целей к витаминам
const GOAL_TO_VITAMINS: Record<string, string[]> = {
  'Поддержка иммунитета': ['Витамин C', 'Витамин D3', 'Цинк', 'Селен'],
  'Качество сна': ['Магний', 'Витамин B6', 'Мелатонин'],
  'Здоровье волос': ['Биотин', 'Цинк', 'Витамин E', 'Железо'],
  'Здоровье кожи': ['Витамин C', 'Витамин E', 'Коллаген', 'Омега-3'],
  'Здоровье ногтей': ['Биотин', 'Цинк', 'Кальций'],
  'Повышение либидо': ['Цинк', 'Магний', 'Витамин D3'],
  'Улучшение качества сексуальной жизни': ['Цинк', 'Магний', 'Витамин B-комплекс'],
  'Подготовка к зачатию ребенка': ['Фолиевая кислота', 'Омега-3', 'Витамин D3', 'Железо'],
  'Улучшение спортивных результатов': ['Магний', 'Витамин B-комплекс', 'Креатин', 'Омега-3'],
  'Похудение': ['Витамин B-комплекс', 'Хром', 'L-карнитин'],
  'Работа со стрессом': ['Магний', 'Витамин B-комплекс', 'Ашваганда'],
  'Память и фокус': ['Омега-3', 'Витамин B-комплекс', 'Магний'],
  'Уровень энергии': ['Витамин B-комплекс', 'Железо', 'Коэнзим Q10']
};

// Анализ симптомов из расширенной анкеты
export function analyzeStage2Deficiencies(answers: Record<number, any>): VitaminDeficiency[] {
  const deficiencies: VitaminDeficiency[] = [];

  // Анализ усталости (вопрос 19)
  if (answers[19] && ['Да, постоянно', 'Часто'].includes(answers[19])) {
    deficiencies.push({
      vitamin: 'Витамин B-комплекс',
      deficiencyLevel: 'high',
      reasons: ['Постоянная усталость'],
      symptoms: ['Низкий уровень энергии', 'Хроническая усталость']
    });
    deficiencies.push({
      vitamin: 'Железо',
      deficiencyLevel: 'medium',
      reasons: ['Постоянная усталость может быть связана с дефицитом железа'],
      symptoms: ['Слабость', 'Утомляемость']
    });
  }

  // Проблемы с концентрацией (вопрос 20)
  if (answers[20] && ['Да, серьёзные', 'Да, небольшие'].includes(answers[20])) {
    deficiencies.push({
      vitamin: 'Омега-3',
      deficiencyLevel: answers[20] === 'Да, серьёзные' ? 'high' : 'medium',
      reasons: ['Проблемы с концентрацией внимания'],
      symptoms: ['Снижение когнитивных функций', 'Рассеянность']
    });
    deficiencies.push({
      vitamin: 'Магний',
      deficiencyLevel: 'medium',
      reasons: ['Нарушение концентрации может указывать на дефицит магния'],
      symptoms: ['Снижение внимания', 'Умственная усталость']
    });
  }

  // Частые болезни (вопрос 21)
  if (answers[21] && ['Очень часто (более 5 раз)', 'Часто (3-5 раз)'].includes(answers[21])) {
    deficiencies.push({
      vitamin: 'Витамин C',
      deficiencyLevel: 'high',
      reasons: ['Частые простудные заболевания'],
      symptoms: ['Ослабленный иммунитет']
    });
    deficiencies.push({
      vitamin: 'Витамин D3',
      deficiencyLevel: 'high',
      reasons: ['Частые болезни указывают на низкий иммунитет'],
      symptoms: ['Снижение защитных функций организма']
    });
    deficiencies.push({
      vitamin: 'Цинк',
      deficiencyLevel: 'medium',
      reasons: ['Частые инфекции'],
      symptoms: ['Слабый иммунитет']
    });
  }

  // Проблемы с кожей (вопрос 22)
  if (answers[22] && answers[22] !== 'Нет') {
    deficiencies.push({
      vitamin: 'Витамин A',
      deficiencyLevel: 'medium',
      reasons: ['Проблемы с кожей'],
      symptoms: ['Сухость кожи', 'Воспаления']
    });
    deficiencies.push({
      vitamin: 'Витамин E',
      deficiencyLevel: 'medium',
      reasons: ['Состояние кожи требует антиоксидантной поддержки'],
      symptoms: ['Ухудшение состояния кожи']
    });
  }

  // Проблемы со сном (вопрос 23)
  if (answers[23] && ['Да, серьёзные', 'Да, иногда'].includes(answers[23])) {
    deficiencies.push({
      vitamin: 'Магний',
      deficiencyLevel: answers[23] === 'Да, серьёзные' ? 'high' : 'medium',
      reasons: ['Проблемы со сном'],
      symptoms: ['Бессонница', 'Беспокойный сон']
    });
    deficiencies.push({
      vitamin: 'Витамин B6',
      deficiencyLevel: 'medium',
      reasons: ['Нарушения сна могут быть связаны с дефицитом B6'],
      symptoms: ['Плохое качество сна']
    });
  }

  // Стресс (вопрос 24)
  if (answers[24] && ['Очень высокий', 'Высокий'].includes(answers[24])) {
    deficiencies.push({
      vitamin: 'Магний',
      deficiencyLevel: 'high',
      reasons: ['Высокий уровень стресса'],
      symptoms: ['Нервное напряжение', 'Тревожность']
    });
    deficiencies.push({
      vitamin: 'Витамин B-комплекс',
      deficiencyLevel: 'high',
      reasons: ['Стресс истощает витамины группы B'],
      symptoms: ['Раздражительность', 'Нервозность']
    });
  }

  // Судороги в мышцах (вопрос 25)
  if (answers[25] && ['Часто', 'Иногда'].includes(answers[25])) {
    deficiencies.push({
      vitamin: 'Магний',
      deficiencyLevel: 'high',
      reasons: ['Судороги в мышцах - классический признак дефицита магния'],
      symptoms: ['Мышечные спазмы', 'Судороги']
    });
    deficiencies.push({
      vitamin: 'Кальций',
      deficiencyLevel: 'medium',
      reasons: ['Судороги могут указывать на нехватку кальция'],
      symptoms: ['Мышечные спазмы']
    });
  }

  // Настроение (вопрос 26)
  if (answers[26] && ['Часто плохое', 'Переменчивое'].includes(answers[26])) {
    deficiencies.push({
      vitamin: 'Витамин D3',
      deficiencyLevel: 'high',
      reasons: ['Плохое настроение может быть связано с дефицитом D3'],
      symptoms: ['Депрессивные состояния', 'Апатия']
    });
    deficiencies.push({
      vitamin: 'Омега-3',
      deficiencyLevel: 'medium',
      reasons: ['Нестабильное настроение'],
      symptoms: ['Перепады настроения']
    });
  }

  // Выпадение волос (вопрос 27)
  if (answers[27] && ['Да, сильное', 'Да, умеренное'].includes(answers[27])) {
    deficiencies.push({
      vitamin: 'Биотин',
      deficiencyLevel: 'high',
      reasons: ['Выпадение волос'],
      symptoms: ['Потеря волос', 'Ломкость волос']
    });
    deficiencies.push({
      vitamin: 'Железо',
      deficiencyLevel: 'high',
      reasons: ['Выпадение волос часто связано с дефицитом железа'],
      symptoms: ['Истончение волос']
    });
    deficiencies.push({
      vitamin: 'Цинк',
      deficiencyLevel: 'medium',
      reasons: ['Проблемы с волосами'],
      symptoms: ['Выпадение волос']
    });
  }

  return deficiencies;
}

// Анализ питания из анкеты этапа 3
export function analyzeStage3Deficiencies(answers: Record<number, any>): NutrientDeficiency[] {
  const deficiencies: NutrientDeficiency[] = [];

  // Красное мясо (вопрос 1002)
  if (answers[1002] && ['Редко/никогда', '1-2 раза в неделю'].includes(answers[1002])) {
    deficiencies.push({
      nutrient: 'Железо',
      deficiencyLevel: answers[1002] === 'Редко/никогда' ? 'high' : 'medium',
      foodSources: ['Говядина', 'Баранина', 'Печень'],
      reasons: ['Низкое потребление красного мяса']
    });
    deficiencies.push({
      nutrient: 'Витамин B12',
      deficiencyLevel: answers[1002] === 'Редко/никогда' ? 'high' : 'medium',
      foodSources: ['Мясо', 'Субпродукты'],
      reasons: ['Недостаточное потребление животных продуктов']
    });
  }

  // Рыба и морепродукты (вопрос 1004)
  if (answers[1004] && ['Редко/никогда', 'Раз в месяц'].includes(answers[1004])) {
    deficiencies.push({
      nutrient: 'Омега-3',
      deficiencyLevel: 'high',
      foodSources: ['Жирная рыба', 'Лосось', 'Скумбрия', 'Сардины'],
      reasons: ['Редкое употребление рыбы']
    });
    deficiencies.push({
      nutrient: 'Витамин D',
      deficiencyLevel: 'medium',
      foodSources: ['Жирная рыба', 'Икра'],
      reasons: ['Низкое потребление рыбы']
    });
    deficiencies.push({
      nutrient: 'Йод',
      deficiencyLevel: 'medium',
      foodSources: ['Морепродукты', 'Морская рыба'],
      reasons: ['Недостаток морепродуктов в рационе']
    });
  }

  // Молочные продукты (вопрос 1005)
  if (answers[1005] && ['Никогда', 'Редко'].includes(answers[1005])) {
    deficiencies.push({
      nutrient: 'Кальций',
      deficiencyLevel: 'high',
      foodSources: ['Молоко', 'Сыр', 'Йогурт', 'Творог'],
      reasons: ['Отсутствие молочных продуктов в рационе']
    });
    deficiencies.push({
      nutrient: 'Витамин B2 (Рибофлавин)',
      deficiencyLevel: 'medium',
      foodSources: ['Молоко', 'Сыр'],
      reasons: ['Низкое потребление молочных продуктов']
    });
  }

  // Яйца (вопрос 1006)
  if (answers[1006] && ['Редко/никогда'].includes(answers[1006])) {
    deficiencies.push({
      nutrient: 'Витамин B12',
      deficiencyLevel: 'medium',
      foodSources: ['Яйца'],
      reasons: ['Редкое употребление яиц']
    });
    deficiencies.push({
      nutrient: 'Витамин D',
      deficiencyLevel: 'medium',
      foodSources: ['Яичный желток'],
      reasons: ['Отсутствие яиц в рационе']
    });
  }

  // Свежие фрукты (вопрос 1007)
  if (answers[1007] && ['Никогда', 'Редко'].includes(answers[1007])) {
    deficiencies.push({
      nutrient: 'Витамин C',
      deficiencyLevel: 'high',
      foodSources: ['Цитрусовые', 'Ягоды', 'Киви'],
      reasons: ['Недостаток свежих фруктов']
    });
    deficiencies.push({
      nutrient: 'Клетчатка',
      deficiencyLevel: 'high',
      foodSources: ['Фрукты', 'Овощи'],
      reasons: ['Низкое потребление растительной пищи']
    });
  }

  // Овощи и зелень (вопрос 1008)
  if (answers[1008] && ['Никогда', 'Редко'].includes(answers[1008])) {
    deficiencies.push({
      nutrient: 'Витамин K',
      deficiencyLevel: 'high',
      foodSources: ['Листовая зелень', 'Шпинат', 'Капуста'],
      reasons: ['Отсутствие зелени в рационе']
    });
    deficiencies.push({
      nutrient: 'Фолиевая кислота',
      deficiencyLevel: 'high',
      foodSources: ['Зелёные овощи', 'Брокколи'],
      reasons: ['Недостаток овощей']
    });
    deficiencies.push({
      nutrient: 'Магний',
      deficiencyLevel: 'medium',
      foodSources: ['Зелёные листовые овощи'],
      reasons: ['Низкое потребление овощей']
    });
  }

  // Орехи и семена (вопрос 1009)
  if (answers[1009] && ['Никогда', 'Редко'].includes(answers[1009])) {
    deficiencies.push({
      nutrient: 'Витамин E',
      deficiencyLevel: 'medium',
      foodSources: ['Миндаль', 'Семена подсолнечника', 'Грецкие орехи'],
      reasons: ['Отсутствие орехов и семян']
    });
    deficiencies.push({
      nutrient: 'Магний',
      deficiencyLevel: 'medium',
      foodSources: ['Орехи', 'Семена'],
      reasons: ['Недостаток орехов в рационе']
    });
  }

  // Бобовые (вопрос 1010)
  if (answers[1010] && ['Никогда', 'Редко'].includes(answers[1010])) {
    deficiencies.push({
      nutrient: 'Растительный белок',
      deficiencyLevel: 'medium',
      foodSources: ['Фасоль', 'Чечевица', 'Нут'],
      reasons: ['Низкое потребление бобовых']
    });
    deficiencies.push({
      nutrient: 'Железо',
      deficiencyLevel: 'medium',
      foodSources: ['Бобовые'],
      reasons: ['Недостаток растительных источников железа']
    });
  }

  // Цельнозерновые (вопрос 1011)
  if (answers[1011] && ['Никогда', 'Редко'].includes(answers[1011])) {
    deficiencies.push({
      nutrient: 'Витамины группы B',
      deficiencyLevel: 'medium',
      foodSources: ['Овсянка', 'Гречка', 'Коричневый рис'],
      reasons: ['Отсутствие цельнозерновых продуктов']
    });
    deficiencies.push({
      nutrient: 'Клетчатка',
      deficiencyLevel: 'medium',
      foodSources: ['Цельные злаки'],
      reasons: ['Низкое потребление цельнозерновых']
    });
  }

  // Диета (вопрос 1012)
  if (answers[1012] === 'Веганство') {
    deficiencies.push({
      nutrient: 'Витамин B12',
      deficiencyLevel: 'high',
      foodSources: ['Обогащённые продукты', 'Добавки'],
      reasons: ['Веганская диета не содержит B12']
    });
    deficiencies.push({
      nutrient: 'Железо',
      deficiencyLevel: 'medium',
      foodSources: ['Бобовые', 'Обогащённые злаки'],
      reasons: ['Растительное железо усваивается хуже']
    });
    deficiencies.push({
      nutrient: 'Омега-3',
      deficiencyLevel: 'medium',
      foodSources: ['Льняное масло', 'Семена чиа', 'Водоросли'],
      reasons: ['Отсутствие рыбы в рационе']
    });
  }

  if (answers[1012] === 'Вегетарианство') {
    deficiencies.push({
      nutrient: 'Железо',
      deficiencyLevel: 'medium',
      foodSources: ['Яйца', 'Бобовые', 'Обогащённые злаки'],
      reasons: ['Отсутствие мясных источников железа']
    });
    deficiencies.push({
      nutrient: 'Омега-3',
      deficiencyLevel: 'medium',
      foodSources: ['Яйца', 'Льняное масло'],
      reasons: ['Отсутствие рыбы в рационе']
    });
  }

  // Вода (вопрос 1014)
  if (answers[1014] && answers[1014] === 'Менее 1 литра') {
    deficiencies.push({
      nutrient: 'Гидратация',
      deficiencyLevel: 'high',
      foodSources: ['Вода', 'Травяные чаи'],
      reasons: ['Критически низкое потребление воды']
    });
  }

  // Текущий приём витаминов (вопрос 1019)
  if (answers[1019] === 'Нет') {
    deficiencies.push({
      nutrient: 'Общая поддержка',
      deficiencyLevel: 'medium',
      foodSources: ['Мультивитамины'],
      reasons: ['Отсутствие дополнительной поддержки витаминами']
    });
  }

  return deficiencies;
}

// Комплексный анализ профиля пользователя
export function analyzeUserProfile(profile: UserProfile): HealthAnalysis {
  const age = calculateAge(profile.birthDate);
  const priorities: string[] = [...profile.goals];
  const lifestyle: string[] = [];
  const healthConcerns: string[] = [];
  const dietaryHabits: string[] = [];
  const geographicFactors: string[] = [
    'Россия - умеренный климат',
    'Дефицит солнечного света осенью и зимой',
    'Рекомендуется дополнительный приём витамина D3 (октябрь-март)'
  ];

  // Анализ возраста
  if (age < 30) {
    lifestyle.push('Молодой возраст - активный метаболизм');
  } else if (age >= 30 && age < 50) {
    lifestyle.push('Средний возраст - важна профилактика');
    healthConcerns.push('Рекомендуется регулярный контроль уровня витаминов');
  } else {
    lifestyle.push('Зрелый возраст - повышенная потребность в витаминах');
    healthConcerns.push('Особое внимание к кальцию и витамину D');
  }

  // Анализ расширенной анкеты
  let vitaminDeficiencies: VitaminDeficiency[] = [];
  if (profile.stage2Answers) {
    vitaminDeficiencies = analyzeStage2Deficiencies(profile.stage2Answers);
    
    // Добавляем выводы в категории
    if (profile.stage2Answers[24] && ['Очень высокий', 'Высокий'].includes(profile.stage2Answers[24])) {
      lifestyle.push('Высокий уровень стресса');
    }
    if (profile.stage2Answers[28]) {
      lifestyle.push(`Физическая активность: ${profile.stage2Answers[28]}`);
    }
    if (profile.stage2Answers[29]) {
      lifestyle.push(`Время на свежем воздухе: ${profile.stage2Answers[29]}`);
    }
  }

  // Анализ анкеты о питании
  let nutrientDeficiencies: NutrientDeficiency[] = [];
  if (profile.stage3Answers) {
    nutrientDeficiencies = analyzeStage3Deficiencies(profile.stage3Answers);
    
    // Добавляем выводы о питании
    if (profile.stage3Answers[1012]) {
      dietaryHabits.push(`Тип питания: ${profile.stage3Answers[1012]}`);
    }
    if (profile.stage3Answers[1020]) {
      dietaryHabits.push(`Разнообразие рациона: ${profile.stage3Answers[1020]}`);
    }
    if (profile.stage3Answers[1014]) {
      dietaryHabits.push(`Потребление воды: ${profile.stage3Answers[1014]}`);
    }
  }

  // Добавляем витамины на основе целей
  profile.goals.forEach(goal => {
    const vitamins = GOAL_TO_VITAMINS[goal] || [];
    vitamins.forEach(vitamin => {
      if (!vitaminDeficiencies.find(d => d.vitamin === vitamin)) {
        vitaminDeficiencies.push({
          vitamin,
          deficiencyLevel: 'medium',
          reasons: [`Рекомендовано для цели: ${goal}`],
          symptoms: []
        });
      }
    });
  });

  return {
    priorities,
    lifestyle,
    healthConcerns,
    dietaryHabits,
    geographicFactors,
    vitaminDeficiencies,
    nutrientDeficiencies
  };
}

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Объединение дефицитов (убираем дубликаты, суммируем уровни)
export function consolidateDeficiencies(
  vitaminDef: VitaminDeficiency[],
  nutrientDef: NutrientDeficiency[]
): Array<{name: string; level: string; reasons: string[]}> {
  const map = new Map<string, {level: number; reasons: Set<string>}>();
  
  const levelToNum = (level: string) => {
    if (level === 'high') return 3;
    if (level === 'medium') return 2;
    return 1;
  };

  vitaminDef.forEach(d => {
    const current = map.get(d.vitamin) || { level: 0, reasons: new Set() };
    current.level = Math.max(current.level, levelToNum(d.deficiencyLevel));
    d.reasons.forEach(r => current.reasons.add(r));
    map.set(d.vitamin, current);
  });

  nutrientDef.forEach(d => {
    const current = map.get(d.nutrient) || { level: 0, reasons: new Set() };
    current.level = Math.max(current.level, levelToNum(d.deficiencyLevel));
    d.reasons.forEach(r => current.reasons.add(r));
    map.set(d.nutrient, current);
  });

  const numToLevel = (num: number) => {
    if (num >= 3) return 'высокий';
    if (num >= 2) return 'средний';
    return 'низкий';
  };

  return Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      level: numToLevel(data.level),
      reasons: Array.from(data.reasons)
    }))
    .sort((a, b) => {
      const aNum = levelToNum(a.level);
      const bNum = levelToNum(b.level);
      return bNum - aNum;
    });
}