import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import PdfModal from "@/components/index-page/modals/PdfModal";
import ImageModal from "@/components/index-page/modals/ImageModal";

const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
const PAYMENT_API_URL = "https://functions.poehali.dev/f40bd7c6-a503-4165-8673-e8091832d07c";
const APPLICATIONS_API_URL = "https://functions.poehali.dev/64be6370-4826-4077-bfeb-ce5e443733b7";

interface OlympiadSettings {
  olympiad_grani_price: string;
  olympiad_grani_description: string;
  olympiad_grani_rules_url: string;
  olympiad_grani_diploma_url: string;
  olympiad_grani_gratitude_url: string;
}

const STUDY_YEARS = Array.from({ length: 9 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}-й год обучения`,
}));

export default function GraniOlympiad() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState<OlympiadSettings>({
    olympiad_grani_price: "300",
    olympiad_grani_description: "Всероссийская интерактивная олимпиада по ДПИ для учащихся 1–9 классов.",
    olympiad_grani_rules_url: "",
    olympiad_grani_diploma_url: "",
    olympiad_grani_gratitude_url: "",
  });

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    studyYear: "",
    teacher: "",
    institution: "",
    email: "",
    terms: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const [recoverEmail, setRecoverEmail] = useState("");
  const [recovering, setRecovering] = useState(false);
  const [recoveredLinks, setRecoveredLinks] = useState<{ task_url: string; full_name: string }[] | null>(null);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoverEmail.trim()) return;
    setRecovering(true);
    setRecoveredLinks(null);
    try {
      const res = await fetch(`${APPLICATIONS_API_URL}?type=dpi&email=${encodeURIComponent(recoverEmail.trim())}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRecoveredLinks(data);
      } else {
        toast({ title: "Заявка не найдена", description: "Проверьте email или обратитесь в поддержку", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Попробуйте снова", variant: "destructive" });
    } finally {
      setRecovering(false);
    }
  };

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const openDocument = (url: string) => {
    const isImage = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
    if (isImage) {
      setImagePreview(url);
      setIsImageModalOpen(true);
    } else {
      setPdfUrl(url);
      setIsPdfModalOpen(true);
    }
  };

  useEffect(() => {
    fetch(SETTINGS_API_URL)
      .then((r) => r.json())
      .then((data) => setSettings((prev) => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  const price = parseInt(settings.olympiad_grani_price) || 300;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.terms) {
      toast({ title: "Необходимо принять условия участия", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(PAYMENT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: settings.olympiad_grani_price,
          description: `Олимпиада по ДПИ — ${form.fullName}`,
          email: form.email,
          olympiad_type: "dpi",
          origin: window.location.origin,
          application_data: {
            full_name: form.fullName,
            age: parseInt(form.age),
            study_year: parseInt(form.studyYear),
            teacher: form.teacher || null,
            institution: form.institution || null,
            work_title: "",
            email: form.email,
            olympiad_type: "dpi",
          },
        }),
      });
      const data = await res.json();
      if (data.confirmation_url) {
        if (data.payment_id) {
          localStorage.setItem("olympiad_payment_id", data.payment_id);
          localStorage.setItem("olympiad_type", "dpi");
          localStorage.setItem("olympiad_study_year", form.studyYear);
        }
        window.location.href = data.confirmation_url;
      } else {
        toast({ title: "Ошибка оплаты", description: data.error || "Попробуйте снова", variant: "destructive" });
        setSubmitting(false);
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось создать платёж", variant: "destructive" });
      setSubmitting(false);
    }
  };

  const hasDocuments =
    settings.olympiad_grani_rules_url ||
    settings.olympiad_grani_diploma_url ||
    settings.olympiad_grani_gratitude_url;

  // --- ЗАГЛУШКА (убрать когда нужно) ---
  const SHOW_STUB = true;
  if (SHOW_STUB) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-3xl font-bold text-violet-700 mb-4">Грани мастерства</h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Приём заявок скоро откроется.<br />Следите за обновлениями!
          </p>
        </div>
      </div>
    );
  }
  // --- КОНЕЦ ЗАГЛУШКИ ---

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white">
      {/* Hero-шапка */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 40%, #8B5CF6 100%)" }}>
        {[
          { w: 160, h: 160, top: "-10%", left: "-5%",  delay: "0s",   dur: "5s"   },
          { w: 90,  h: 90,  top: "55%",  left: "78%",  delay: "1.5s", dur: "6s"   },
          { w: 60,  h: 60,  top: "5%",   left: "85%",  delay: "0.8s", dur: "4.5s" },
          { w: 45,  h: 45,  top: "70%",  left: "12%",  delay: "2s",   dur: "7s"   },
        ].map((c, i) => (
          <div key={i} className="absolute rounded-full bg-white/15 pointer-events-none"
            style={{ width: c.w, height: c.h, top: c.top, left: c.left,
              animation: `floatUpG ${c.dur} ${c.delay} ease-in-out infinite` }} />
        ))}
        <style>{`
          @keyframes floatUpG {
            0%   { transform: translateY(0px) scale(1);      opacity: 0.15; }
            50%  { transform: translateY(-16px) scale(1.07); opacity: 0.25; }
            100% { transform: translateY(0px) scale(1);      opacity: 0.15; }
          }
        `}</style>
        <div className="relative z-10 container mx-auto px-4 md:px-8 pt-8 pb-12 max-w-4xl">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white/80 hover:text-white font-medium mb-8 transition-colors"
          >
            <Icon name="ArrowLeft" size={18} />
            На главную
          </button>
          <div className="text-center">
            <div className="text-7xl mb-4 drop-shadow inline-block animate-bounce" style={{ animationDuration: "2.5s" }}>💎</div>
            <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              ДПИ
            </div>
            <p className="text-white/90 text-xl md:text-3xl font-semibold mb-1">Всероссийская интерактивная олимпиада по ДПИ</p>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white drop-shadow-md">
              «Грани мастерства»
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-4xl">

        {/* Описание + цена */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-6 border border-violet-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="Info" size={20} className="text-violet-500" />
            Об олимпиаде
          </h3>
          <p className="text-gray-600 leading-relaxed text-base">
            {settings.olympiad_grani_description}
          </p>
          <div className="mt-6 flex items-center gap-4 p-4 bg-violet-50 rounded-2xl border border-violet-100">
            <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center flex-shrink-0">
              <Icon name="BadgeRussianRuble" size={22} className="text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Стоимость участия</div>
              <div className="text-2xl font-bold text-violet-600">{price} ₽</div>
            </div>
          </div>
        </div>

        {/* Документы */}
        {hasDocuments && (
          <div className="bg-white rounded-3xl shadow-md p-6 mb-6 border border-violet-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Icon name="FileText" size={18} className="text-violet-500" />
              Документы
            </h3>
            <div className="flex flex-wrap gap-3">
              {settings.olympiad_grani_rules_url && (
                <button
                  onClick={() => openDocument(settings.olympiad_grani_rules_url)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  <Icon name="ScrollText" size={15} />
                  Положение
                </button>
              )}
              {settings.olympiad_grani_diploma_url && (
                <button
                  onClick={() => openDocument(settings.olympiad_grani_diploma_url)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  <Icon name="Award" size={15} />
                  Образец диплома
                </button>
              )}
              {settings.olympiad_grani_gratitude_url && (
                <button
                  onClick={() => openDocument(settings.olympiad_grani_gratitude_url)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 font-semibold rounded-xl text-sm transition-colors"
                >
                  <Icon name="Heart" size={15} />
                  Благодарственное письмо
                </button>
              )}
            </div>
          </div>
        )}

        {/* Восстановление доступа */}
        <div className="rounded-3xl shadow-md mb-6 border-2 border-violet-300 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-11 h-11 bg-violet-500 rounded-2xl flex items-center justify-center shadow-sm">
                <Icon name="KeyRound" size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 mb-1">Уже оплатили участие?</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Если вы оплатили, но случайно закрыли окно с заданиями — введите email, который указывали при регистрации, и мы найдём ваши задания.
                </p>
              </div>
            </div>

            <div className="mt-4 bg-white/70 rounded-2xl px-4 py-3 border border-violet-200">
              {recoveredLinks === null || recoveredLinks.length === 0 ? (
                <form onSubmit={handleRecover} className="flex gap-2">
                  <input
                    type="email"
                    value={recoverEmail}
                    onChange={e => setRecoverEmail(e.target.value)}
                    placeholder="Ваш email, указанный при оплате"
                    required
                    className="flex-1 border border-violet-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                  />
                  <button
                    type="submit"
                    disabled={recovering}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60 whitespace-nowrap shadow-sm"
                  >
                    {recovering ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Search" size={15} />}
                    Найти задания
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-semibold flex items-center gap-1.5">
                    <Icon name="CheckCircle" size={15} className="text-green-500" />
                    Найдено участников: {recoveredLinks.length}
                  </p>
                  {recoveredLinks.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 bg-white border border-violet-100 rounded-xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon name="User" size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-800 truncate">{item.full_name}</span>
                      </div>
                      <a
                        href={item.task_url}
                        className="flex items-center gap-1.5 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-bold rounded-lg transition-colors whitespace-nowrap shadow-sm"
                      >
                        <Icon name="PlayCircle" size={14} />
                        Перейти к заданиям
                      </a>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setRecoveredLinks(null); setRecoverEmail(""); }}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Искать по другому email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Форма заявки */}
        <div className="bg-white rounded-3xl shadow-md p-8 border border-violet-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Icon name="ClipboardList" size={24} className="text-violet-500" />
            Заявка на участие
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Заполните форму и перейдите к оплате. После подтверждения платежа вы получите доступ к заданиям олимпиады.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ФИО */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ФИО участника <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="Иванова Мария Петровна"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm"
              />
            </div>

            {/* Возраст + Год обучения */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Возраст <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  required
                  min={5}
                  max={20}
                  placeholder="10"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Год обучения <span className="text-red-400">*</span>
                </label>
                <select
                  name="studyYear"
                  value={form.studyYear}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm bg-white"
                >
                  <option value="">Выберите год</option>
                  {STUDY_YEARS.map((y) => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Педагог */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                ФИО педагога
              </label>
              <input
                type="text"
                name="teacher"
                value={form.teacher}
                onChange={handleChange}
                placeholder="Петрова Елена Сергеевна"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm"
              />
            </div>

            {/* Учреждение */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Образовательное учреждение
              </label>
              <input
                type="text"
                name="institution"
                value={form.institution}
                onChange={handleChange}
                placeholder="МБУ ДО «Детская школа искусств»"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="mail@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1.5">На этот email придёт ссылка на задания после оплаты</p>
            </div>

            {/* Согласие */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 accent-violet-500 flex-shrink-0"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                Я даю согласие на обработку персональных данных и принимаю условия участия в олимпиаде
              </span>
            </label>

            {/* Кнопка */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-violet-200 hover:shadow-violet-300"
              >
                {submitting ? (
                  <>
                    <Icon name="Loader2" size={22} className="animate-spin" />
                    Переход к оплате...
                  </>
                ) : (
                  <>
                    <Icon name="CreditCard" size={22} />
                    Оплатить участие — {price} ₽
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Безопасная оплата через ЮKassa
              </p>
            </div>
          </form>
        </div>
      </div>

      <PdfModal isPdfModalOpen={isPdfModalOpen} setIsPdfModalOpen={setIsPdfModalOpen} pdfUrl={pdfUrl} />
      <ImageModal isImageModalOpen={isImageModalOpen} setIsImageModalOpen={setIsImageModalOpen} imagePreview={imagePreview} />
    </div>
  );
}