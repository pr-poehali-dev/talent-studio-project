import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

const OLYMPIAD_APPLICATIONS_URL = "https://functions.poehali.dev/64be6370-4826-4077-bfeb-ce5e443733b7";
const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";

interface OlympiadApplication {
  id: number;
  full_name: string;
  age: number;
  study_year: number;
  teacher: string | null;
  institution: string | null;
  work_title: string;
  email: string;
  olympiad_type: string;
  status: string;
  payment_status: string;
  created_at: string;
  deleted_at: string | null;
}

interface Settings {
  olympiad_palette_price: string;
  olympiad_palette_description: string;
  olympiad_palette_rules_url: string;
  olympiad_palette_diploma_url: string;
  olympiad_palette_gratitude_url: string;
}

type SubTab = "applications" | "settings";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  viewed: "Просмотрена",
  sent: "Отправлена",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  viewed: "bg-yellow-100 text-yellow-700",
  sent: "bg-green-100 text-green-700",
};

const AdminOlympiadsTab = () => {
  const { toast } = useToast();
  const [subTab, setSubTab] = useState<SubTab>("applications");
  const [applications, setApplications] = useState<OlympiadApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    olympiad_palette_price: "",
    olympiad_palette_description: "",
    olympiad_palette_rules_url: "",
    olympiad_palette_diploma_url: "",
    olympiad_palette_gratitude_url: "",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingRules, setUploadingRules] = useState(false);
  const [uploadingDiploma, setUploadingDiploma] = useState(false);
  const [uploadingGratitude, setUploadingGratitude] = useState(false);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${OLYMPIAD_APPLICATIONS_URL}?type=palette`);
      const data = await res.json();
      setApplications(data);
    } catch {
      toast({ title: "Ошибка загрузки заявок", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(SETTINGS_API_URL);
      const data = await res.json();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadApplications();
    loadSettings();
  }, [loadApplications, loadSettings]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(OLYMPIAD_APPLICATIONS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch {
      toast({ title: "Ошибка обновления статуса", variant: "destructive" });
    }
  };

  const deleteApplication = async (id: number) => {
    if (!confirm("Удалить заявку?")) return;
    try {
      await fetch(OLYMPIAD_APPLICATIONS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      setApplications((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Заявка удалена" });
    } catch {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  const saveSetting = async (key: string, value: string) => {
    await fetch(SETTINGS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await Promise.all([
        saveSetting("olympiad_palette_price", settings.olympiad_palette_price),
        saveSetting("olympiad_palette_description", settings.olympiad_palette_description),
        saveSetting("olympiad_palette_rules_url", settings.olympiad_palette_rules_url),
        saveSetting("olympiad_palette_diploma_url", settings.olympiad_palette_diploma_url),
        saveSetting("olympiad_palette_gratitude_url", settings.olympiad_palette_gratitude_url),
      ]);
      toast({ title: "Настройки сохранены" });
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSavingSettings(false);
    }
  };

  const uploadFile = async (
    file: File,
    setKey: keyof Settings,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(UPLOAD_URL, { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setSettings((prev) => ({ ...prev, [setKey]: data.url }));
      }
    } catch {
      toast({ title: "Ошибка загрузки файла", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Заголовок + подвкладки */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Олимпиада «Палитра талантов»</h2>
          <p className="text-gray-500 text-sm mt-1">Управление заявками и настройками олимпиады по ИЗО</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4">
        <button
          onClick={() => setSubTab("applications")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            subTab === "applications"
              ? "bg-orange-500 text-white shadow"
              : "text-gray-600 hover:bg-orange-50"
          }`}
        >
          <Icon name="ClipboardList" size={16} />
          Заявки
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${subTab === "applications" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {applications.length}
          </span>
        </button>
        <button
          onClick={() => setSubTab("settings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            subTab === "settings"
              ? "bg-orange-500 text-white shadow"
              : "text-gray-600 hover:bg-orange-50"
          }`}
        >
          <Icon name="Settings" size={16} />
          Настройки
        </button>
      </div>

      {/* Список заявок */}
      {subTab === "applications" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={loadApplications}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
            >
              <Icon name="RefreshCw" size={14} />
              Обновить
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" />
              Загрузка...
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Icon name="ClipboardList" size={40} className="mx-auto mb-3 opacity-30" />
              <p>Заявок пока нет</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-bold text-gray-800">{app.full_name}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABELS[app.status] || app.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(app.created_at).toLocaleDateString("ru-RU")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-600">
                        <div><span className="text-gray-400">Возраст:</span> {app.age}</div>
                        <div><span className="text-gray-400">Класс:</span> {app.study_year}</div>
                        <div><span className="text-gray-400">Работа:</span> {app.work_title}</div>
                        <div><span className="text-gray-400">Email:</span> {app.email}</div>
                        {app.teacher && <div><span className="text-gray-400">Педагог:</span> {app.teacher}</div>}
                        {app.institution && <div className="col-span-2"><span className="text-gray-400">Учреждение:</span> {app.institution}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-orange-400"
                      >
                        <option value="new">Новая</option>
                        <option value="viewed">Просмотрена</option>
                        <option value="sent">Отправлена</option>
                      </select>
                      <button
                        onClick={() => deleteApplication(app.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Настройки */}
      {subTab === "settings" && (
        <div className="max-w-2xl space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Стоимость участия (₽)
            </label>
            <input
              type="number"
              value={settings.olympiad_palette_price}
              onChange={(e) => setSettings((p) => ({ ...p, olympiad_palette_price: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400"
              placeholder="300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Описание олимпиады
            </label>
            <textarea
              value={settings.olympiad_palette_description}
              onChange={(e) => setSettings((p) => ({ ...p, olympiad_palette_description: e.target.value }))}
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 resize-none"
              placeholder="Описание олимпиады..."
            />
          </div>

          {/* Положение */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ссылка на положение
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.olympiad_palette_rules_url}
                onChange={(e) => setSettings((p) => ({ ...p, olympiad_palette_rules_url: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-sm"
                placeholder="https://..."
              />
              <label className="flex items-center gap-1.5 px-4 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl cursor-pointer text-orange-700 text-sm font-medium transition whitespace-nowrap">
                {uploadingRules ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Upload" size={14} />}
                Загрузить
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f, "olympiad_palette_rules_url", setUploadingRules);
                }} />
              </label>
            </div>
          </div>

          {/* Образец диплома */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ссылка на образец диплома
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.olympiad_palette_diploma_url}
                onChange={(e) => setSettings((p) => ({ ...p, olympiad_palette_diploma_url: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-sm"
                placeholder="https://..."
              />
              <label className="flex items-center gap-1.5 px-4 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl cursor-pointer text-orange-700 text-sm font-medium transition whitespace-nowrap">
                {uploadingDiploma ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Upload" size={14} />}
                Загрузить
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f, "olympiad_palette_diploma_url", setUploadingDiploma);
                }} />
              </label>
            </div>
          </div>

          {/* Благодарственное письмо */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Ссылка на образец благодарственного письма
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings.olympiad_palette_gratitude_url}
                onChange={(e) => setSettings((p) => ({ ...p, olympiad_palette_gratitude_url: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-sm"
                placeholder="https://..."
              />
              <label className="flex items-center gap-1.5 px-4 py-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl cursor-pointer text-orange-700 text-sm font-medium transition whitespace-nowrap">
                {uploadingGratitude ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Upload" size={14} />}
                Загрузить
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f, "olympiad_palette_gratitude_url", setUploadingGratitude);
                }} />
              </label>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-60"
          >
            {savingSettings ? <Icon name="Loader2" size={16} className="animate-spin" /> : <Icon name="Save" size={16} />}
            Сохранить настройки
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOlympiadsTab;