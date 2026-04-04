import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, PlayCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OLYMPIAD_NAMES: Record<string, string> = {
  palette: 'Палитра талантов',
  grani: 'Грани творчества',
};

const STUDY_YEAR_LABELS: Record<string, string> = {
  '1': '1 год обучения',
  '2': '2 год обучения',
  '3': '3 год обучения',
  '4': '4 год обучения',
  '5': '5 год обучения',
  '6': '6 год обучения',
  '7': '7 год обучения',
  '8': '8 год обучения',
  '9': '9 год обучения',
  '10': '10 год обучения',
};

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const olympiadType = searchParams.get('type') || '';
  const studyYearParam = searchParams.get('study_year') || '';
  const paymentId =
    searchParams.get('paymentId') ||
    searchParams.get('payment_id') ||
    localStorage.getItem('olympiad_payment_id') ||
    '';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const olympiadName = OLYMPIAD_NAMES[olympiadType] || 'Олимпиада';
  const studyYearLabel = STUDY_YEAR_LABELS[studyYearParam] || (studyYearParam ? `${studyYearParam} год обучения` : '');

  const handleStartTasks = () => {
    const params = new URLSearchParams();
    if (olympiadType) params.set('type', olympiadType);
    if (studyYearParam) params.set('study_year', studyYearParam);
    if (paymentId) params.set('payment_id', paymentId);
    window.open(`/olympiad/tasks?${params.toString()}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center py-10 px-4">
      <div className="max-w-lg w-full space-y-5">

        {/* Карточка успеха */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 text-center border border-orange-100">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Оплата прошла!</h1>
          <p className="text-green-600 font-semibold text-base mb-6">Заявка успешно зарегистрирована</p>

          {/* Инфо об олимпиаде */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Олимпиада</p>
                <p className="text-gray-800 font-bold text-base">«{olympiadName}»</p>
              </div>
            </div>
            {studyYearLabel && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-500 font-bold text-sm">Кл</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Возрастная категория</p>
                  <p className="text-gray-800 font-semibold">{studyYearLabel}</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-8">
            Нажмите кнопку ниже, чтобы перейти к заданиям. Они откроются в новой вкладке.
          </p>

          <Button
            onClick={handleStartTasks}
            size="lg"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-6 text-base font-bold flex items-center justify-center gap-2 mb-4"
          >
            <PlayCircle className="w-5 h-5" />
            Начать выполнение олимпиады
          </Button>

          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
          >
            Вернуться на главную
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccess;
