import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";

const WORD_SEARCH_API_URL = "https://functions.poehali.dev/68f0a840-3a59-44e0-b092-f6e6cc9d3633";

const STUDY_YEAR_OPTIONS = [
  { value: "1", label: "1 год" },
  { value: "2", label: "2 год" },
  { value: "3", label: "3 год" },
  { value: "4", label: "4 год" },
  { value: "5", label: "5 год" },
  { value: "6", label: "6 год" },
  { value: "7", label: "7 год" },
  { value: "8", label: "8 год" },
  { value: "9", label: "9 год" },
];

interface WordSearchPuzzle {
  id: number;
  olympiad_type: string;
  title: string;
  study_years: string[];
  words: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const EMPTY_PUZZLE = {
  olympiad_type: "palette",
  title: "",
  study_years: [] as string[],
  words: ["", "", "", "", "", "", "", "", "", ""],
  is_active: true,
  sort_order: 0,
};

const STUDY_YEAR_GROUP_LABELS: Record<string, string> = {
  "1": "1 год", "2": "2 год", "3": "3 год",
  "4": "4 год", "5": "5 год", "6": "6 год",
  "7": "7 год", "8": "8 год", "9": "9 год",
};

export default function AdminWordSearchTab() {
  const { toast } = useToast();
  const [puzzles, setPuzzles] = useState<WordSearchPuzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<WordSearchPuzzle | null>(null);
  const [form, setForm] = useState({ ...EMPTY_PUZZLE, words: [...EMPTY_PUZZLE.words] });
  const [saving, setSaving] = useState(false);

  const loadPuzzles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${WORD_SEARCH_API_URL}?type=palette&admin=true`);
      const data = await res.json();
      setPuzzles(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Ошибка загрузки", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadPuzzles(); }, [loadPuzzles]);

  const openCreate = () => {
    setForm({ ...EMPTY_PUZZLE, words: ["", "", "", "", "", "", "", "", "", ""] });
    setEditingPuzzle(null);
    setIsCreating(true);
  };

  const openEdit = (puzzle: WordSearchPuzzle) => {
    const words = [...puzzle.words];
    while (words.length < 10) words.push("");
    setForm({
      olympiad_type: puzzle.olympiad_type,
      title: puzzle.title,
      study_years: puzzle.study_years || [],
      words,
      is_active: puzzle.is_active,
      sort_order: puzzle.sort_order,
    });
    setEditingPuzzle(puzzle);
    setIsCreating(false);
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditingPuzzle(null);
  };

  const toggleYear = (year: string) => {
    setForm((p) => ({
      ...p,
      study_years: p.study_years.includes(year)
        ? p.study_years.filter((y) => y !== year)
        : [...p.study_years, year],
    }));
  };

  const setWord = (index: number, value: string) => {
    setForm((p) => {
      const words = [...p.words];
      words[index] = value;
      return { ...p, words };
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Введите название задания", variant: "destructive" });
      return;
    }
    const filledWords = form.words.filter((w) => w.trim());
    if (filledWords.length < 3) {
      toast({ title: "Введите хотя бы 3 слова", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        words: form.words.filter((w) => w.trim()),
        ...(editingPuzzle ? { id: editingPuzzle.id } : {}),
      };
      const res = await fetch(WORD_SEARCH_API_URL, {
        method: editingPuzzle ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success && !data.id) throw new Error("Ошибка сохранения");
      toast({ title: editingPuzzle ? "Искалка обновлена" : "Искалка создана" });
      closeForm();
      loadPuzzles();
    } catch {
      toast({ title: "Ошибка сохранения", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить искалку?")) return;
    try {
      await fetch(WORD_SEARCH_API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setPuzzles((p) => p.filter((x) => x.id !== id));
      toast({ title: "Искалка удалена" });
    } catch {
      toast({ title: "Ошибка удаления", variant: "destructive" });
    }
  };

  const handleToggleActive = async (puzzle: WordSearchPuzzle) => {
    try {
      await fetch(WORD_SEARCH_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...puzzle, is_active: !puzzle.is_active }),
      });
      setPuzzles((p) => p.map((x) => x.id === puzzle.id ? { ...x, is_active: !x.is_active } : x));
    } catch {
      toast({ title: "Ошибка", variant: "destructive" });
    }
  };

  const puzzleLink = (puzzle: WordSearchPuzzle) => {
    const years = puzzle.study_years?.join(",") || "";
    return `${window.location.origin}/olympiad/word-search?id=${puzzle.id}${years ? `&years=${years}` : ""}`;
  };

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Искалки слов</h2>
          <p className="text-sm text-gray-500 mt-0.5">Интерактивные задания — найди слова в сетке</p>
        </div>
        {!isCreating && !editingPuzzle && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Icon name="Plus" size={16} />
            Новая искалка
          </button>
        )}
      </div>

      {/* Форма создания / редактирования */}
      {(isCreating || editingPuzzle) && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 space-y-5">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Icon name={isCreating ? "PlusCircle" : "Pencil"} size={18} className="text-orange-500" />
            {isCreating ? "Новая искалка" : "Редактировать искалку"}
          </h3>

          {/* Название */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Название задания <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Например: Найди виды искусства"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400 text-sm bg-white"
            />
          </div>

          {/* Год обучения */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Год обучения <span className="text-gray-400 font-normal">(если не выбрано — доступно всем)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {STUDY_YEAR_OPTIONS.map(({ value, label }) => {
                const selected = form.study_years.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleYear(value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      selected
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 10 слов */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Слова для поиска <span className="text-gray-400 font-normal">(до 10 слов, только буквы)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {form.words.map((word, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-right text-xs text-gray-400 font-bold flex-shrink-0">{i + 1}.</span>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(i, e.target.value.replace(/[^а-яёА-ЯЁa-zA-Z]/g, ""))}
                    placeholder={`Слово ${i + 1}`}
                    maxLength={15}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-orange-400 text-sm bg-white uppercase"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Активно */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, is_active: !p.is_active }))}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.is_active ? "bg-orange-500" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_active ? "left-5" : "left-0.5"}`} />
            </button>
            <span className="text-sm text-gray-700">Активна (видна участникам)</span>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Icon name={saving ? "Loader2" : "Save"} size={15} className={saving ? "animate-spin" : ""} />
              {saving ? "Сохраняю..." : "Сохранить"}
            </button>
            <button
              onClick={closeForm}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Список искалок */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
          <Icon name="Loader2" size={20} className="animate-spin" />
          Загружаю...
        </div>
      ) : puzzles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Icon name="Search" size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-500">Искалок пока нет</p>
          <p className="text-sm mt-1">Нажмите «Новая искалка», чтобы создать первое задание</p>
        </div>
      ) : (
        <div className="space-y-3">
          {puzzles.map((puzzle) => (
            <div
              key={puzzle.id}
              className={`bg-white border rounded-2xl p-5 transition-all ${puzzle.is_active ? "border-orange-100" : "border-gray-100 opacity-60"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">{puzzle.title}</span>
                    {!puzzle.is_active && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg">Скрыта</span>
                    )}
                  </div>

                  {/* Годы обучения */}
                  {puzzle.study_years?.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {puzzle.study_years.map((y) => (
                        <span key={y} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg font-medium">
                          {STUDY_YEAR_GROUP_LABELS[y] || y}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 mt-1 block">Все годы обучения</span>
                  )}

                  {/* Слова */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {puzzle.words.map((w, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-lg font-mono font-semibold">
                        {w}
                      </span>
                    ))}
                  </div>

                  {/* Ссылка */}
                  <div className="mt-3 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                    <Icon name="Link" size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-400 truncate flex-1 font-mono">{puzzleLink(puzzle)}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(puzzleLink(puzzle)); toast({ title: "Ссылка скопирована" }); }}
                      className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      <Icon name="Copy" size={12} />
                      Копировать
                    </button>
                  </div>
                </div>

                {/* Действия */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(puzzle)}
                    title={puzzle.is_active ? "Скрыть" : "Показать"}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Icon name={puzzle.is_active ? "Eye" : "EyeOff"} size={15} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => openEdit(puzzle)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <Icon name="Pencil" size={15} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(puzzle.id)}
                    className="p-2 rounded-xl border border-red-100 hover:bg-red-50 transition-colors"
                  >
                    <Icon name="Trash2" size={15} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
