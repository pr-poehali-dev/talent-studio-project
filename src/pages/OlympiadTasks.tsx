import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, BookOpen, ChevronLeft, ChevronRight, Send, Trophy } from 'lucide-react';
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
  task_type?: string;
}

// ===== Искалка слов =====
const WS_GRID_SIZE = 12;
const WS_ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const WS_DIRECTIONS = [[0,1],[1,0],[0,-1],[-1,0]];
const WS_COLORS = ['bg-green-200 text-green-900','bg-blue-200 text-blue-900','bg-purple-200 text-purple-900','bg-pink-200 text-pink-900','bg-yellow-200 text-yellow-900','bg-teal-200 text-teal-900','bg-orange-200 text-orange-900','bg-red-200 text-red-900','bg-indigo-200 text-indigo-900','bg-emerald-200 text-emerald-900'];

function buildWordSearchGrid(words: string[]) {
  const grid: string[][] = Array.from({ length: WS_GRID_SIZE }, () => Array(WS_GRID_SIZE).fill(''));
  const placements: Record<string, string> = {};
  for (const word of [...words].sort((a, b) => b.length - a.length)) {
    let placed = false; let attempts = 0;
    while (!placed && attempts++ < 400) {
      const [dr, dc] = WS_DIRECTIONS[Math.floor(Math.random() * WS_DIRECTIONS.length)];
      const minR = dr < 0 ? word.length - 1 : 0, maxR = dr > 0 ? WS_GRID_SIZE - word.length : WS_GRID_SIZE - 1;
      const minC = dc < 0 ? word.length - 1 : 0, maxC = dc > 0 ? WS_GRID_SIZE - word.length : WS_GRID_SIZE - 1;
      if (maxR < minR || maxC < minC) continue;
      const r0 = minR + Math.floor(Math.random() * (maxR - minR + 1));
      const c0 = minC + Math.floor(Math.random() * (maxC - minC + 1));
      let ok = true;
      for (let i = 0; i < word.length; i++) { const r = r0+dr*i, c = c0+dc*i; if (grid[r][c] !== '' && grid[r][c] !== word[i]) { ok = false; break; } }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) { grid[r0+dr*i][c0+dc*i] = word[i]; placements[`${r0+dr*i}-${c0+dc*i}`] = word; }
      placed = true;
    }
  }
  for (let r = 0; r < WS_GRID_SIZE; r++) for (let c = 0; c < WS_GRID_SIZE; c++)
    if (grid[r][c] === '') grid[r][c] = WS_ALPHABET[Math.floor(Math.random() * WS_ALPHABET.length)];
  return { grid, placements };
}

function getLineCells(start: [number,number], end: [number,number]): [number,number][] {
  const dr = end[0]-start[0], dc = end[1]-start[1];
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  if (len === 0) return [start];
  if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0) return [start];
  const sr = dr === 0 ? 0 : dr/Math.abs(dr), sc = dc === 0 ? 0 : dc/Math.abs(dc);
  return Array.from({ length: len+1 }, (_, i) => [start[0]+sr*i, start[1]+sc*i] as [number,number]);
}

interface WordSearchProps { taskId: number; words: string[]; onComplete: (taskId: number) => void; isCompleted: boolean; studyYear?: number; }

