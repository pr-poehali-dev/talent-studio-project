import { SurveyData } from '@/pages/Index';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  dosage: string;
  count: string;
  emoji?: string;
  recommendation_tags?: string[];
}

interface RecommendationRule {
  goals?: string[];
  healthIssues?: string[];
  activity?: string[];
  diet?: string[];
  habits?: string[];
  workType?: string[];
  gender?: string[];
  reason: string;
  priority: number;
}

interface ProductRules {
  [key: string]: RecommendationRule[];
}

const tagToRules: ProductRules = {
  'vitamin_d3': [
    { goals: ['Укрепить иммунитет', 'Улучшить настроение'], reason: 'поддерживает иммунную систему и регулирует настроение', priority: 10 },
    { healthIssues: ['Частые простуды', 'Усталость', 'Плохое настроение'], reason: 'помогает бороться с усталостью и укрепляет защитные силы организма', priority: 9 },
    { workType: ['Офисная работа'], reason: 'компенсирует недостаток солнца при работе в помещении', priority: 7 },
    { activity: ['Низкая активность'], reason: 'важен при малоподвижном образе жизни', priority: 6 }
  ],
  'omega_3': [
    { goals: ['Улучшить концентрацию', 'Здоровье сердца'], reason: 'поддерживает работу мозга и сердечно-сосудистую систему', priority: 10 },
    { healthIssues: ['Проблемы с концентрацией', 'Сухость кожи'], reason: 'улучшает когнитивные функции и состояние кожи', priority: 9 },
    { diet: ['Веган/вегетарианец'], reason: 'восполняет дефицит жирных кислот при растительном питании', priority: 8 },
    { workType: ['Умственная работа'], reason: 'поддерживает работу мозга при интенсивных умственных нагрузках', priority: 8 }
  ],
  'magnesium': [
    { goals: ['Улучшить сон', 'Снизить стресс'], reason: 'помогает расслабиться и улучшает качество сна', priority: 10 },
    { healthIssues: ['Проблемы со сном', 'Тревожность', 'Мышечные спазмы'], reason: 'снижает тревожность и расслабляет мышцы', priority: 9 },
    { habits: ['Высокий стресс', 'Много кофе'], reason: 'компенсирует потери магния из-за стресса и кофеина', priority: 8 },
    { activity: ['Высокая активность'], reason: 'восстанавливает мышцы после физических нагрузок', priority: 7 }
  ],
  'b_complex': [
    { goals: ['Повысить энергию'], reason: 'участвует в энергетическом обмене и повышает работоспособность', priority: 10 },
    { healthIssues: ['Усталость', 'Проблемы с концентрацией'], reason: 'борется с усталостью и улучшает концентрацию', priority: 9 },
    { workType: ['Умственная работа', 'Физическая работа'], reason: 'поддерживает высокую работоспособность', priority: 8 },
    { habits: ['Много кофе', 'Курение', 'Алкоголь'], reason: 'восполняет дефицит витаминов группы B', priority: 7 }
  ],
  'vitamin_c': [
    { goals: ['Укрепить иммунитет', 'Улучшить кожу'], reason: 'мощный антиоксидант для иммунитета и красоты кожи', priority: 9 },
    { healthIssues: ['Частые простуды', 'Долгое заживление'], reason: 'укрепляет иммунитет и ускоряет восстановление', priority: 9 },
    { habits: ['Курение'], reason: 'компенсирует повышенную потребность в витамине C', priority: 8 }
  ],
  'zinc': [
    { goals: ['Укрепить иммунитет', 'Улучшить кожу'], reason: 'поддерживает иммунитет и здоровье кожи', priority: 8 },
    { healthIssues: ['Частые простуды', 'Проблемы с кожей', 'Выпадение волос'], reason: 'укрепляет иммунитет, улучшает состояние кожи и волос', priority: 9 },
    { gender: ['male'], reason: 'особенно важен для мужского здоровья', priority: 7 }
  ],
  'coq10': [
    { goals: ['Повысить энергию', 'Здоровье сердца'], reason: 'улучшает энергетику клеток и поддерживает сердце', priority: 8 },
    { activity: ['Высокая активность'], reason: 'повышает выносливость при физических нагрузках', priority: 8 },
    { healthIssues: ['Усталость'], reason: 'борется с хронической усталостью на клеточном уровне', priority: 7 }
  ],
  'iron': [
    { healthIssues: ['Усталость', 'Головокружение'], reason: 'устраняет дефицит железа и повышает уровень энергии', priority: 9 },
    { gender: ['female'], reason: 'компенсирует потери железа', priority: 8 },
    { diet: ['Веган/вегетарианец'], reason: 'восполняет дефицит при растительном питании', priority: 8 }
  ],
  'curcumin': [
    { goals: ['Снизить воспаление'], reason: 'мощный натуральный противовоспалительный агент', priority: 9 },
    { healthIssues: ['Боли в суставах', 'Воспаления'], reason: 'снижает воспаление и боль в суставах', priority: 9 },
    { activity: ['Высокая активность'], reason: 'ускоряет восстановление после тренировок', priority: 7 }
  ],
  'probiotics': [
    { goals: ['Улучшить пищеварение'], reason: 'восстанавливает баланс микрофлоры кишечника', priority: 10 },
    { healthIssues: ['Проблемы с пищеварением'], reason: 'нормализует работу ЖКТ', priority: 10 },
    { diet: ['Много обработанной пищи'], reason: 'компенсирует негативное влияние обработанной пищи', priority: 7 }
  ],
  'collagen': [
    { goals: ['Улучшить кожу', 'Здоровье суставов'], reason: 'улучшает состояние кожи, волос и суставов', priority: 8 },
    { healthIssues: ['Проблемы с кожей', 'Боли в суставах'], reason: 'восстанавливает коллаген в коже и суставах', priority: 8 }
  ],
  'ashwagandha': [
    { goals: ['Снизить стресс', 'Улучшить сон'], reason: 'адаптоген, который снижает стресс и улучшает сон', priority: 9 },
    { healthIssues: ['Тревожность', 'Проблемы со сном'], reason: 'помогает справиться со стрессом и нормализует сон', priority: 9 },
    { habits: ['Высокий стресс'], reason: 'повышает стрессоустойчивость', priority: 8 }
  ],
  'l_theanine': [
    { goals: ['Улучшить концентрацию', 'Снизить стресс'], reason: 'улучшает фокус без перевозбуждения', priority: 7 },
    { healthIssues: ['Тревожность', 'Проблемы с концентрацией'], reason: 'снижает тревожность и улучшает концентрацию', priority: 8 },
    { habits: ['Много кофе'], reason: 'снижает нервозность от кофеина', priority: 7 }
  ],
  'melatonin': [
    { goals: ['Улучшить сон'], reason: 'регулирует циркадные ритмы и улучшает засыпание', priority: 9 },
    { healthIssues: ['Проблемы со сном'], reason: 'помогает быстрее засыпать и улучшает качество сна', priority: 10 },
    { workType: ['Ночные смены'], reason: 'помогает адаптироваться к нерегулярному графику', priority: 9 }
  ],
  'creatine': [
    { goals: ['Повысить энергию', 'Набрать мышечную массу'], reason: 'увеличивает силу и мышечную массу', priority: 9 },
    { activity: ['Высокая активность'], reason: 'повышает спортивную производительность', priority: 10 },
    { workType: ['Физическая работа'], reason: 'увеличивает силу и выносливость', priority: 7 }
  ],
  'rhodiola': [
    { goals: ['Повысить энергию', 'Снизить стресс'], reason: 'адаптоген для энергии и стрессоустойчивости', priority: 8 },
    { healthIssues: ['Усталость', 'Тревожность'], reason: 'борется с усталостью и повышает устойчивость к стрессу', priority: 8 },
    { habits: ['Высокий стресс'], reason: 'помогает организму адаптироваться к стрессу', priority: 7 }
  ]
};

