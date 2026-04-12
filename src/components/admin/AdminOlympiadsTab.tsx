import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import AdminWordSearchTab from "@/components/admin/AdminWordSearchTab";

const OLYMPIAD_APPLICATIONS_URL = "https://functions.poehali.dev/64be6370-4826-4077-bfeb-ce5e443733b7";
const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
const TASKS_API_URL = "https://functions.poehali.dev/c7eb02a5-bcf1-4ece-91de-d49b4c1e8466";
const ANSWERS_API_URL = "https://functions.poehali.dev/6e919c14-0327-44c1-827b-d524f0192c73";
const REPORT_API_URL = "https://functions.poehali.dev/05b86dce-b0ed-493e-9260-00ca25fd4059";

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
  payment_id: string | null;
  olympiad_status: string;
  task_url: string | null;
}

interface Settings {
  olympiad_palette_price: string;
  olympiad_palette_description: string;
  olympiad_palette_rules_url: string;
  olympiad_palette_diploma_url: string;
  olympiad_palette_gratitude_url: string;
}

const STUDY_YEAR_OPTIONS = [
  { value: "1-2", label: "1-2 год обучения" },
  { value: "3-4", label: "3-4 год обучения" },
  { value: "5-6", label: "5-6 год обучения" },
  { value: "7+", label: "7 и следующие года обучения" },
];

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
  study_years: string[] | null;
  is_active: boolean;
  task_type: string;
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
  study_years: [],
  is_active: true,
  task_type: "quiz",
};

type OlympiadSection = "izo" | "dpi";
type SubTab = "applications" | "tasks" | "wordsearch" | "settings";

interface OlympiadAnswerItem {
  id: number;
  task_id: number;
  title: string;
  question: string;
  options: string[] | null;
  answer: string;
  correct_answer: string | null;
  is_correct: boolean;
  task_type: string;
  submitted_at: string | null;
}

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

const OLYMPIAD_STATUS_LABELS: Record<string, string> = {
  paid: "Оплачена",
  started: "Начата",
  finished: "Завершена",
};

const OLYMPIAD_STATUS_COLORS: Record<string, string> = {
  paid: "bg-orange-100 text-orange-700",
  started: "bg-yellow-100 text-yellow-700",
  finished: "bg-green-100 text-green-700",
};