function WordSearchWidget({ taskId, words, onComplete, isCompleted, studyYear }: WordSearchProps) {
  const hideHints = studyYear !== undefined && studyYear >= 5;
  const [{ grid, placements }] = useState(() => buildWordSearchGrid(words.map(w => w.toUpperCase())));
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Record<string, number>>({});
  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState<[number,number]|null>(null);
  const [selection, setSelection] = useState<[number,number][]>([]);
  const [wrongFlash, setWrongFlash] = useState(false);
  const upperWords = words.map(w => w.toUpperCase());

  useEffect(() => { if (foundWords.length === upperWords.length && upperWords.length > 0 && !isCompleted) onComplete(taskId); }, [foundWords, upperWords.length, taskId, onComplete, isCompleted]);

  const getCellFromPoint = (clientX: number, clientY: number): [number,number]|null => {
    const el = document.elementFromPoint(clientX, clientY);
    const r = el?.getAttribute('data-wsrow'), c = el?.getAttribute('data-wscol');
    return r !== null && r !== undefined && c !== null && c !== undefined ? [parseInt(r), parseInt(c)] : null;
  };

  const onDown = useCallback((e: React.MouseEvent|React.TouchEvent) => {
    e.preventDefault();
    const t = 'touches' in e ? e.touches[0] : e as React.MouseEvent;
    const cell = getCellFromPoint(t.clientX, t.clientY);
    if (!cell) return; setSelecting(true); setStartCell(cell); setSelection([cell]);
  }, []);

  const onMove = useCallback((e: React.MouseEvent|React.TouchEvent) => {
    e.preventDefault();
    if (!selecting || !startCell) return;
    const t = 'touches' in e ? e.touches[0] : e as React.MouseEvent;
    const cell = getCellFromPoint(t.clientX, t.clientY);
    if (cell) setSelection(getLineCells(startCell, cell));
  }, [selecting, startCell]);

  const onUp = useCallback((e: React.MouseEvent|React.TouchEvent) => {
    e.preventDefault(); setSelecting(false);
    if (selection.length < 2) { setSelection([]); setStartCell(null); return; }
    const fwd = selection.map(([r,c]) => grid[r][c]).join('');
    const bwd = [...selection].reverse().map(([r,c]) => grid[r][c]).join('');
    const match = upperWords.find(w => !foundWords.includes(w) && (w === fwd || w === bwd));
    if (match) {
      const ci = foundWords.length % WS_COLORS.length;
      const nc = { ...foundCells }; selection.forEach(([r,c]) => { nc[`${r}-${c}`] = ci; }); setFoundCells(nc);
      setFoundWords(p => [...p, match]);
    } else { setWrongFlash(true); setTimeout(() => setWrongFlash(false), 350); }
    setSelection([]); setStartCell(null);
  }, [selection, grid, upperWords, foundWords, foundCells]);

  const selSet = new Set(selection.map(([r,c]) => `${r}-${c}`));

  return (
    <div className="space-y-3 select-none">
      {/* Подсказка про направления */}
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <span>↔ ↕</span>
        <span>Слова расположены только по горизонтали и вертикали</span>
      </p>

      {/* Слова-подсказки — только для 1-4 года */}
      {!hideHints && (
        <div className="flex flex-wrap gap-1.5">
          {upperWords.map(word => {
            const fi = foundWords.indexOf(word);
            return (
              <span key={word} className={`px-2.5 py-1 rounded-xl text-xs font-bold border-2 transition-all ${fi >= 0 ? `${WS_COLORS[fi % WS_COLORS.length]} border-transparent line-through opacity-60` : 'bg-white text-gray-700 border-gray-200'}`}>
                {word}
              </span>
            );
          })}
        </div>
      )}

      {/* Для 5+ показываем только счётчик найденных */}
      {hideHints && !isCompleted && (
        <div className="text-xs text-gray-500 font-medium">
          Найдено слов: <span className="text-orange-500 font-bold">{foundWords.length}</span> из {upperWords.length}
        </div>
      )}

      {/* Сетка */}
      <div
        className={`rounded-2xl overflow-hidden transition-all ${wrongFlash ? 'ring-2 ring-red-300' : ''} ${isCompleted ? 'opacity-70 pointer-events-none' : ''}`}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      >
        <div className="grid gap-0.5 p-1 bg-orange-50" style={{ gridTemplateColumns: `repeat(${WS_GRID_SIZE}, minmax(0,1fr))` }}>
          {grid.map((row, r) => row.map((letter, c) => {
            const key = `${r}-${c}`;
            const isSel = selSet.has(key), ci = foundCells[key];
            let cls = 'bg-white text-gray-600';
            if (ci !== undefined) cls = WS_COLORS[ci % WS_COLORS.length];
            if (isSel) cls = 'bg-orange-400 text-white scale-105 shadow-sm z-10';
            return (
              <div key={key} data-wsrow={r} data-wscol={c}
                className={`aspect-square flex items-center justify-center rounded text-gray-800 font-bold cursor-default transition-all relative ${cls}`}
                style={{ fontSize: 'clamp(8px, 2vw, 13px)' }}
              >{letter}</div>
            );
          }))}
        </div>
      </div>
      {isCompleted && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-green-700">Все слова найдены! Задание выполнено.</span>
        </div>
      )}
      {!isCompleted && (
        <p className="text-xs text-gray-400 text-center">Проведи пальцем или мышью по буквам чтобы выделить слово</p>
      )}
    </div>
  );
}

