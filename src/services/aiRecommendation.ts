import type { SurveyData } from '@/pages/Index';

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  dosage?: string;
  emoji?: string;
}

interface Recommendation {
  product: Product;
  reason: string;
  priority: number;
  score: number;
}

export async function analyzeAndRecommend(
  surveyData: SurveyData,
  products: Product[]
): Promise<Recommendation[]> {
  const scores: Map<number, { score: number; reasons: string[] }> = new Map();

  products.forEach(product => {
    scores.set(product.id, { score: 0, reasons: [] });
  });

  analyzeGoals(surveyData.goals, products, scores);
  analyzeHealthIssues(surveyData.healthIssues, products, scores);
  analyzeActivity(surveyData.activity, products, scores);
  analyzeDiet(surveyData.diet, surveyData.foodCategories, products, scores);
  analyzeHabits(surveyData.habits, products, scores);
  analyzeWorkType(surveyData.workType, products, scores);
  analyzeGender(surveyData.gender, products, scores);

  const recommendations: Recommendation[] = [];
  
  scores.forEach((data, productId) => {
    if (data.score > 0) {
      const product = products.find(p => p.id === productId);
      if (product) {
        const priority = Math.min(5, Math.ceil(data.score / 20));
        const reason = data.reasons.slice(0, 2).join('. ') + '.';
        
        recommendations.push({
          product,
          reason,
          priority,
          score: data.score
        });
      }
    }
  });

  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.slice(0, 5);
}

function addScore(
  scores: Map<number, { score: number; reasons: string[] }>,
  productId: number,
  points: number,
  reason: string
) {
  const data = scores.get(productId);
  if (data) {
    data.score += points;
    if (reason && !data.reasons.includes(reason)) {
      data.reasons.push(reason);
    }
  }
}

function analyzeGoals(
  goals: string[],
  products: Product[],
  scores: Map<number, { score: number; reasons: string[] }>
) {
  const goalMapping: Record<string, string[]> = {
    'Улучшить энергию и бодрость': ['витамин b', 'магний', 'железо', 'коэнзим', 'энергия', 'бодрость', 'усталость'],
    'Укрепить иммунитет': ['витамин c', 'витамин d', 'цинк', 'селен', 'иммун', 'защита'],
    'Поддержать здоровье кожи и волос': ['биотин', 'витамин e', 'коллаген', 'омега', 'кожа', 'волос', 'ногти'],
    'Снизить стресс': ['магний', 'витамин b', 'ашваганда', 'l-теанин', 'стресс', 'тревож', 'успокоение'],
    'Улучшить сон': ['магний', 'мелатонин', 'глицин', 'витамин b6', 'сон', 'засыпание'],
    'Поддержать здоровье сердца': ['омега-3', 'коэнзим q10', 'магний', 'калий', 'сердце', 'сосуды']
  };

  goals.forEach(goal => {
    const keywords = goalMapping[goal] || [];
    products.forEach(product => {
      const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      
      keywords.forEach(keyword => {
        if (productText.includes(keyword.toLowerCase())) {
          addScore(scores, product.id, 15, `Помогает достичь цели: ${goal}`);
        }
      });
    });
  });
}

function analyzeHealthIssues(
  issues: string[],
  products: Product[],
  scores: Map<number, { score: number; reasons: string[] }>
) {
  const issueMapping: Record<string, string[]> = {
    'Проблемы с ЖКТ': ['пробиотик', 'витамин d', 'омега', 'жкт', 'пищеварение', 'кишечник'],
    'Гормональный дисбаланс': ['витамин d', 'омега-3', 'магний', 'цинк', 'гормон', 'баланс'],
    'Частые простуды': ['витамин c', 'витамин d', 'цинк', 'иммун', 'защита', 'простуд'],
    'Хроническая усталость': ['витамин b', 'железо', 'магний', 'коэнзим', 'энергия', 'усталость'],
    'Проблемы со сном': ['магний', 'мелатонин', 'витамин b6', 'глицин', 'сон'],
    'Стресс и тревожность': ['магний', 'витамин b', 'ашваганда', 'стресс', 'тревож', 'успокоение']
  };

  issues.forEach(issue => {
    if (issue === 'Нет особенностей') return;
    
    const keywords = issueMapping[issue] || [];
    products.forEach(product => {
      const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      
      keywords.forEach(keyword => {
        if (productText.includes(keyword.toLowerCase())) {
          addScore(scores, product.id, 20, `Помогает при: ${issue}`);
        }
      });
    });
  });
}

function analyzeActivity(
  activity: string,
  products: Product[],
  scores: Map<number, { score: number; reasons: string[] }>
) {
  const activityKeywords: Record<string, string[]> = {
    'Высокая': ['магний', 'витамин b', 'электролит', 'восстановление', 'мышц', 'белок', 'bcaa'],
    'Профессиональная': ['магний', 'витамин b', 'омега-3', 'коэнзим', 'восстановление', 'выносливость', 'bcaa'],
    'Умеренная': ['витамин d', 'магний', 'витамин b'],
    'Легкая': ['витамин d', 'омега-3'],
    'Минимальная': ['витамин d', 'витамин b12']
  };

  const keywords = activityKeywords[activity] || [];
  products.forEach(product => {
    const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    
    keywords.forEach(keyword => {
      if (productText.includes(keyword.toLowerCase())) {
        const points = activity === 'Профессиональная' || activity === 'Высокая' ? 12 : 8;
        addScore(scores, product.id, points, `Подходит для вашего уровня активности`);
      }
    });
  });
}

