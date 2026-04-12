import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, PlayCircle, Trophy, Copy, Check, Link, Mail, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OLYMPIAD_NAMES: Record<string, string> = {
  palette: 'Палитра талантов',
  izo: 'Палитра талантов',
  grani: 'Грани творчества',
  dpi: 'Грани мастерства',
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
  const [copied, setCopied] = useState(false);

  const mode = searchParams.get('mode') || '';
  const isContest = mode === 'contest';

  const olympiadType = searchParams.get('type') || '';
  const studyYearParam = searchParams.get('study_year') || '';
  const fullName = searchParams.get('full_name') || '';
  const contestName = searchParams.get('contest_name') || '';
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

  const taskParams = new URLSearchParams();
  if (olympiadType) taskParams.set('type', olympiadType);
  if (studyYearParam) taskParams.set('study_year', studyYearParam);
  if (paymentId) taskParams.set('payment_id', paymentId);
  const taskUrl = `${window.location.origin}/olympiad/tasks?${taskParams.toString()}`;

  const handleStartTasks = () => {
    window.open(taskUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(taskUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isContest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-orange-50 flex items-center justify-center py-10 px-4">
        <div className="max-w-lg w-full space-y-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 text-center border border-green-100">

            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-14 h-14 text-green-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Заявка принята!</h1>
            <p className="text-green-600 font-semibold text-base mb-1">Оплата прошла успешно</p>
            <p className="text-gray-400 text-sm mb-7">Спасибо за участие в конкурсе</p>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Trophy className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  {contestName && (
                    <>
                      <p className="text-xs text-gray-400 font-medium mb-0.5">Конкурс</p>
                      <p className="text-gray-800 font-bold text-base leading-snug">«{contestName}»</p>
                    </>
                  )}
                  {fullName && (
                    <p className="text-sm text-gray-600 font-semibold mt-1">{fullName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-7 text-left">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-1">Что будет дальше?</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    После рассмотрения вашей работы мы направим уведомление на электронную почту, указанную при регистрации.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 rounded-2xl border-2 border-orange-200 text-orange-600 font-semibold text-sm hover:bg-orange-50 transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                {fullName && <p className="text-sm text-gray-600 font-semibold mt-0.5">{fullName}</p>}
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

          <p className="text-sm text-gray-500 mb-6">
            Нажмите кнопку ниже, чтобы перейти к заданиям. Они откроются в новой вкладке.
          </p>

          <Button
            onClick={handleStartTasks}
            size="lg"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl py-6 text-base font-bold flex items-center justify-center gap-2 mb-5"
          >
            <PlayCircle className="w-5 h-5" />
            Начать выполнение олимпиады
          </Button>

          {paymentId && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 text-left">
              <div className="flex items-start gap-2 mb-2">
                <Link className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 font-semibold">Ваша личная ссылка на олимпиаду</p>
              </div>
              <p className="text-xs text-blue-600 mb-3 leading-relaxed">
                Если потеряете интернет или закроете вкладку — вернитесь по этой ссылке и продолжите с того же места.
              </p>
              <div className="flex items-center gap-2 bg-white border border-blue-200 rounded-xl px-3 py-2">
                <span className="text-xs text-gray-500 truncate flex-1 font-mono">{taskUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Скопировано</span></>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /><span>Копировать</span></>
                  )}
                </button>
              </div>
            </div>
          )}

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