export function calculateRecommendations(surveyData: SurveyData, products: Product[]): Array<{ product: Product; reason: string; score: number }> {
  const recommendations: Array<{ product: Product; reason: string; score: number }> = [];

  products.forEach(product => {
    if (!product.recommendation_tags || product.recommendation_tags.length === 0) return;
    
    let allRules: RecommendationRule[] = [];
    product.recommendation_tags.forEach(tag => {
      const rules = tagToRules[tag];
      if (rules) {
        allRules = allRules.concat(rules);
      }
    });
    
    if (allRules.length === 0) return;

    let totalScore = 0;
    let bestReason = '';
    let highestPriority = 0;

    allRules.forEach(rule => {
      let ruleScore = 0;
      let matches = 0;

      if (rule.goals) {
        const goalMatches = rule.goals.filter(g => surveyData.goals.includes(g)).length;
        if (goalMatches > 0) {
          ruleScore += goalMatches * rule.priority;
          matches += goalMatches;
        }
      }

      if (rule.healthIssues) {
        const healthMatches = rule.healthIssues.filter(h => surveyData.healthIssues.includes(h)).length;
        if (healthMatches > 0) {
          ruleScore += healthMatches * rule.priority * 1.2;
          matches += healthMatches;
        }
      }

      if (rule.activity && rule.activity.includes(surveyData.activity)) {
        ruleScore += rule.priority;
        matches++;
      }

      if (rule.diet && rule.diet.includes(surveyData.diet)) {
        ruleScore += rule.priority;
        matches++;
      }

      if (rule.habits) {
        const habitMatches = rule.habits.filter(h => surveyData.habits.includes(h)).length;
        if (habitMatches > 0) {
          ruleScore += habitMatches * rule.priority;
          matches += habitMatches;
        }
      }

      if (rule.workType && rule.workType.includes(surveyData.workType)) {
        ruleScore += rule.priority;
        matches++;
      }

      if (rule.gender && rule.gender.includes(surveyData.gender)) {
        ruleScore += rule.priority * 0.8;
        matches++;
      }

      if (matches > 0 && rule.priority > highestPriority) {
        highestPriority = rule.priority;
        bestReason = rule.reason;
      }

      totalScore += ruleScore;
    });

    if (totalScore > 0) {
      recommendations.push({
        product,
        reason: bestReason,
        score: totalScore
      });
    }
  });

  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.slice(0, 6);
}

export function getSynergies(productNames: string[]): Array<{ combo: string; effect: string }> {
  const synergyMap: { [key: string]: string } = {
    'Витамин D3+Омега-3 Premium': 'Омега-3 улучшает усвоение витамина D3, усиливая противовоспалительный эффект',
    'Витамин D3+Магний цитрат': 'Магний необходим для преобразования D3 в активную форму',
    'B-комплекс энергия+Магний цитрат': 'Магний активирует витамины группы B, повышая энергетический потенциал',
    'Витамин C липосомальный+Цинк хелат': 'Взаимно усиливают иммунную защиту организма',
    'Коэнзим Q10+Омега-3 Premium': 'Синергия для здоровья сердца и энергии клеток',
    'Куркумин+Омега-3 Premium': 'Усиленный противовоспалительный эффект',
    'Магний цитрат+Мелатонин': 'Комплексное улучшение качества сна',
    'L-теанин+B-комплекс энергия': 'Спокойная концентрация и продуктивность',
    'Ашваганда+Магний цитрат': 'Глубокое расслабление и снижение стресса',
    'Коллаген морской+Витамин C липосомальный': 'Витамин C необходим для синтеза коллагена'
  };

  const synergies: Array<{ combo: string; effect: string }> = [];
  
  for (let i = 0; i < productNames.length; i++) {
    for (let j = i + 1; j < productNames.length; j++) {
      const key1 = `${productNames[i]}+${productNames[j]}`;
      const key2 = `${productNames[j]}+${productNames[i]}`;
      
      if (synergyMap[key1]) {
        synergies.push({ combo: productNames[i] + ' + ' + productNames[j], effect: synergyMap[key1] });
      } else if (synergyMap[key2]) {
        synergies.push({ combo: productNames[j] + ' + ' + productNames[i], effect: synergyMap[key2] });
      }
    }
  }

  return synergies;
}