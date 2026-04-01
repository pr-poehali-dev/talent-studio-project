import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
const PAYMENT_API_URL = "https://functions.poehali.dev/f40bd7c6-a503-4165-8673-e8091832d07c";

interface OlympiadSettings {
  olympiad_palette_price: string;
  olympiad_palette_description: string;
  olympiad_palette_rules_url: string;
  olympiad_palette_diploma_url: string;
  olympiad_palette_gratitude_url: string;
}

const STUDY_YEARS = Array.from({ length: 9 }, (_, i) => i + 1);

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [isImageFile, setIsImageFile] = useState(true);

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
      const applicationData = {
        full_name: form.fullName,
        age: parseInt(form.age),
        study_year: parseInt(form.studyYear),
        teacher: form.teacher || null,
        institution: form.institution || null,
        work_title: form.workTitle,
        email: form.email,
        olympiad_type: "palette",
      };

      const response = await fetch(PAYMENT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          description: `Олимпиада по ИЗО «Палитра талантов» — ${form.fullName}`,
          email: form.email,
          application_data: applicationData,
          olympiad_type: "palette",
        }),
      });

      const data = await response.json();
      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        throw new Error(data.error || "Ошибка создания платежа");
      }
    } catch (err: unknown) {
      toast({
        title: "Ошибка",
        description: err instanceof Error ? err.message : "Не удалось отправить заявку",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hasDocuments =
    settings.olympiad_palette_rules_url ||
    settings.olympiad_palette_diploma_url ||
    settings.olympiad_palette_gratitude_url;

  const isImage = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);

  const openPreview = (url: string, title: string) => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setIsImageFile(isImage(url));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 md:px-8 py-10 max-w-4xl">

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-8 transition-colors"
        >
          <Icon name="ArrowLeft" size={18} />
          На главную
        </button>

        {/* Заголовок */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎨</div>
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            ИЗО
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-800 mb-2">
            Всероссийская интерактивная олимпиада по ИЗО
          </h1>
          <h2 className="text-xl md:text-2xl font-heading font-bold text-orange-500">
            «Палитра талантов»
          </h2>
        </div>

        {/* Описание + цена */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-6 border border-orange-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="Info" size={20} className="text-orange-400" />
            Об олимпиаде
          </h3>
          <p className="text-gray-600 leading-relaxed text-base">
            {settings.olympiad_palette_description}
          </p>
          <div className="mt-6 flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Icon name="CreditCard" size={22} className="text-orange-500" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Стоимость участия</div>
              <div className="text-2xl font-bold text-orange-500">{price} ₽</div>
            </div>
          </div>
        </div>

        {/* Документы */}
        {hasDocuments && (
          <div className="bg-white rounded-3xl shadow-md p-8 mb-6 border border-orange-100">
            <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Icon name="FileText" size={20} className="text-orange-400" />
              Документы
            </h3>
            <div className="flex flex-wrap gap-4">
              {/* Положение — просто ссылка */}
              {settings.olympiad_palette_rules_url && (
                <a
                  href={settings.olympiad_palette_rules_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-2xl transition-colors text-orange-700 font-medium text-sm"
                >
                  <Icon name="FileText" size={16} className="text-orange-400" />
                  Положение об олимпиаде
                </a>
              )}

              {/* Образец диплома — превью */}
              {settings.olympiad_palette_diploma_url && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPreview(settings.olympiad_palette_diploma_url, "Образец диплома")}
                    className="group relative w-36 h-48 rounded-2xl border-2 border-orange-200 overflow-hidden bg-orange-50 hover:border-orange-400 hover:shadow-lg transition-all duration-200 cursor-zoom-in"
                  >
                    {isImage(settings.olympiad_palette_diploma_url) ? (
                      <img
                        src={settings.olympiad_palette_diploma_url}
                        alt="Образец диплома"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-orange-400">
                        <Icon name="Award" size={36} />
                        <span className="text-xs font-medium text-orange-500">Просмотреть</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2 shadow">
                        <Icon name="ZoomIn" size={18} className="text-orange-500" />
                      </div>
                    </div>
                  </button>
                  <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                    <Icon name="Award" size={13} className="text-orange-400" />
                    Образец диплома
                  </span>
                </div>
              )}

              {/* Образец благодарственного письма — превью */}
              {settings.olympiad_palette_gratitude_url && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPreview(settings.olympiad_palette_gratitude_url, "Образец благодарственного письма")}
                    className="group relative w-36 h-48 rounded-2xl border-2 border-orange-200 overflow-hidden bg-orange-50 hover:border-orange-400 hover:shadow-lg transition-all duration-200 cursor-zoom-in"
                  >
                    {isImage(settings.olympiad_palette_gratitude_url) ? (
                      <img
                        src={settings.olympiad_palette_gratitude_url}
                        alt="Образец благодарственного письма"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-orange-400">
                        <Icon name="Mail" size={36} />
                        <span className="text-xs font-medium text-orange-500">Просмотреть</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2 shadow">
                        <Icon name="ZoomIn" size={18} className="text-orange-500" />
                      </div>
                    </div>
                  </button>
                  <span className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                    <Icon name="Mail" size={13} className="text-orange-400" />
                    Образец письма
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Модальное окно для просмотра образцов */}
        <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
          <DialogContent className="sm:max-w-[90vw] max-h-[92vh] p-0 overflow-hidden rounded-3xl bg-black/95 border-none">
            <div className="relative w-full h-full flex flex-col">
              {/* Шапка модалки */}
              <div className="flex items-center justify-between px-6 py-4 bg-black/80">
                <span className="text-white font-semibold text-base">{previewTitle}</span>
                <div className="flex items-center gap-3">
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
                    >
                      <Icon name="ExternalLink" size={15} />
                      Открыть
                    </a>
                  )}
                </div>
              </div>
              {/* Содержимое */}
              <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                {isImageFile ? (
                  <img
                    src={previewUrl || ""}
                    alt={previewTitle}
                    className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl"
                  />
                ) : (
                  <iframe
                    src={previewUrl || ""}
                    title={previewTitle}
                    className="w-full rounded-xl"
                    style={{ height: "78vh" }}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Форма заявки */}
        <div className="bg-white rounded-3xl shadow-md p-8 border border-orange-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Icon name="ClipboardList" size={22} className="text-orange-400" />
            Принять участие
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  ФИО участника <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Иванова Мария Петровна"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Возраст <span className="text-orange-500">*</span>
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Год обучения (класс) <span className="text-orange-500">*</span>
                </label>
                <select
                  name="studyYear"
                  value={form.studyYear}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition bg-white"
                >
                  <option value="">Выберите класс</option>
                  {STUDY_YEARS.map((y) => (
                    <option key={y} value={y}>{y} класс</option>
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
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
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Название работы <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  name="workTitle"
                  value={form.workTitle}
                  onChange={handleChange}
                  required
                  placeholder="Натюрморт с яблоками"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Электронная почта <span className="text-orange-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="example@mail.ru"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
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
                className="mt-1 w-4 h-4 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                Я принимаю условия участия в олимпиаде и даю согласие на обработку персональных данных
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-lg py-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-orange-200"
            >
              {submitting ? (
                <>
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  Перенаправление на оплату...
                </>
              ) : (
                <>
                  <Icon name="CreditCard" size={20} />
                  Оплатить участие — {price} ₽
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}