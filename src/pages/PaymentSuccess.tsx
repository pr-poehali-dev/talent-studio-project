import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, BookOpen, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const TASKS_API_URL = "https://functions.poehali.dev/c7eb02a5-bcf1-4ece-91de-d49b4c1e8466";
const ANSWERS_API_URL = "https://functions.poehali.dev/6e919c14-0327-44c1-827b-d524f0192c73";

interface OlympiadTask {
  id: number;
  olympiad_type: string;
  title: string;
  description: string;
  question: string;
  image_url: string | null;
  options: string[] | null;
  sort_order: number;
  is_active: boolean;
}

const OLYMPIAD_NAMES: Record<string, string> = {
  palette: '«Палитра талантов»',
  grani: '«Грани творчества»',
};

const OPTION_LABELS = ['А', 'Б', 'В', 'Г', 'Д', 'Е'];

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const olympiadType = searchParams.get('type') || '';
  const studyYearParam = searchParams.get('study_year') || '';
  const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id') || localStorage.getItem('olympiad_payment_id') || '';

  const [tasks, setTasks] = useState<OlympiadTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const taskCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!olympiadType || !paymentId) return;
    setTasksLoading(true);
    const url = studyYearParam
      ? `${TASKS_API_URL}?type=${olympiadType}&study_year=${studyYearParam}&payment_id=${paymentId}`
      : `${TASKS_API_URL}?type=${olympiadType}&payment_id=${paymentId}`;
    fetch(url)
      .then((r) => r.json())
      .then((data: OlympiadTask[]) => {
        setTasks(Array.isArray(data) ? data : []);
        localStorage.removeItem('olympiad_payment_id');
      })
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, [olympiadType, studyYearParam, paymentId]);

  const olympiadName = OLYMPIAD_NAMES[olympiadType] || '';
  const task = tasks[currentIndex];
  const total = tasks.length;
  const answered = Object.keys(answers).length;

  const scrollToCard = () => {
    if (taskCardRef.current) {
      const top = taskCardRef.current.getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleAnswer = (taskId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [taskId]: option }));
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
    scrollToCard();
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      scrollToCard();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      scrollToCard();
    }
  };

  const handleSubmit = async () => {
    if (!paymentId) return;
    setSubmitting(true);
    try {
      const answersPayload: Record<string, string> = {};
      for (const [taskId, answer] of Object.entries(answers)) {
        answersPayload[taskId] = answer;
      }
      await fetch(ANSWERS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          olympiad_type: olympiadType,
          answers: answersPayload,
          submitted: true,
        }),
      });
      setSubmitted(true);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Карточка успеха */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 text-center border border-orange-100">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Спасибо за оплату!</h1>
          <div className="space-y-3 text-base text-gray-600 mb-6">
            <p className="font-semibold text-green-600 text-lg">Ваша заявка успешно зарегистрирована</p>
            {olympiadName && <p>Олимпиада {olympiadName}</p>}
            <p>Оплата прошла успешно. В случае вопросов мы свяжемся с вами по электронной почте.</p>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 text-left">
            <p className="text-gray-700 text-sm">Следите за результатами на главной странице. Мы оповестим вас о публикации итогов.</p>
          </div>
          <Button onClick={() => navigate('/')} size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl">
            Вернуться на главную
          </Button>
        </div>

        {/* Блок с заданиями */}
        {olympiadType && (
          <div ref={taskCardRef} className="bg-white rounded-3xl shadow-md border border-orange-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-orange-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Задания олимпиады</h2>
                <p className="text-xs text-gray-400">Выполните задания и отправьте на проверку</p>
              </div>
            </div>

            <div className="p-6">
              {tasksLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                  <svg className="animate-spin h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Загружаем задания...
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Задания будут опубликованы в ближайшее время</p>
                </div>
              ) : submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-800">Ответы отправлены на проверку!</p>
                  <p className="text-sm text-gray-500">Результаты будут опубликованы на главной странице</p>
                </div>
              ) : (
                <div className="space-y-5">

                  {/* Навигация по вопросам */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Вопрос <span className="font-bold text-gray-800">{currentIndex + 1}</span> из {total}</span>
                      <span className="text-orange-500 font-medium">{answered} из {total} отвечено</span>
                    </div>
                    <div className="w-full bg-orange-100 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${total > 0 ? ((currentIndex + 1) / total) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tasks.map((t, i) => {
                        const isAnswered = answers[t.id] !== undefined;
                        const isCurrent = i === currentIndex;
                        return (
                          <button
                            key={t.id}
                            onClick={() => goTo(i)}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all border-2 ${
                              isCurrent
                                ? 'bg-orange-500 text-white border-orange-500 scale-110'
                                : isAnswered
                                ? 'bg-green-100 text-green-700 border-green-300 hover:border-green-400'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Карточка текущего задания */}
                  {task && (
                    <div className="border border-orange-100 rounded-2xl overflow-hidden">
                      <div className="px-5 py-4 bg-orange-50 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {currentIndex + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="px-5 py-5 bg-white space-y-4">
                        {task.image_url && (
                          <div className="flex justify-center">
                            <img
                              src={task.image_url}
                              alt={task.title}
                              className="max-w-full max-h-64 rounded-xl border border-orange-100 object-contain"
                            />
                          </div>
                        )}

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">{task.question}</p>
                        </div>

                        {task.options && task.options.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Выберите ответ:</p>
                            {task.options.map((opt, i) => {
                              const label = OPTION_LABELS[i] || String(i + 1);
                              const isSelected = answers[task.id] === opt;
                              return (
                                <button
                                  key={i}
                                  onClick={() => handleAnswer(task.id, opt)}
                                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                                    isSelected
                                      ? 'border-orange-500 bg-orange-50'
                                      : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50'
                                  }`}
                                >
                                  <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                                    isSelected ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
                                  }`}>
                                    {label}
                                  </span>
                                  <span className={`text-sm ${isSelected ? 'text-orange-800 font-medium' : 'text-gray-700'}`}>{opt}</span>
                                  {isSelected && (
                                    <Icon name="Check" size={16} className="text-orange-500 ml-auto flex-shrink-0 mt-0.5" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="px-5 py-4 bg-gray-50 border-t border-orange-50 flex items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          onClick={handlePrev}
                          disabled={currentIndex === 0}
                          className="flex items-center gap-1 rounded-xl"
                        >
                          <ChevronLeft size={16} />
                          Назад
                        </Button>

                        {currentIndex < total - 1 ? (
                          <Button
                            onClick={handleNext}
                            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                          >
                            Следующий
                            <ChevronRight size={16} />
                          </Button>
                        ) : (
                          <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                            <Icon name="CheckCircle" size={16} className="text-green-500" />
                            Последний вопрос
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Кнопка финальной отправки */}
                  <div className="pt-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || answered === 0}
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-6 text-base font-semibold flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Отправляем...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Закончить выполнение и отправить на проверку
                          {answered > 0 && <span className="ml-1 text-green-200">({answered}/{total})</span>}
                        </>
                      )}
                    </Button>
                    {answered < total && answered > 0 && (
                      <p className="text-center text-xs text-amber-600 mt-2">
                        Вы ответили не на все вопросы. Можно отправить частично.
                      </p>
                    )}
                    {answered === 0 && (
                      <p className="text-center text-xs text-gray-400 mt-2">
                        Ответьте хотя бы на один вопрос, чтобы отправить
                      </p>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
