import type { SurveyData } from '@/pages/Index';

interface Recommendation {
  product: any;
  reason: string;
  priority: number;
  score: number;
}

interface RecommendationHistory {
  id: number;
  user_id: string;
  survey_data: SurveyData;
  recommendations: Recommendation[];
  created_at: string;
  is_active: boolean;
}

const STORAGE_KEY = 'vitamin_user_id';
const HISTORY_KEY = 'recommendations_history';

export function getUserId(): string {
  let userId = localStorage.getItem(STORAGE_KEY);
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, userId);
  }
  
  return userId;
}

export function saveRecommendations(
  surveyData: SurveyData,
  recommendations: Recommendation[]
): void {
  const userId = getUserId();
  const history = getLocalHistory();
  
  const newEntry: RecommendationHistory = {
    id: Date.now(),
    user_id: userId,
    survey_data: surveyData,
    recommendations: recommendations,
    created_at: new Date().toISOString(),
    is_active: true
  };
  
  history.unshift(newEntry);
  
  if (history.length > 10) {
    history.splice(10);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getRecommendationsHistory(): RecommendationHistory[] {
  return getLocalHistory();
}

export function getLatestRecommendations(): RecommendationHistory | null {
  const history = getLocalHistory();
  return history.length > 0 ? history[0] : null;
}

export function deleteRecommendation(id: number): void {
  const history = getLocalHistory();
  const filtered = history.filter(entry => entry.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

function getLocalHistory(): RecommendationHistory[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error parsing history:', error);
    return [];
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн назад`;
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
