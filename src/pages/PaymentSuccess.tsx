import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, BookOpen, ChevronDown, ChevronUp, Image as ImageIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TASKS_API_URL = "https://functions.poehali.dev/c7eb02a5-bcf1-4ece-91de-d49b4c1e8466";

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

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const olympiadType = searchParams.get('type') || '';
  const studyYearParam = searchParams.get('study_year') || '';
  // ЮКасса автоматически добавляет paymentId в return_url
  const paymentId = searchParams.get('paymentId') || '';

  const [tasks, setTasks] = useState<OlympiadTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

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
      })
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, [olympiadType, studyYearParam, paymentId]);

  const toggleTask = (id: number) => {
    setExpandedTask((prev) => (prev === id ? null : id));
  };

  const olympiadName = OLYMPIAD_NAMES[olympiadType] || '';

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

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Спасибо за оплату!
          </h1>

          <div className="space-y-3 text-base text-gray-600 mb-6">
            <p className="font-semibold text-green-600 text-lg">
              Ваша заявка успешно зарегистрирована
            </p>
            {olympiadName && (
              <p>
                Олимпиада {olympiadName}
              </p>
            )}
            <p>
              Оплата прошла успешно. В случае вопросов мы свяжемся с вами по электронной почте.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 mb-6 text-left">
            <p className="text-gray-700 text-sm">
              Следите за результатами на главной странице. Мы оповестим вас о публикации итогов.
            </p>
          </div>

          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl"
          >
            Вернуться на главную
          </Button>
        </div>

        {/* Блок с заданиями */}
        {olympiadType && (
          <div className="bg-white rounded-3xl shadow-md border border-orange-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-orange-50 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Задания олимпиады</h2>
                <p className="text-xs text-gray-400">Выполните задания и сдайте работу в установленный срок</p>
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
              ) : (
                <div className="space-y-3">
                  {tasks.map((task, index) => {
                    const isOpen = expandedTask === task.id;
                    return (
                      <div
                        key={task.id}
                        className="border border-orange-100 rounded-2xl overflow-hidden transition-all"
                      >
                        {/* Шапка задания */}
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="w-full flex items-center justify-between px-5 py-4 bg-orange-50 hover:bg-orange-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">{task.title}</p>
                              {task.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            {task.image_url && (
                              <span className="text-orange-300" title="Есть изображение">
                                <ImageIcon size={14} />
                              </span>
                            )}
                            {task.options && task.options.length > 0 && (
                              <span className="text-orange-300" title="Есть варианты ответа">
                                <List size={14} />
                              </span>
                            )}
                            {isOpen ? (
                              <ChevronUp size={16} className="text-orange-400" />
                            ) : (
                              <ChevronDown size={16} className="text-orange-400" />
                            )}
                          </div>
                        </button>

                        {/* Тело задания */}
                        {isOpen && (
                          <div className="px-5 py-5 bg-white space-y-4">
                            {/* Изображение */}
                            {task.image_url && (
                              <div className="flex justify-center">
                                <img
                                  src={task.image_url}
                                  alt={task.title}
                                  className="max-w-full max-h-64 rounded-xl border border-orange-100 object-contain"
                                />
                              </div>
                            )}

                            {/* Вопрос */}
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                                {task.question}
                              </p>
                            </div>

                            {/* Варианты ответа */}
                            {task.options && task.options.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                  Варианты ответа:
                                </p>
                                <div className="space-y-2">
                                  {task.options.map((opt, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl"
                                    >
                                      <span className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                        {i + 1}
                                      </span>
                                      <span className="text-sm text-gray-700">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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