const AdminOlympiadsTab = () => {
  const { toast } = useToast();
  const [olympiadSection, setOlympiadSection] = useState<OlympiadSection>("izo");
  const [subTab, setSubTab] = useState<SubTab>("applications");
  const [studyYearFilter, setStudyYearFilter] = useState<string | null>(null);
  const [applications, setApplications] = useState<OlympiadApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
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

  const [downloadingReport, setDownloadingReport] = useState<number | null>(null);

  const downloadReport = async (app: OlympiadApplication) => {
    setDownloadingReport(app.id);
    try {
      const res = await fetch(`${REPORT_API_URL}?app_id=${app.id}`);
      if (!res.ok) throw new Error('Ошибка генерации отчёта');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `olympiad_report_${app.full_name.replace(/\s+/g, '_')}_${app.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Ошибка скачивания отчёта', variant: 'destructive' });
    } finally {
      setDownloadingReport(null);
    }
  };

  // Answers modal state
  const [answersModal, setAnswersModal] = useState<{ app: OlympiadApplication; answers: OlympiadAnswerItem[] } | null>(null);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [answersStats, setAnswersStats] = useState<Record<number, { correct: number; wrong: number; total: number }>>({});

  const calcStats = (answers: OlympiadAnswerItem[]) => {
    const quizAnswers = answers.filter(a => a.task_type !== 'wordsearch' && a.task_type !== 'coloring' && a.correct_answer !== null && a.correct_answer !== undefined);
    const wsAnswers = answers.filter(a => a.task_type === 'wordsearch');
    const coloringAnswers = answers.filter(a => a.task_type === 'coloring');
    return {
      correct: quizAnswers.filter(a => a.is_correct).length + wsAnswers.filter(a => a.is_correct).length + coloringAnswers.filter(a => a.is_correct).length,
      wrong: quizAnswers.filter(a => !a.is_correct).length + wsAnswers.filter(a => !a.is_correct).length,
      total: quizAnswers.length + wsAnswers.length + coloringAnswers.length,
    };
  };

  const openAnswers = async (app: OlympiadApplication) => {
    setAnswersLoading(true);
    setAnswersModal({ app, answers: [] });
    try {
      const res = await fetch(`${ANSWERS_API_URL}?application_id=${app.id}`);
      const data: OlympiadAnswerItem[] = await res.json();
      const answers = Array.isArray(data) ? data : [];
      setAnswersModal({ app, answers });
      setAnswersStats(prev => ({ ...prev, [app.id]: calcStats(answers) }));
    } catch {
      setAnswersModal({ app, answers: [] });
    } finally {
      setAnswersLoading(false);
    }
  };

  // Tasks state
  const [tasks, setTasks] = useState<OlympiadTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [editingTask, setEditingTask] = useState<OlympiadTask | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [taskForm, setTaskForm] = useState<typeof EMPTY_TASK>({ ...EMPTY_TASK });
  const [savingTask, setSavingTask] = useState(false);
  const [uploadingTaskImage, setUploadingTaskImage] = useState(false);
  const [uploadingPairImage, setUploadingPairImage] = useState<Record<number, boolean>>({});

  const loadAnswersStats = useCallback(async (apps: OlympiadApplication[]) => {
    const results = await Promise.allSettled(
      apps.map(app =>
        fetch(`${ANSWERS_API_URL}?application_id=${app.id}`)
          .then(r => r.json())
          .then((data: OlympiadAnswerItem[]) => {
            const answers = Array.isArray(data) ? data : [];
            return { id: app.id, ...calcStats(answers) };
          })
      )
    );
    const stats: Record<number, { correct: number; wrong: number; total: number }> = {};
    for (const r of results) {
      if (r.status === 'fulfilled') {
        stats[r.value.id] = { correct: r.value.correct, wrong: r.value.wrong, total: r.value.total };
      }
    }
    setAnswersStats(stats);
  }, []);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${OLYMPIAD_APPLICATIONS_URL}?type=palette`);
      const data = await res.json();
      setApplications(data);
      if (Array.isArray(data) && data.length > 0) {
        loadAnswersStats(data);
      }
    } catch {
      toast({ title: "Ошибка загрузки заявок", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast, loadAnswersStats]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(SETTINGS_API_URL);
      const data = await res.json();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadTasks = useCallback(async (section: OlympiadSection = "izo") => {
    setTasksLoading(true);
    try {
      const res = await fetch(`${TASKS_API_URL}?type=${section}&admin=true`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : (Array.isArray(data.tasks) ? data.tasks : []));
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
      loadTasks(olympiadSection);
    }
  }, [subTab, olympiadSection, loadTasks]);

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

  const uploadPairImage = async (file: File, pairIndex: number) => {
    setUploadingPairImage(prev => ({ ...prev, [pairIndex]: true }));
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
          body: JSON.stringify({ chunk: chunkBase64, chunkIndex: i, totalChunks, fileName: file.name, fileType: file.type || "image/jpeg", folder: "olympiad-matching", uploadId }),
        });
        const data = await res.json();
        if (data.url) resultUrl = data.url;
      }
      if (resultUrl) {
        setTaskForm(prev => {
          const updated = [...(prev.options || Array(8).fill(""))];
          const parts = (updated[pairIndex] || "").split("|");
          updated[pairIndex] = `${parts[0] || ""}|${parts[1] || ""}|${resultUrl}`;
          return { ...prev, options: updated };
        });
        toast({ title: "Картина загружена" });
      }
    } catch {
      toast({ title: "Ошибка загрузки картины", variant: "destructive" });
    } finally {
      setUploadingPairImage(prev => ({ ...prev, [pairIndex]: false }));
    }
  };

  const openCreateTask = () => {
    setTaskForm({ ...EMPTY_TASK, olympiad_type: olympiadSection });
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
      study_years: task.study_years ? [...task.study_years] : [],
      task_type: task.task_type || "quiz",
    });
  };

  const closeTaskForm = () => {
    setIsCreating(false);
    setEditingTask(null);
  };

  const handleSaveTask = async () => {
    if (!taskForm.question.trim()) {
      toast({ title: "Заполните текст вопроса", variant: "destructive" });
      return;
    }
    const isWordSearch = taskForm.task_type === "wordsearch";
    const isMatching = taskForm.task_type === "matching";
    const isPictureMatching = taskForm.task_type === "picture-matching";
    const isColoring = taskForm.task_type === "coloring";
    if (isWordSearch) {
      const filledWords = (taskForm.options || []).filter((w) => w.trim());
      if (filledWords.length < 3) {
        toast({ title: "Введите хотя бы 3 слова для искалки", variant: "destructive" });
        return;
      }
    }
    if (isMatching) {
      const filledPairs = (taskForm.options || []).filter((o) => { const [l, r] = o.split("|"); return l?.trim() && r?.trim(); });
      if (filledPairs.length < 2) {
        toast({ title: "Введите хотя бы 2 пары для соответствия", variant: "destructive" });
        return;
      }
    }
    if (isPictureMatching) {
      const filledPairs = (taskForm.options || []).filter((o) => { const [l, , img] = o.split("|"); return l?.trim() && img?.trim(); });
      if (filledPairs.length < 2) {
        toast({ title: "Введите хотя бы 2 пары (название + картина)", variant: "destructive" });
        return;
      }
    }
    if (isColoring && !taskForm.image_url?.trim()) {
      toast({ title: "Загрузите картинку для раскраски", variant: "destructive" });
      return;
    }
    setSavingTask(true);
    try {
      const filteredOptions = (isMatching || isPictureMatching)
        ? (taskForm.options || []).filter((o) => { const parts = o.split("|"); return parts[0]?.trim(); })
        : taskForm.options?.filter((o) => o.trim()) || null;
      const payload = {
        ...taskForm,
        title: taskForm.question,
        options: filteredOptions && filteredOptions.length > 0 ? filteredOptions : null,
        correct_answer: isWordSearch ? "__wordsearch__" : isMatching ? "__matching__" : isPictureMatching ? "__picture-matching__" : isColoring ? "__coloring__" : taskForm.correct_answer,
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
      loadTasks(olympiadSection);
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
      {/* Переключатель ИЗО / ДПИ */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Олимпиады</h2>
          <p className="text-gray-500 text-sm mt-1">Управление заявками, заданиями и настройками</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {([{ value: "izo", label: "ИЗО" }, { value: "dpi", label: "ДПИ" }] as { value: OlympiadSection; label: string }[]).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setOlympiadSection(value); setStudyYearFilter(null); }}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                olympiadSection === value ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
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
          onClick={() => setSubTab("wordsearch")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
            subTab === "wordsearch"
              ? "bg-orange-500 text-white shadow"
              : "text-gray-600 hover:bg-orange-50"
          }`}
        >
          <Icon name="Search" size={16} />
          Искалки слов
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
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${OLYMPIAD_STATUS_COLORS[app.olympiad_status] || "bg-gray-100 text-gray-600"}`}>
                          {OLYMPIAD_STATUS_LABELS[app.olympiad_status] || app.olympiad_status}
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
                      {app.task_url && (
                        <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                          <Icon name="Link" size={13} className="text-blue-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500 truncate flex-1 font-mono">{window.location.origin + app.task_url}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.origin + app.task_url!);
                              setCopiedId(app.id);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {copiedId === app.id
                              ? <><Icon name="Check" size={13} className="text-green-500" /><span className="text-green-600">Скопировано</span></>
                              : <><Icon name="Copy" size={13} /><span>Копировать</span></>
                            }
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                      {answersStats[app.id] && answersStats[app.id].total > 0 && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 font-semibold rounded-lg">
                            <Icon name="Check" size={11} />
                            {answersStats[app.id].correct}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 font-semibold rounded-lg">
                            <Icon name="X" size={11} />
                            {answersStats[app.id].wrong}
                          </span>
                          <span className="text-gray-400">/{answersStats[app.id].total}</span>
                        </div>
                      )}
                      <button
                        onClick={() => openAnswers(app)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                        title="Посмотреть ответы участника"
                      >
                        <Icon name="ListChecks" size={13} />
                        Ответы
                      </button>
                      <button
                        onClick={() => downloadReport(app)}
                        disabled={app.status !== 'sent' || downloadingReport === app.id}
                        title={app.status !== 'sent' ? 'Доступно только при статусе «Отправлена»' : 'Скачать PDF-отчёт'}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          app.status === 'sent'
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {downloadingReport === app.id
                          ? <Icon name="Loader2" size={13} className="animate-spin" />
                          : <Icon name="FileDown" size={13} />
                        }
                        Отчёт PDF
                      </button>
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
                {/* Тип задания */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Тип задания</label>
                  <div className="flex gap-2">
                    {[{ value: "quiz", label: "Вопрос с вариантами", icon: "ListChecks" }, { value: "color-mix", label: "Состав цвета", icon: "Palette" }, { value: "wordsearch", label: "Искалка слов", icon: "Search" }, { value: "matching", label: "Соответствие (текст)", icon: "GitCompare" }, { value: "picture-matching", label: "Название → Картина", icon: "Image" }, { value: "coloring", label: "Раскраска", icon: "Paintbrush" }].map(({ value, label, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTaskForm((p) => ({ ...p, task_type: value }))}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          taskForm.task_type === value
                            ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <Icon name={icon} size={15} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Год обучения — множественный выбор */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Год обучения
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {STUDY_YEAR_OPTIONS.map((opt) => {
                      const selected = (taskForm.study_years || []).includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setTaskForm((p) => {
                              const current = p.study_years || [];
                              const updated = selected
                                ? current.filter((v) => v !== opt.value)
                                : [...current, opt.value];
                              return { ...p, study_years: updated };
                            });
                          }}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            selected
                              ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                              : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
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

                {/* Поля для обычного вопроса */}
                {taskForm.task_type !== "wordsearch" && taskForm.task_type !== "coloring" && taskForm.task_type !== "picture-matching" && taskForm.task_type !== "matching" && taskForm.task_type !== "color-mix" && (<>
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
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadTaskImage(f); }} />
                      </label>
                    </div>
                    {taskForm.image_url && (
                      <img src={taskForm.image_url} alt="preview" className="mt-2 max-h-32 rounded-xl border border-orange-100 object-contain" />
                    )}
                  </div>

                  {/* Варианты ответа */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Варианты ответа (необязательно)</label>
                    <div className="space-y-2">
                      {(taskForm.options || []).map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <span className="text-xs text-gray-400 w-5 text-center">{idx + 1}.</span>
                          <input
                            type="text" value={opt} onChange={(e) => updateOption(idx, e.target.value)}
                            placeholder={`Вариант ${idx + 1}`}
                            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 text-sm"
                          />
                          <button onClick={() => removeOption(idx)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                            <Icon name="X" size={14} />
                          </button>
                        </div>
                      ))}
                      <button onClick={addOption} className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium mt-1">
                        <Icon name="Plus" size={14} /> Добавить вариант
                      </button>
                    </div>
                  </div>

                  {/* Правильный ответ */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Правильный ответ (не отображается участникам)</label>
                    <input
                      type="text" value={taskForm.correct_answer || ""}
                      onChange={(e) => setTaskForm((p) => ({ ...p, correct_answer: e.target.value }))}
                      placeholder="Например: 2 или текст ответа"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm"
                    />
                  </div>
                </>)}

                {/* Поля для искалки слов */}
                {taskForm.task_type === "wordsearch" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Название / инструкция <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={taskForm.question}
                      onChange={(e) => setTaskForm((p) => ({ ...p, question: e.target.value }))}
                      placeholder="Например: Найди виды изобразительного искусства"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm mb-4"
                    />
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Слова для поиска <span className="text-gray-400 font-normal">(до 10, только буквы)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const words: string[] = (taskForm.options || []);
                        return (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-5 text-right text-xs text-gray-400 font-bold flex-shrink-0">{i + 1}.</span>
                            <input
                              type="text"
                              value={words[i] || ""}
                              onChange={(e) => {
                                const updated = [...(taskForm.options || Array(10).fill(""))];
                                updated[i] = e.target.value.replace(/[^а-яёА-ЯЁa-zA-Z]/g, "").toUpperCase();
                                setTaskForm((p) => ({ ...p, options: updated }));
                              }}
                              placeholder={`Слово ${i + 1}`}
                              maxLength={15}
                              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 text-sm bg-white uppercase font-mono"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Поля для соответствия */}
                {taskForm.task_type === "matching" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Название / инструкция <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={taskForm.question}
                      onChange={(e) => setTaskForm((p) => ({ ...p, question: e.target.value }))}
                      placeholder="Например: Соедини художника с его картиной"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm mb-4"
                    />
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Пары для соответствия <span className="text-gray-400 font-normal">(до 8 пар)</span>
                    </label>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-semibold text-center">Левая колонка (художник)</span>
                        <span className="text-xs text-gray-400 font-semibold text-center">Правая колонка (картина)</span>
                      </div>
                      {Array.from({ length: 8 }).map((_, i) => {
                        const raw = (taskForm.options || [])[i] || "";
                        const [leftVal, rightVal, imageUrl] = raw.split("|");
                        const hasContent = (leftVal || "").trim() || (rightVal || "").trim();
                        return (
                          <div key={i} className={`border rounded-2xl p-3 space-y-2 ${hasContent ? 'border-orange-100 bg-orange-50/30' : 'border-gray-100'}`}>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={leftVal || ""}
                                onChange={(e) => {
                                  const updated = [...(taskForm.options || Array(8).fill(""))];
                                  const parts = (updated[i] || "").split("|");
                                  updated[i] = `${e.target.value}|${parts[1] || ""}|${parts[2] || ""}`;
                                  setTaskForm((p) => ({ ...p, options: updated }));
                                }}
                                placeholder={`Художник ${i + 1}`}
                                className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 text-sm bg-white"
                              />
                              <input
                                type="text"
                                value={rightVal || ""}
                                onChange={(e) => {
                                  const updated = [...(taskForm.options || Array(8).fill(""))];
                                  const parts = (updated[i] || "").split("|");
                                  updated[i] = `${parts[0] || ""}|${e.target.value}|${parts[2] || ""}`;
                                  setTaskForm((p) => ({ ...p, options: updated }));
                                }}
                                placeholder={`Название картины ${i + 1}`}
                                className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 text-sm bg-white"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              {imageUrl ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <img src={imageUrl} alt="" className="h-12 w-16 object-cover rounded-lg border border-orange-200" />
                                  <span className="text-xs text-green-600 font-medium">Картина загружена</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...(taskForm.options || Array(8).fill(""))];
                                      const parts = (updated[i] || "").split("|");
                                      updated[i] = `${parts[0] || ""}|${parts[1] || ""}|`;
                                      setTaskForm((p) => ({ ...p, options: updated }));
                                    }}
                                    className="text-xs text-red-400 hover:text-red-600 ml-auto"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              ) : (
                                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-violet-50 border border-violet-200 rounded-xl cursor-pointer text-violet-700 text-xs font-medium transition whitespace-nowrap">
                                  {uploadingPairImage[i] ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="ImagePlus" size={12} />}
                                  Загрузить картину
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPairImage(f, i); }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Поля для picture-matching (название → картина) */}
                {taskForm.task_type === "picture-matching" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Название / инструкция <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={taskForm.question}
                      onChange={(e) => setTaskForm((p) => ({ ...p, question: e.target.value }))}
                      placeholder="Например: Соедини название картины с изображением"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm mb-4"
                    />
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Пары «Название → Картина» <span className="text-gray-400 font-normal">(до 8 пар)</span>
                    </label>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-semibold text-center">Название картины</span>
                        <span className="text-xs text-gray-400 font-semibold text-center">Изображение</span>
                      </div>
                      {Array.from({ length: 8 }).map((_, i) => {
                        const raw = (taskForm.options || [])[i] || "";
                        const [leftVal, , imageUrl] = raw.split("|");
                        const hasContent = (leftVal || "").trim() || (imageUrl || "").trim();
                        return (
                          <div key={i} className={`border rounded-2xl p-3 space-y-2 ${hasContent ? 'border-orange-100 bg-orange-50/30' : 'border-gray-100'}`}>
                            <div className="grid grid-cols-2 gap-2 items-center">
                              <input
                                type="text"
                                value={leftVal || ""}
                                onChange={(e) => {
                                  const updated = [...(taskForm.options || Array(8).fill(""))];
                                  const parts = (updated[i] || "").split("|");
                                  updated[i] = `${e.target.value}||${parts[2] || ""}`;
                                  setTaskForm((p) => ({ ...p, options: updated }));
                                }}
                                placeholder={`Название ${i + 1}`}
                                className="border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 text-sm bg-white"
                              />
                              <div className="flex items-center gap-2">
                                {imageUrl ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <img src={imageUrl} alt="" className="h-12 w-16 object-cover rounded-lg border border-orange-200" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...(taskForm.options || Array(8).fill(""))];
                                        const parts = (updated[i] || "").split("|");
                                        updated[i] = `${parts[0] || ""}||`;
                                        setTaskForm((p) => ({ ...p, options: updated }));
                                      }}
                                      className="text-xs text-red-400 hover:text-red-600"
                                    >
                                      Удалить
                                    </button>
                                  </div>
                                ) : (
                                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-violet-50 border border-violet-200 rounded-xl cursor-pointer text-violet-700 text-xs font-medium transition whitespace-nowrap">
                                    {uploadingPairImage[i] ? <Icon name="Loader2" size={12} className="animate-spin" /> : <Icon name="ImagePlus" size={12} />}
                                    Загрузить картину
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPairImage(f, i); }}
                                    />
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Поля для раскраски */}
                {taskForm.task_type === "coloring" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Название / инструкция <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={taskForm.question}
                        onChange={(e) => setTaskForm((p) => ({ ...p, question: e.target.value }))}
                        placeholder="Например: Раскрась кота Ван Гога!"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Картинка для раскраски <span className="text-red-400">*</span>
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
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadTaskImage(f); }} />
                        </label>
                      </div>
                      {taskForm.image_url && (
                        <img src={taskForm.image_url} alt="preview" className="mt-2 max-h-48 rounded-xl border border-orange-100 object-contain" />
                      )}
                      <p className="text-xs text-gray-400 mt-1">Рекомендуется контурный рисунок для раскраски. Ответ всегда будет засчитан как верный.</p>
                    </div>
                  </div>
                )}

                {/* Поля для задания "Состав цвета" */}
                {taskForm.task_type === "color-mix" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Вопрос / Текст задания <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={taskForm.question}
                        onChange={(e) => setTaskForm((p) => ({ ...p, question: e.target.value }))}
                        rows={2}
                        placeholder="Например: Какие два цвета нужно смешать, чтобы получить розовый?"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Варианты цветов <span className="text-gray-400 font-normal">(формат: Название||#RRGGBB)</span>
                      </label>
                      <p className="text-xs text-gray-400 mb-3">Например: <code className="bg-gray-100 px-1 rounded">Красный||#FF0000</code> — название и HEX-код через двойную черту</p>
                      <div className="space-y-2">
                        {(taskForm.options || []).map((opt, idx) => {
                          const [name, hex] = opt.includes("||") ? opt.split("||") : [opt, "#cccccc"];
                          return (
                            <div key={idx} className="flex gap-2 items-center">
                              <span
                                className="w-8 h-8 rounded-lg border border-black/10 flex-shrink-0 cursor-pointer"
                                style={{ backgroundColor: hex || "#cccccc" }}
                                title={hex}
                              />
                              <input
                                type="text"
                                value={name}
                                onChange={(e) => {
                                  const updated = [...(taskForm.options || [])];
                                  updated[idx] = `${e.target.value}||${hex}`;
                                  setTaskForm((p) => ({ ...p, options: updated }));
                                }}
                                placeholder="Название цвета"
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 text-sm"
                              />
                              <input
                                type="color"
                                value={hex || "#cccccc"}
                                onChange={(e) => {
                                  const updated = [...(taskForm.options || [])];
                                  updated[idx] = `${name}||${e.target.value}`;
                                  setTaskForm((p) => ({ ...p, options: updated }));
                                }}
                                className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                                title="Выбрать цвет"
                              />
                              <button onClick={() => removeOption(idx)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                                <Icon name="X" size={14} />
                              </button>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => setTaskForm((p) => ({ ...p, options: [...(p.options || []), "Новый цвет||#cccccc"] }))}
                          className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium mt-1"
                        >
                          <Icon name="Plus" size={14} /> Добавить цвет
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Правильные ответы <span className="text-gray-400 font-normal">(названия через запятую)</span>
                      </label>
                      <input
                        type="text"
                        value={taskForm.correct_answer || ""}
                        onChange={(e) => setTaskForm((p) => ({ ...p, correct_answer: e.target.value }))}
                        placeholder="Например: Красный,Белый"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">Перечислите названия правильных цветов через запятую — ровно так, как они указаны в вариантах выше.</p>
                    </div>
                  </div>
                )}

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

          {/* Фильтр по годам обучения (только ИЗО) */}
          {olympiadSection === "izo" && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setStudyYearFilter(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  studyYearFilter === null ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                }`}
              >
                Все ({tasks.length})
              </button>
              {STUDY_YEAR_OPTIONS.map((opt) => {
                const count = tasks.filter(t => (t.study_years || []).includes(opt.value)).length;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStudyYearFilter(opt.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      studyYearFilter === opt.value ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {opt.label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Список заданий */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">
              Задания отображаются участникам после успешной оплаты
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => loadTasks(olympiadSection)}
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
              {tasks.filter(task => !studyYearFilter || (task.study_years || []).includes(studyYearFilter)).map((task) => (
                <div
                  key={task.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                    task.is_active ? "border-gray-100 hover:shadow-md" : "border-gray-100 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            task.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {task.is_active ? "Активно" : "Скрыто"}
                        </span>
                        {task.study_years && task.study_years.length > 0 && task.study_years.map((y) => {
                          const opt = STUDY_YEAR_OPTIONS.find((o) => o.value === y);
                          return (
                            <span key={y} className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              {opt ? opt.label : y}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {task.task_type === "wordsearch" && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                            <Icon name="Search" size={10} /> Искалка слов
                          </span>
                        )}
                        {task.task_type === "matching" && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 flex items-center gap-1">
                            <Icon name="GitCompare" size={10} /> Соответствие
                          </span>
                        )}
                        {task.task_type === "picture-matching" && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 flex items-center gap-1">
                            <Icon name="Image" size={10} /> Название → Картина
                          </span>
                        )}
                        {task.task_type === "coloring" && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                            <Icon name="Paintbrush" size={10} /> Раскраска
                          </span>
                        )}
                        {task.task_type === "color-mix" && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 flex items-center gap-1">
                            <Icon name="Palette" size={10} /> Состав цвета
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">{task.question}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {task.task_type === "wordsearch" && task.options && task.options.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Icon name="Search" size={12} />
                            {task.options.length} слов
                          </span>
                        )}
                        {task.task_type !== "wordsearch" && task.options && task.options.length > 0 && (
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
                        {task.correct_answer && task.correct_answer !== "__wordsearch__" && (
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

      {/* Искалки слов */}
      {subTab === "wordsearch" && <AdminWordSearchTab />}

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

      {/* Модалка ответов участника */}
      {answersModal && (() => {
        const answers = answersModal.answers;
        const withCorrect = answers.filter(a => a.correct_answer !== null && a.correct_answer !== undefined);
        const correctCount = withCorrect.filter(a => a.is_correct).length;
        const wrongCount = withCorrect.filter(a => !a.is_correct).length;
        const totalChecked = withCorrect.length;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setAnswersModal(null)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 text-lg">{answersModal.app.full_name}</p>
                  <p className="text-sm text-gray-400">
                    Год обучения: {answersModal.app.study_year} · Возраст: {answersModal.app.age}
                  </p>
                </div>
                <button onClick={() => setAnswersModal(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                  <Icon name="X" size={18} />
                </button>
              </div>

              {/* Счётчики результатов */}
              {!answersLoading && totalChecked > 0 && (
                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-4 flex-wrap bg-gray-50">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-xl">
                    <Icon name="CheckCircle" size={16} className="text-green-600" />
                    <span className="text-sm font-bold text-green-700">Правильно: {correctCount}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-xl">
                    <Icon name="XCircle" size={16} className="text-red-500" />
                    <span className="text-sm font-bold text-red-600">Ошибок: {wrongCount}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                    <Icon name="ListChecks" size={16} className="text-gray-500" />
                    <span className="text-sm font-bold text-gray-600">Всего вопросов: {totalChecked}</span>
                  </div>
                  <div className="ml-auto text-sm font-semibold text-gray-500">
                    {Math.round((correctCount / totalChecked) * 100)}%
                  </div>
                </div>
              )}

              <div className="overflow-y-auto flex-1 p-6 space-y-3">
                {answersLoading ? (
                  <div className="flex items-center justify-center py-16 text-gray-400">
                    <Icon name="Loader2" size={24} className="animate-spin mr-2" />
                    Загружаем ответы...
                  </div>
                ) : answers.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Icon name="ListChecks" size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Участник ещё не отправил ответы</p>
                  </div>
                ) : (
                  answers.map((item, i) => {
                    const hasCorrect = item.correct_answer !== null && item.correct_answer !== undefined;
                    const isMatching = item.task_type === 'matching';
                    const isColoring = item.task_type === 'coloring';
                    const coloringUrl = isColoring && item.answer && item.answer.startsWith('http') ? item.answer : null;

                    // Парсим matching-ответ: "leftIdx:rightOrigIdx,..."
                    const parseMatchingPairs = (answer: string, options: string[] | null) => {
                      if (!answer || !options) return [];
                      return answer.split(',').map(p => {
                        const [li, ri] = p.split(':').map(Number);
                        const left = options[li] ? options[li].split('|')[0] : `#${li}`;
                        const right = options[ri] ? options[ri].split('|')[1] || options[ri].split('|')[0] : `#${ri}`;
                        const correct = li === ri;
                        return { left, right, correct };
                      });
                    };

                    const matchingPairs = isMatching ? parseMatchingPairs(item.answer, item.options) : [];

                    return (
                      <div key={item.id} className={`border rounded-2xl overflow-hidden ${item.is_correct ? 'border-green-200' : 'border-red-200'}`}>
                        <div className={`px-4 py-3 flex items-center gap-3 ${item.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                          <span className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${item.is_correct ? 'bg-green-500' : 'bg-red-400'}`}>
                            {i + 1}
                          </span>
                          <p className="font-semibold text-gray-800 text-sm flex-1">{item.title}</p>
                          <Icon
                            name={item.is_correct ? "CheckCircle" : "XCircle"}
                            size={16}
                            className={item.is_correct ? "text-green-500" : "text-red-400"}
                          />
                        </div>
                        <div className="px-4 py-3 space-y-2">
                          <p className="text-xs text-gray-500 leading-relaxed">{item.question}</p>
                          {isColoring ? (
                            <div className="mt-2">
                              {coloringUrl ? (
                                <>
                                  <p className="text-xs text-gray-400 font-semibold mb-2">Раскрашенная картина участника:</p>
                                  <img src={coloringUrl} alt="Раскраска" className="max-h-64 rounded-xl border border-green-200 object-contain" />
                                  <a href={coloringUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-blue-500 hover:underline">
                                    <Icon name="ExternalLink" size={11} /> Открыть полную картину
                                  </a>
                                </>
                              ) : (
                                <p className="text-xs text-gray-400">Раскраска не сохранена</p>
                              )}
                            </div>
                          ) : isMatching ? (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-400 font-semibold mb-1">Соединения участника:</p>
                              {matchingPairs.map((pair, pi) => (
                                <div key={pi} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${pair.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                  <Icon name={pair.correct ? "CheckCircle" : "XCircle"} size={12} className={pair.correct ? "text-green-500 flex-shrink-0" : "text-red-400 flex-shrink-0"} />
                                  <span className="font-semibold">{pair.left}</span>
                                  <span className="text-gray-400">→</span>
                                  <span>{pair.right}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Ответ:</span>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${hasCorrect ? (item.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700') : 'bg-blue-100 text-blue-800'}`}>
                                  {item.answer}
                                </span>
                              </div>
                              {hasCorrect && !item.is_correct && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400">Правильно:</span>
                                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                    {item.correct_answer}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminOlympiadsTab;