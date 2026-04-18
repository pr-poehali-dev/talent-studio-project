import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import PdfModal from "@/components/index-page/modals/PdfModal";
import ImageModal from "@/components/index-page/modals/ImageModal";

const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
const PAYMENT_API_URL = "https://functions.poehali.dev/f40bd7c6-a503-4165-8673-e8091832d07c";

interface OlympiadSettings {
  olympiad_palette_price: string;
  olympiad_palette_description: string;
  olympiad_palette_rules_url: string;
  olympiad_palette_diploma_url: string;
  olympiad_palette_gratitude_url: string;
}

const STUDY_YEARS = Array.from({ length: 9 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}-й год обучения`,
}));

export default function PaletteOlympiad() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState<OlympiadSettings>({
    olympiad_palette_price: "300",
    olympiad_palette_description: "Всероссийская интерактивная олимпиада по ИЗО для учащихся 1–9 классов.",
    olympiad_palette_rules_url: "",
    olympiad_palette_diploma_url: "",
    olympiad_palette_gratitude_url: "",
  });

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    studyYear: "",
    teacher: "",
    institution: "",
    workTitle: "",
    email: "",
    terms: false,
  });

  const [submitting, setSubmitting] = useState(false);

  // Модальные окна для документов
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

  const price = parseInt(settings.olympiad_palette_price) || 300;

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: settings.olympiad_palette_price,
          description: `Олимпиада по ИЗО — ${form.fullName}`,
          email: form.email,
          olympiad_type: 'izo',
          origin: window.location.origin,
          application_data: {
            full_name: form.fullName,
            age: parseInt(form.age),
            study_year: parseInt(form.studyYear),
            teacher: form.teacher || null,
            institution: form.institution || null,
            work_title: form.workTitle,
            email: form.email,
            olympiad_type: 'izo',
          },
        }),
      });
      const data = await res.json();
      if (data.confirmation_url) {
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
    settings.olympiad_palette_rules_url ||
    settings.olympiad_palette_diploma_url ||
    settings.olympiad_palette_gratitude_url;

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime-50 to-white">
      {/* Hero-шапка */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #84CC16 0%, #65A30D 40%, #A3E635 100%)" }}>
        {[
          { w: 160, h: 160, top: "-10%", left: "-5%", delay: "0s",   dur: "5s" },
          { w: 90,  h: 90,  top: "55%",  left: "78%", delay: "1.5s", dur: "6s" },
          { w: 60,  h: 60,  top: "5%",   left: "85%", delay: "0.8s", dur: "4.5s" },
          { w: 45,  h: 45,  top: "70%",  left: "12%", delay: "2s",   dur: "7s" },
        ].map((c, i) => (
          <div key={i} className="absolute rounded-full bg-white/15 pointer-events-none"
            style={{ width: c.w, height: c.h, top: c.top, left: c.left,
              animation: `floatUp ${c.dur} ${c.delay} ease-in-out infinite` }} />
        ))}
        <style>{`
          @keyframes floatUp {
            0%   { transform: translateY(0px) scale(1);    opacity: 0.15; }
            50%  { transform: translateY(-16px) scale(1.07); opacity: 0.25; }
            100% { transform: translateY(0px) scale(1);    opacity: 0.15; }
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
            <div className="text-7xl mb-4 drop-shadow inline-block animate-bounce" style={{ animationDuration: "2.5s" }}>🎨</div>
            <div className="inline-flex items-center gap-1.5 bg-white/25 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              ИЗО
            </div>
            <p className="text-white/90 text-xl md:text-3xl font-semibold mb-1">Всероссийская интерактивная олимпиада по ИЗО</p>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white drop-shadow-md">
              «Палитра талантов»
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-10 max-w-4xl">

        {/* Описание + цена */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-6 border border-lime-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="Info" size={20} className="text-lime-500" />
            Об олимпиаде
          </h3>
          <p className="text-gray-600 leading-relaxed text-base">
            {settings.olympiad_palette_description}
          </p>
          <div className="mt-6 flex items-center gap-4 p-4 bg-lime-50 rounded-2xl border border-lime-100">
            <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center flex-shrink-0">
              <Icon name="CreditCard" size={22} className="text-lime-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Стоимость участия</div>
              <div className="text-2xl font-bold text-lime-600">{price} ₽</div>
            </div>
          </div>
        </div>

        {/* Документы */}
        {hasDocuments && (
          <div className="bg-white rounded-3xl shadow-md p-8 mb-6 border border-lime-100">
            <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Icon name="FileText" size={20} className="text-lime-500" />
              Документы
            </h3>
            <div className="flex flex-wrap gap-3">
              {settings.olympiad_palette_rules_url && (
                <button
                  onClick={() => openDocument(settings.olympiad_palette_rules_url)}
                  className="flex items-center gap-2 px-5 py-3 bg-lime-50 hover:bg-lime-100 border border-lime-200 rounded-2xl transition-colors text-lime-700 font-medium text-sm"
                >
                  <Icon name="FileText" size={16} className="text-lime-500" />
                  Положение об олимпиаде
                </button>
              )}
              {settings.olympiad_palette_diploma_url && (
                <button
                  onClick={() => openDocument(settings.olympiad_palette_diploma_url)}
                  className="flex items-center gap-2 px-5 py-3 bg-lime-50 hover:bg-lime-100 border border-lime-200 rounded-2xl transition-colors text-lime-700 font-medium text-sm"
                >
                  <Icon name="Award" size={16} className="text-lime-500" />
                  Образец диплома
                </button>
              )}
              {settings.olympiad_palette_gratitude_url && (
                <button
                  onClick={() => openDocument(settings.olympiad_palette_gratitude_url)}
                  className="flex items-center gap-2 px-5 py-3 bg-lime-50 hover:bg-lime-100 border border-lime-200 rounded-2xl transition-colors text-lime-700 font-medium text-sm"
                >
                  <Icon name="Mail" size={16} className="text-lime-500" />
                  Образец благодарственного письма
                </button>
              )}
            </div>
          </div>
        )}

        {/* Форма заявки */}
        <div className="bg-white rounded-3xl shadow-md p-8 border border-lime-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Icon name="ClipboardList" size={22} className="text-lime-500" />
            Принять участие
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ФИО участника <span className="text-lime-600">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Иванова Мария Петровна"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Возраст <span className="text-lime-600">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  required
                  min={5}
                  max={20}
                  placeholder="12"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Год обучения:</label>
                <select
                  name="studyYear"
                  value={form.studyYear}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 transition bg-white"
                >
                  <option value="">Выберите год обучения</option>
                  {STUDY_YEARS.map((y) => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ФИО педагога
                </label>
                <input
                  type="text"
                  name="teacher"
                  value={form.teacher}
                  onChange={handleChange}
                  placeholder="Петрова Анна Владимировна"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Учреждение, город, страна
                </label>
                <input
                  type="text"
                  name="institution"
                  value={form.institution}
                  onChange={handleChange}
                  placeholder="МБОУ СОШ №5, Пермь, Россия"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Электронная почта <span className="text-lime-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="example@mail.ru"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100 transition"
                />
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 accent-lime-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                Я принимаю условия участия в олимпиаде и даю согласие на обработку персональных данных
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 disabled:opacity-60 text-white font-bold text-lg py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-lime-200"
              style={{ background: "linear-gradient(135deg, #84CC16 0%, #65A30D 100%)" }}
            >
              {submitting ? (
                <>
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  Перенаправление на оплату...
                </>
              ) : (
                <>
                  <Icon name="CreditCard" size={20} />
                  Оплатить и приступить к выполнению задания — {price} ₽
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Модальные окна для документов */}
      <PdfModal
        isPdfModalOpen={isPdfModalOpen}
        setIsPdfModalOpen={setIsPdfModalOpen}
        pdfUrl={pdfUrl}
      />
      <ImageModal
        isImageModalOpen={isImageModalOpen}
        setIsImageModalOpen={setIsImageModalOpen}
        imagePreview={imagePreview}
      />
    </div>
  );
}