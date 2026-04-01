import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

const OLYMPIAD_APPLICATIONS_URL = "https://functions.poehali.dev/64be6370-4826-4077-bfeb-ce5e443733b7";
const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
const TASKS_API_URL = "https://functions.poehali.dev/c7eb02a5-bcf1-4ece-91de-d49b4c1e8466";

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

interface OlympiadTask {
  id: number;
  olympiad_type: string;
  title: string;
  description: string;
  question: string;
  image_url: string | null;
  options: string[] | null;
  correct_answer: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const EMPTY_TASK: Omit<OlympiadTask, "id" | "created_at" | "updated_at"> = {
  olympiad_type: "palette",
  title: "",
  description: "",
  question: "",
  image_url: "",
  options: ["", "", "", ""],
  correct_answer: "",
  sort_order: 0,
  is_active: true,
};

type SubTab = "applications" | "tasks" | "settings";

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

  // Tasks state
  const [tasks, setTasks] = useState<OlympiadTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<OlympiadTask | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [taskForm, setTaskForm] = useState<typeof EMPTY_TASK>({ ...EMPTY_TASK });
  const [savingTask, setSavingTask] = useState(false);
  const [uploadingTaskImage, setUploadingTaskImage] = useState(false);

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

  const loadTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const res = await fetch(`${TASKS_API_URL}?type=palette&admin=true`);
      const data = await res.json();
      setTasks(data);
    } catch {
      toast({ title: "Ошибка загрузки заданий", variant: "destructive" });
    } finally {
      setTasksLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadApplications();
    loadSettings();
  }, [loadApplications, loadSettings]);

  useEffect(() => {
    if (subTab === "tasks") {
      loadTasks();
    }
  }, [subTab, loadTasks]);

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
    setLoadingFn: (v: boolean) => void
  ) => {
    setLoadingFn(true);
    try {
      const CHUNK_SIZE = 512 * 1024;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadId = crypto.randomUUID();

      const toBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

      let resultUrl = "";
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const chunkBase64 = await toBase64(chunk);

        const res = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chunk: chunkBase64,
            chunkIndex: i,
            totalChunks,
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            folder: "olympiad-docs",
            uploadId,
          }),
        });
        const data = await res.json();
        if (data.url) {
          resultUrl = data.url;
        }
      }

      if (resultUrl) {
        setSettings((prev) => ({ ...prev, [setKey]: resultUrl }));
      } else {
        toast({ title: "Ошибка загрузки файла: URL не получен", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка загрузки файла", variant: "destructive" });
    } finally {
      setLoadingFn(false);
    }
  };

  // ---- Task form helpers ----

  const uploadTaskImage = async (file: File) => {
    setUploadingTaskImage(true);
    try {
      const CHUNK_SIZE = 512 * 1024;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadId = crypto.randomUUID();
      const toBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

      let resultUrl = "";
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBase64 = await toBase64(file.slice(start, end));
        const res = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chunk: chunkBase64,
            chunkIndex: i,
            totalChunks,
            fileName: file.name,
            fileType: file.type || "image/jpeg",
            folder: "olympiad-tasks",
            uploadId,
          }),
        });
        const data = await res.json();
        if (data.url) resultUrl = data.url;
      }
      if (resultUrl) {
        setTaskForm((prev) => ({ ...prev, image_url: resultUrl }));
        toast({ title: "Изображение загружено" });
      }
    } catch {
      toast({ title: "Ошибка загрузки изображения", variant: "destructive" });
    } finally {
      setUploadingTaskImage(false);
    }
  };

  const openCreateTask = () => {
    setTaskForm({ ...EMPTY_TASK });
    setEditingTask(null);
    setIsCreating(true);
  };

  const openEditTask = (task: OlympiadTask) => {
    setEditingTask(task);
    setIsCreating(false);
    setTaskForm({
      olympiad_type: task.olympiad_type,
      title: task.title,
      description: task.description || "",
      question: task.question,
      image_url: task.image_url || "",
      options: task.options ? [...task.options] : ["", "", "", ""],
      correct_answer: task.correct_answer || "",
      sort_order: task.sort_order,
      is_active: task.is_active,
    });
  };

  const closeTaskForm = () => {
    setIsCreating(false);
    setEditingTask(null);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title.trim() || !taskForm.question.trim()) {
      toast({ title: "Заполните название и текст вопроса", variant: "destructive" });
      return;
    }
    setSavingTask(true);
    try {
      const filteredOptions = taskForm.options?.filter((o) => o.trim()) || null;
      const payload = {
        ...taskForm,
        options: filteredOptions && filteredOptions.length > 0 ? filteredOptions : null,
        ...(editingTask ? { id: editingTask.id } : {}),
      };

      const res = await fetch(TASKS_API_URL, {
        method: editingTask ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success && !data.id) throw new Error("Ошибка сохранения");

      toast({ title: editingTask ? "Задание обновлено" : "Задание создано" });
      closeTaskForm();
      loadTasks();
    } catch {
      toast({ title: "Ошибка сохранения задания", variant: "destructive" });
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm("Удалить задание?")) return;
    try {
      await fetch(TASKS_API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Задание удалено" });
    } catch {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  const handleToggleActive = async (task: OlympiadTask) => {
    try {
      await fetch(TASKS_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, is_active: !task.is_active }),
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, is_active: !task.is_active } : t))
      );
    } catch {
      toast({ title: "Ошибка обновления", variant: "destructive" });
    }
  };

  const updateOption = (index: number, value: string) => {
    setTaskForm((prev) => {
      const opts = [...(prev.options || ["", "", "", ""])];
      opts[index] = value;
      return { ...prev, options: opts };
    });
  };

  const addOption = () => {
    setTaskForm((prev) => ({
      ...prev,
      options: [...(prev.options || []), ""],
    }));
  };

  const removeOption = (index: number) => {
    setTaskForm((prev) => {
      const opts = [...(prev.options || [])];
      opts.splice(index, 1);
      return { ...prev, options: opts };
    });
  };

  return (
    <div className="p-6">
      {/* Заголовок + подвкладки */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Олимпиада «Палитра талантов»</h2>
          <p className="text-gray-500 text-sm mt-1">Управление заявками, заданиями и настройками</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4 flex-wrap">
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
          onClick={() => setSubTab("tasks")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            subTab === "tasks"
              ? "bg-orange-500 text-white shadow"
              : "text-gray-600 hover:bg-orange-50"
          }`}
        >
          <Icon name="BookOpen" size={16} />
          Задания теста
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${subTab === "tasks" ? "bg-white/20 text-white" : "bg-orange-100 text-orange-600"}`}>
            {tasks.length}
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

      {/* ===== Задания ===== */}
      {subTab === "tasks" && (
        <>
          {/* Форма создания/редактирования */}
          {(isCreating || editingTask) && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Icon name={isCreating ? "PlusCircle" : "Pencil"} size={18} className="text-orange-500" />
                {isCreating ? "Новое задание" : "Редактировать задание"}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Название задания <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Например: Задание 1 — Цветовой круг"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Порядок (сортировка)
                    </label>
                    <input
                      type="number"
                      value={taskForm.sort_order}
                      onChange={(e) => setTaskForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Краткое описание (необязательно)
                  </label>
                  <input
                    type="text"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Пояснение к заданию..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Вопрос / Текст задания <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={taskForm.question}
                    onChange={(e) => setTaskForm((p) => ({ ...p, question: e.target.value }))}
                    rows={3}
                    placeholder="Текст вопроса или задания..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm resize-none"
                  />
                </div>

                {/* Изображение */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Изображение к заданию (необязательно)
                  </label>
                  <div className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={taskForm.image_url || ""}
                      onChange={(e) => setTaskForm((p) => ({ ...p, image_url: e.target.value }))}
                      placeholder="https://... или загрузите файл"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm"
                    />
                    <label className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-orange-50 border border-orange-200 rounded-xl cursor-pointer text-orange-700 text-sm font-medium transition whitespace-nowrap">
                      {uploadingTaskImage ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Upload" size={14} />}
                      Загрузить
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadTaskImage(f);
                        }}
                      />
                    </label>
                  </div>
                  {taskForm.image_url && (
                    <img
                      src={taskForm.image_url}
                      alt="preview"
                      className="mt-2 max-h-32 rounded-xl border border-orange-100 object-contain"
                    />
                  )}
                </div>

                {/* Варианты ответа */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Варианты ответа (необязательно)
                  </label>
                  <div className="space-y-2">
                    {(taskForm.options || []).map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400 w-5 text-center">{idx + 1}.</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Вариант ${idx + 1}`}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 text-sm"
                        />
                        <button
                          onClick={() => removeOption(idx)}
                          className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addOption}
                      className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium mt-1"
                    >
                      <Icon name="Plus" size={14} /> Добавить вариант
                    </button>
                  </div>
                </div>

                {/* Правильный ответ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Правильный ответ (не отображается участникам)
                  </label>
                  <input
                    type="text"
                    value={taskForm.correct_answer || ""}
                    onChange={(e) => setTaskForm((p) => ({ ...p, correct_answer: e.target.value }))}
                    placeholder="Например: 2 или текст ответа"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taskForm.is_active}
                      onChange={(e) => setTaskForm((p) => ({ ...p, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Задание активно (показывать участникам)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveTask}
                  disabled={savingTask}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                >
                  {savingTask ? <Icon name="Loader2" size={15} className="animate-spin" /> : <Icon name="Save" size={15} />}
                  {editingTask ? "Сохранить изменения" : "Создать задание"}
                </button>
                <button
                  onClick={closeTaskForm}
                  className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold text-sm transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* Список заданий */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Задания отображаются участникам после успешной оплаты
            </p>
            <div className="flex gap-2">
              <button
                onClick={loadTasks}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
              >
                <Icon name="RefreshCw" size={14} />
                Обновить
              </button>
              {!isCreating && !editingTask && (
                <button
                  onClick={openCreateTask}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-all"
                >
                  <Icon name="Plus" size={15} />
                  Добавить задание
                </button>
              )}
            </div>
          </div>

          {tasksLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Icon name="Loader2" size={24} className="animate-spin mr-2" />
              Загрузка...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Icon name="BookOpen" size={40} className="mx-auto mb-3 opacity-30" />
              <p className="mb-4">Заданий пока нет</p>
              <button
                onClick={openCreateTask}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm"
              >
                <Icon name="Plus" size={15} /> Создать первое задание
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                    task.is_active ? "border-gray-100 hover:shadow-md" : "border-gray-100 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-xs text-gray-400 font-mono">#{task.sort_order}</span>
                        <span className="font-bold text-gray-800">{task.title}</span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            task.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {task.is_active ? "Активно" : "Скрыто"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{task.question}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {task.options && task.options.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Icon name="List" size={12} />
                            {task.options.length} вариантов
                          </span>
                        )}
                        {task.image_url && (
                          <span className="flex items-center gap-1">
                            <Icon name="Image" size={12} />
                            Есть изображение
                          </span>
                        )}
                        {task.correct_answer && (
                          <span className="flex items-center gap-1">
                            <Icon name="CheckCircle" size={12} className="text-green-400" />
                            Ответ задан
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(task)}
                        title={task.is_active ? "Скрыть" : "Показать"}
                        className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                      >
                        <Icon name={task.is_active ? "EyeOff" : "Eye"} size={15} />
                      </button>
                      <button
                        onClick={() => openEditTask(task)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Icon name="Pencil" size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Icon name="Trash2" size={15} />
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
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold transition-all disabled:opacity-60"
          >
            {savingSettings ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <Icon name="Save" size={16} />
            )}
            Сохранить настройки
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOlympiadsTab;