function analyzeDiet(
  diet: string,
  foodCategories: string[],
  products: Product[],
  scores: Map<number, { score: number; reasons: string[] }>
) {
  const dietDeficiencies: Record<string, { keywords: string[]; reason: string }> = {
    'Вегетарианство': {
      keywords: ['витамин b12', 'железо', 'омега-3', 'цинк', 'витамин d'],
      reason: 'Восполняет дефициты при вегетарианской диете'
    },
    'Веганство': {
      keywords: ['витамин b12', 'витамин d', 'железо', 'омега-3', 'цинк', 'йод'],
      reason: 'Необходим при веганском питании'
    },
    'Кето-диета': {
      keywords: ['магний', 'калий', 'натрий', 'электролит', 'витамин b'],
      reason: 'Поддерживает баланс на кето-диете'
    }
  };

  const deficiency = dietDeficiencies[diet];
  if (deficiency) {
    products.forEach(product => {
      const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      
      deficiency.keywords.forEach(keyword => {
        if (productText.includes(keyword.toLowerCase())) {
          addScore(scores, product.id, 18, deficiency.reason);
        }
      });
    });
  }

  const hasLittleFish = !foodCategories.includes('Рыба');
  const hasLittleMeat = !foodCategories.includes('Мясо и птица');
  const hasLittleDairy = !foodCategories.includes('Молочные продукты');

  products.forEach(product => {
    const productText = `${product.name} ${product.description}`.toLowerCase();
    
    if (hasLittleFish && (productText.includes('омега') || productText.includes('рыбий жир'))) {
      addScore(scores, product.id, 15, 'В рационе мало рыбы - источника Омега-3');
    }
    
    if (hasLittleMeat && (productText.includes('железо') || productText.includes('b12'))) {
      addScore(scores, product.id, 12, 'Восполняет дефицит при малом употреблении мяса');
    }
    
    if (hasLittleDairy && (productText.includes('кальций') || productText.includes('витамин d'))) {
      addScore(scores, product.id, 10, 'Восполняет дефицит кальция и витамина D');
    }
  });
}

function analyzeHabits(
  habits: string[],
  products: Product[],
  scores: Map<number, { score: number; reasons: string[] }>
) {
  const habitMapping: Record<string, { keywords: string[]; reason: string }> = {
    'Курение': {
      keywords: ['витамин c', 'витамин e', 'селен', 'антиоксидант'],
      reason: 'Защищает от окислительного стресса при курении'
    },
    'Алкоголь регулярно': {
      keywords: ['витамин b', 'магний', 'печень', 'детокс'],
      reason: 'Поддерживает печень и восполняет дефицит витаминов группы B'
    },
    'Много кофе': {
      keywords: ['магний', 'кальций', 'витамин d'],
      reason: 'Восполняет минералы, вымываемые кофеином'
    },
    'Недостаток сна': {
      keywords: ['магний', 'мелатонин', 'витамин b', 'глицин'],
      reason: 'Помогает улучшить качество сна'
    }
  };

  habits.forEach(habit => {
    if (habit === 'Нет вредных привычек') return;
    
    const mapping = habitMapping[habit];
    if (mapping) {
      products.forEach(product => {
        const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
        
        mapping.keywords.forEach(keyword => {
          if (productText.includes(keyword.toLowerCase())) {
            addScore(scores, product.id, 14, mapping.reason);
          }
        });
      });
    }
  });
}

function analyzeWorkType(
  workType: string,
  products: Product[],
  scores: Map<number, { score: number; reasons: string[] }>
) {
  const workMapping: Record<string, string[]> = {
    'Умственная работа': ['витамин b', 'омега-3', 'магний', 'гинкго', 'память', 'концентрация', 'мозг'],
    'Физическая работа': ['магний', 'витамин b', 'витамин d', 'электролит', 'восстановление'],
    'Работа за компьютером': ['витамин a', 'лютеин', 'зрение', 'глаза', 'омега-3']
  };

  const keywords = workMapping[workType] || [];
  products.forEach(product => {
    const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    
    keywords.forEach(keyword => {
      if (productText.includes(keyword.toLowerCase())) {
        addScore(scores, product.id, 10, `Поддерживает организм при ${workType.toLowerCase()}`);
      }
    });
  });
}

function analyzeGender(
  gender: string,
  products: Product[],
  scores: Map<number, { score: number; reasons: string[] }>
) {
  if (gender === 'Женский') {
    products.forEach(product => {
      const productText = `${product.name} ${product.description}`.toLowerCase();
      
      if (productText.includes('железо')) {
        addScore(scores, product.id, 8, 'Важно для женского здоровья');
      }
      if (productText.includes('фолиевая') || productText.includes('фолат')) {
        addScore(scores, product.id, 8, 'Поддержка женского здоровья');
      }
      if (productText.includes('кальций')) {
        addScore(scores, product.id, 7, 'Профилактика остеопороза');
      }
    });
  }

  if (gender === 'Мужской') {
    products.forEach(product => {
      const productText = `${product.name} ${product.description}`.toLowerCase();
      
      if (productText.includes('цинк')) {
        addScore(scores, product.id, 8, 'Поддержка мужского здоровья');
      }
      if (productText.includes('магний')) {
        addScore(scores, product.id, 7, 'Важен для мужского организма');
      }
    });
  }
}