// ===== Соответствие =====
const MATCHING_COLORS = [
  'bg-rose-100 text-rose-800 border-rose-300',
  'bg-blue-100 text-blue-800 border-blue-300',
  'bg-emerald-100 text-emerald-800 border-emerald-300',
  'bg-amber-100 text-amber-800 border-amber-300',
  'bg-violet-100 text-violet-800 border-violet-300',
  'bg-cyan-100 text-cyan-800 border-cyan-300',
  'bg-pink-100 text-pink-800 border-pink-300',
  'bg-lime-100 text-lime-800 border-lime-300',
];

interface MatchingProps {
  taskId: number;
  pairs: Array<{ left: string; right: string; imageUrl?: string }>;
  onComplete: (taskId: number, answer: string) => void;
  isCompleted: boolean;
}

function MatchingWidget({ taskId, pairs, onComplete, isCompleted }: MatchingProps) {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  // matched: leftIdx -> rightOrigIdx (какую правую выбрал для этого левого)
  const [matched, setMatched] = useState<Record<number, number>>({});

  const hasImages = pairs.some(p => p.imageUrl);

  const [shuffledRight] = useState(() => {
    const arr = pairs.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  // pos -> origIdx
  const rightToOrig = Object.fromEntries(shuffledRight.map((orig, pos) => [pos, orig]));
  // origIdx -> уже занят каким leftIdx
  const origToLeft = Object.fromEntries(Object.entries(matched).map(([l, r]) => [r, Number(l)]));

  useEffect(() => {
    if (Object.keys(matched).length === pairs.length && pairs.length > 0 && !isCompleted) {
      // Формируем строку соединений: "leftIdx:rightOrigIdx,..."
      const answerStr = Object.entries(matched).map(([l, r]) => `${l}:${r}`).join(',');
      onComplete(taskId, answerStr);
    }
  }, [matched, pairs.length, taskId, onComplete, isCompleted]);

  const handleLeftClick = (idx: number) => {
    if (isCompleted) return;
    setSelectedLeft(idx === selectedLeft ? null : idx);
  };

  const handleRightClick = (pos: number) => {
    if (isCompleted) return;
    const origIdx = rightToOrig[pos];
    if (selectedLeft === null) return;

    // Если правая уже занята другим левым — снимаем ту связь
    const prevLeft = origToLeft[origIdx];
    const newMatched = { ...matched };
    if (prevLeft !== undefined && prevLeft !== selectedLeft) {
      delete newMatched[prevLeft];
    }
    // Если у выбранного левого уже была правая — снимаем
    if (newMatched[selectedLeft] !== undefined) {
      delete newMatched[newMatched[selectedLeft]]; // не нужно, просто перезаписываем
    }
    newMatched[selectedLeft] = origIdx;
    setMatched(newMatched);
    setSelectedLeft(null);
  };

  const getLeftStyle = (idx: number): string => {
    const isLinked = matched[idx] !== undefined;
    if (isLinked) return MATCHING_COLORS[idx % MATCHING_COLORS.length];
    if (selectedLeft === idx) return 'bg-orange-400 text-white border-orange-400';
    return 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50';
  };

  const getRightStyle = (pos: number): string => {
    const origIdx = rightToOrig[pos];
    const linkedLeft = origToLeft[origIdx];
    if (linkedLeft !== undefined) return MATCHING_COLORS[linkedLeft % MATCHING_COLORS.length];
    if (selectedLeft !== null) return 'border-orange-200 hover:border-orange-400 hover:bg-orange-50 cursor-pointer';
    return 'border-gray-200';
  };

  const matchedCount = Object.keys(matched).length;

  return (
    <div className="space-y-3 select-none">
      <p className="text-xs text-gray-400">Нажми на элемент слева, затем выбери подходящий справа. Можно пересоединять.</p>

      {!isCompleted && (
        <div className="text-xs text-gray-500 font-medium">
          Соединено пар: <span className="text-orange-500 font-bold">{matchedCount}</span> из {pairs.length}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          {pairs.map((pair, idx) => (
            <button
              key={idx}
              onClick={() => handleLeftClick(idx)}
              disabled={isCompleted}
              className={`w-full text-left px-3 py-2.5 rounded-2xl border-2 text-sm font-medium transition-all leading-snug ${getLeftStyle(idx)}`}
            >
              {pair.left}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffledRight.map((origIdx, pos) => {
            const pair = pairs[origIdx];
            const linkedLeft = origToLeft[origIdx];
            const isLinked = linkedLeft !== undefined;
            const colorCls = isLinked ? MATCHING_COLORS[linkedLeft % MATCHING_COLORS.length] : '';
            return (
              <button
                key={pos}
                onClick={() => handleRightClick(pos)}
                disabled={isCompleted}
                className={`w-full rounded-2xl border-2 transition-all overflow-hidden ${getRightStyle(pos)} ${isLinked ? colorCls : 'bg-white'}`}
              >
                {hasImages && pair.imageUrl ? (
                  <div>
                    <img
                      src={pair.imageUrl}
                      alt=""
                      className="w-full object-cover"
                      style={{ height: '90px' }}
                    />
                    <div className="px-2 py-1 text-xs font-medium text-center text-gray-600">
                      {pair.right}
                    </div>
                  </div>
                ) : (
                  <div className="px-3 py-2.5 text-sm font-medium text-left leading-snug">
                    {pair.right}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {isCompleted && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-green-700">Все пары соединены! Задание выполнено.</span>
        </div>
      )}
    </div>
  );
}

const OLYMPIAD_NAMES: Record<string, string> = {
  palette: 'Палитра талантов',
  grani: 'Грани творчества',
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

const OPTION_LABELS = ['А', 'Б', 'В', 'Г', 'Д', 'Е'];

const OlympiadTasks = () => {
  const [searchParams] = useSearchParams();
  const olympiadType = searchParams.get('type') || '';
  const studyYearParam = searchParams.get('study_year') || '';
  const paymentId = searchParams.get('payment_id') || searchParams.get('paymentId') || '';

  const storageKey = paymentId ? `olympiad_progress_${paymentId}` : null;

  const [tasks, setTasks] = useState<OlympiadTask[]>([]);
  const [participantName, setParticipantName] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!paymentId) return 0;
    try {
      const saved = localStorage.getItem(`olympiad_progress_${paymentId}`);
      return saved ? (JSON.parse(saved).currentIndex ?? 0) : 0;
    } catch { return 0; }
  });
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    if (!paymentId) return {};
    try {
      const saved = localStorage.getItem(`olympiad_progress_${paymentId}`);
      return saved ? (JSON.parse(saved).answers ?? {}) : {};
    } catch { return {}; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const taskCardRef = useRef<HTMLDivElement>(null);

  const olympiadName = OLYMPIAD_NAMES[olympiadType] || 'Олимпиада';
  const studyYearLabel = STUDY_YEAR_LABELS[studyYearParam] || (studyYearParam ? `${studyYearParam} год обучения` : '');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!olympiadType || !paymentId) {
      setTasksLoading(false);
      return;
    }
    const url = studyYearParam
      ? `${TASKS_API_URL}?type=${olympiadType}&study_year=${studyYearParam}&payment_id=${paymentId}`
      : `${TASKS_API_URL}?type=${olympiadType}&payment_id=${paymentId}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.tasks)) {
          setTasks(data.tasks);
          setParticipantName(data.participant_full_name || null);
        } else if (Array.isArray(data)) {
          setTasks(data);
        }
      })
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, [olympiadType, studyYearParam, paymentId]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers, currentIndex }));
    } catch (e) {
      console.warn('localStorage save failed', e);
    }
  }, [answers, currentIndex, storageKey]);

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

  const handleWordSearchComplete = useCallback((taskId: number) => {
    setAnswers((prev) => ({ ...prev, [taskId]: '__wordsearch_done__' }));
  }, []);

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
      if (storageKey) localStorage.removeItem(storageKey);
      window.scrollTo(0, 0);
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Шапка */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium">Олимпиада</p>
            <p className="font-bold text-gray-800 text-base truncate">«{olympiadName}»{studyYearLabel ? ` · ${studyYearLabel}` : ''}</p>
            {participantName && <p className="text-xs text-gray-500 mt-0.5 truncate">{participantName}</p>}
          </div>
          {!submitted && total > 0 && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">Отвечено</p>
              <p className="font-bold text-orange-500">{answered}/{total}</p>
            </div>
          )}
        </div>

        {/* Состояние: завершено */}
        {submitted ? (
          <div className="bg-white rounded-3xl shadow-md border border-green-100 p-10 text-center space-y-5">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-800">Ответы отправлены!</h2>
              <p className="text-gray-500 text-sm">Спасибо за участие в олимпиаде!</p>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-left space-y-3 max-w-sm mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-orange-400 text-lg flex-shrink-0">📊</span>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Результаты</span> будут опубликованы в разделе «Итоги» в течение <span className="font-semibold">2–3 дней</span>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400 text-lg flex-shrink-0">📧</span>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Наградные документы</span> будут отправлены на электронную почту, указанную при регистрации.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400 text-lg flex-shrink-0">📝</span>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Отчёт о выполненных заданиях</span> олимпиады также будет отправлен на вашу электронную почту.
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Это окно можно закрыть.</p>
          </div>
        ) : tasksLoading ? (
          <div className="bg-white rounded-3xl shadow-md border border-orange-100 p-12 flex items-center justify-center gap-3 text-gray-400">
            <svg className="animate-spin h-6 w-6 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Загружаем задания...
          </div>
        ) : !paymentId ? (
          <div className="bg-white rounded-3xl shadow-md border border-red-100 p-12 text-center text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-gray-600">Доступ к заданиям недоступен</p>
            <p className="text-sm mt-1">Пожалуйста, оплатите участие и перейдите по ссылке из письма.</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md border border-orange-100 p-12 text-center text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-gray-600">Задания ещё не опубликованы</p>
            <p className="text-sm mt-1">Вернитесь позже — организаторы добавят задания перед началом олимпиады.</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* Карта вопросов + прогресс */}
            <div ref={taskCardRef} className="bg-white rounded-3xl shadow-sm border border-orange-100 p-5 space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Вопрос <span className="font-bold text-gray-800">{currentIndex + 1}</span> из {total}</span>
                <span className="text-orange-500 font-medium">{answered} отвечено</span>
              </div>
              <div className="w-full bg-orange-100 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }}
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
                      className={`w-9 h-9 rounded-full text-xs font-bold transition-all border-2 ${
                        isCurrent
                          ? 'bg-orange-500 text-white border-orange-500 scale-110 shadow-md'
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

            {/* Текущее задание */}
            {task && (
              <div className="bg-white rounded-3xl shadow-md border border-orange-100 overflow-hidden">
                <div className="px-6 py-4 bg-orange-50 flex items-center gap-3">
                  <span className="w-9 h-9 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {currentIndex + 1}
                  </span>
                  <div>
                    <p className="font-bold text-gray-800">{task.question || task.title}</p>
                    {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                  </div>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {task.task_type === 'wordsearch' ? (
                    <WordSearchWidget
                      taskId={task.id}
                      words={task.options || []}
                      onComplete={handleWordSearchComplete}
                      isCompleted={answers[task.id] === '__wordsearch_done__'}
                      studyYear={studyYearParam ? parseInt(studyYearParam) : undefined}
                    />
                  ) : task.task_type === 'matching' ? (
                    <MatchingWidget
                      taskId={task.id}
                      pairs={(task.options || []).map(opt => { const [left, right, imageUrl] = opt.split('|'); return { left: left || '', right: right || '', imageUrl: imageUrl || undefined }; })}
                      onComplete={(id, answer) => { setAnswers(prev => ({ ...prev, [id]: answer })); }}
                      isCompleted={!!answers[task.id] && answers[task.id] !== ''}
                    />
                  ) : (<>
                    {task.image_url && (
                      <div className="flex justify-center">
                        <img src={task.image_url} alt={task.title} className="max-w-full max-h-72 rounded-2xl border border-orange-100 object-contain" />
                      </div>
                    )}
                    {task.options && task.options.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Выберите ответ:</p>
                        {task.options.map((opt, i) => {
                          const label = OPTION_LABELS[i] || String(i + 1);
                          const isSelected = answers[task.id] === opt;
                          return (
                            <button key={i} onClick={() => handleAnswer(task.id, opt)}
                              className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50'}`}
                            >
                              <span className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'}`}>{label}</span>
                              <span className={`text-sm leading-relaxed pt-1 ${isSelected ? 'text-orange-800 font-medium' : 'text-gray-700'}`}>{opt}</span>
                              {isSelected && <Icon name="Check" size={18} className="text-orange-500 ml-auto flex-shrink-0 mt-1" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>)}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-orange-50 flex items-center justify-between gap-3">
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

            {/* Кнопка отправки */}
            <div>
              <Button
                onClick={handleSubmit}
                disabled={submitting || answered === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-2xl py-6 text-base font-bold flex items-center justify-center gap-2"
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
                    {answered > 0 && (
                      <span className="ml-1 text-green-200 font-normal text-sm">({answered}/{total})</span>
                    )}
                  </>
                )}
              </Button>
              {answered === 0 && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  Ответьте хотя бы на один вопрос, чтобы отправить
                </p>
              )}
              {answered > 0 && answered < total && (
                <p className="text-center text-xs text-amber-600 mt-2">
                  Вы ответили на {answered} из {total} вопросов. Можно отправить частично.
                </p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default OlympiadTasks;