import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, BookOpen, ChevronLeft, ChevronRight, Send, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const TASKS_API_URL = "https://functions.poehali.dev/c7eb02a5-bcf1-4ece-91de-d49b4c1e8466";
const ANSWERS_API_URL = "https://functions.poehali.dev/6e919c14-0327-44c1-827b-d524f0192c73";
const UPLOAD_FILE_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
const PROXY_URL = "https://functions.poehali.dev/86688b07-9265-42b9-8dad-f85c7b8b5d6f";

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
const MATCHING_BADGE_COLORS = [
  { bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  { bg: '#dbeafe', text: '#1e3a8a', border: '#93c5fd' },
  { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  { bg: '#fef3c7', text: '#78350f', border: '#fcd34d' },
  { bg: '#ede9fe', text: '#4c1d95', border: '#c4b5fd' },
  { bg: '#cffafe', text: '#164e63', border: '#67e8f9' },
  { bg: '#fce7f3', text: '#831843', border: '#f472b6' },
  { bg: '#ecfccb', text: '#365314', border: '#a3e635' },
];

interface MatchingProps {
  taskId: number;
  pairs: Array<{ left: string; right: string; imageUrl?: string }>;
  onComplete: (taskId: number, answer: string) => void;
  isCompleted: boolean;
}

function MatchingWidget({ taskId, pairs, onComplete, isCompleted }: MatchingProps) {
  // matched: leftIdx -> rightOrigIdx
  const [matched, setMatched] = useState<Record<number, number>>({});
  const [draggingLeft, setDraggingLeft] = useState<number | null>(null);
  const [dragOverRight, setDragOverRight] = useState<number | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  const hasImages = pairs.some(p => p.imageUrl);

  const [shuffledRight] = useState(() => {
    const arr = pairs.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  // shuffledRight[pos] = origIdx
  const rightToOrig = Object.fromEntries(shuffledRight.map((orig, pos) => [pos, orig]));
  // origIdx -> leftIdx (кто занял)
  const origToLeft = Object.fromEntries(Object.entries(matched).map(([l, r]) => [r, Number(l)]));

  useEffect(() => {
    if (Object.keys(matched).length === pairs.length && pairs.length > 0 && !isCompleted) {
      const answerStr = Object.entries(matched).map(([l, r]) => `${l}:${r}`).join(',');
      onComplete(taskId, answerStr);
    }
  }, [matched, pairs.length, taskId, onComplete, isCompleted]);

  const applyMatch = (leftIdx: number, origIdx: number) => {
    const newMatched = { ...matched };
    // Если кто-то уже занял эту правую — освобождаем
    const prevLeft = origToLeft[origIdx];
    if (prevLeft !== undefined) delete newMatched[prevLeft];
    newMatched[leftIdx] = origIdx;
    setMatched(newMatched);
  };

  // === Drag handlers ===
  const onDragStart = (e: React.DragEvent, leftIdx: number) => {
    if (isCompleted) return;
    setDraggingLeft(leftIdx);
    setSelectedLeft(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(leftIdx));
  };

  const onDragEnd = () => {
    setDraggingLeft(null);
    setDragOverRight(null);
  };

  const onDragOver = (e: React.DragEvent, pos: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverRight(pos);
  };

  const onDragLeave = () => setDragOverRight(null);

  const onDrop = (e: React.DragEvent, pos: number) => {
    e.preventDefault();
    const leftIdx = Number(e.dataTransfer.getData('text/plain'));
    const origIdx = rightToOrig[pos];
    applyMatch(leftIdx, origIdx);
    setDraggingLeft(null);
    setDragOverRight(null);
  };

  // === Click fallback ===
  const onLeftClick = (idx: number) => {
    if (isCompleted) return;
    setSelectedLeft(prev => prev === idx ? null : idx);
  };

  const onRightClick = (pos: number) => {
    if (isCompleted || selectedLeft === null) return;
    applyMatch(selectedLeft, rightToOrig[pos]);
    setSelectedLeft(null);
  };

  const matchedCount = Object.keys(matched).length;

  return (
    <div className="space-y-3 select-none">
      <p className="text-xs text-gray-400">
        Перетащи имя художника на нужную картину. Можно перетащить повторно, чтобы исправить.
      </p>

      {!isCompleted && (
        <div className="text-xs text-gray-500 font-medium">
          Соединено пар: <span className="text-orange-500 font-bold">{matchedCount}</span> из {pairs.length}
        </div>
      )}

      <div className="space-y-3">
        {/* Картины — сверху, в сетке */}
        <div className={`grid gap-2 ${pairs.length <= 4 ? 'grid-cols-2' : 'grid-cols-2'}`}>
          {shuffledRight.map((origIdx, pos) => {
            const pair = pairs[origIdx];
            const linkedLeft = origToLeft[origIdx];
            const isLinked = linkedLeft !== undefined;
            const isDragTarget = dragOverRight === pos;
            const color = isLinked ? MATCHING_BADGE_COLORS[linkedLeft % MATCHING_BADGE_COLORS.length] : null;

            return (
              <div
                key={pos}
                onClick={() => onRightClick(pos)}
                onDragOver={e => onDragOver(e, pos)}
                onDragLeave={onDragLeave}
                onDrop={e => onDrop(e, pos)}
                className={`
                  relative rounded-2xl border-2 overflow-hidden transition-all cursor-pointer
                  ${isDragTarget
                    ? 'border-orange-400 shadow-lg shadow-orange-200 scale-[1.03]'
                    : isLinked
                      ? 'shadow-md'
                      : selectedLeft !== null
                        ? 'border-orange-200 hover:border-orange-400'
                        : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                style={
                  isLinked && color
                    ? { borderColor: color.border, backgroundColor: color.bg }
                    : isDragTarget
                      ? { backgroundColor: '#fff7ed' }
                      : { backgroundColor: '#fff' }
                }
              >
                {/* Значок "бросить сюда" */}
                {isDragTarget && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-orange-400/20 backdrop-blur-[1px]">
                    <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">
                      Отпустить здесь
                    </div>
                  </div>
                )}

                {hasImages && pair.imageUrl ? (
                  <>
                    <img
                      src={pair.imageUrl}
                      alt=""
                      className="w-full object-cover"
                      style={{ height: '100px' }}
                      draggable={false}
                    />
                    <div
                      className="px-2 py-1.5 text-xs font-semibold text-center leading-tight"
                      style={isLinked && color ? { color: color.text } : { color: '#6b7280' }}
                    >
                      {pair.right}
                    </div>
                  </>
                ) : (
                  <div
                    className="px-3 py-3 text-sm font-medium text-center leading-snug"
                    style={isLinked && color ? { color: color.text } : { color: '#374151' }}
                  >
                    {pair.right}
                  </div>
                )}

                {/* Бейдж с именем художника если привязан */}
                {isLinked && color && (
                  <div
                    className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm border"
                    style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border }}
                  >
                    {pairs[linkedLeft].left}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Художники — снизу, перетаскиваемые чипы */}
        <div className="flex flex-wrap gap-2 pt-1">
          {pairs.map((pair, idx) => {
            const isLinked = matched[idx] !== undefined;
            const isDragging = draggingLeft === idx;
            const isSelected = selectedLeft === idx;
            const color = MATCHING_BADGE_COLORS[idx % MATCHING_BADGE_COLORS.length];

            return (
              <div
                key={idx}
                draggable={!isCompleted}
                onDragStart={e => onDragStart(e, idx)}
                onDragEnd={onDragEnd}
                onClick={() => onLeftClick(idx)}
                className={`
                  cursor-grab active:cursor-grabbing
                  px-3 py-1.5 rounded-xl border-2 text-xs font-bold
                  transition-all duration-150 select-none
                  ${isDragging ? 'opacity-40 scale-95' : ''}
                  ${isSelected ? 'scale-105 shadow-lg' : 'hover:scale-105 hover:shadow-md'}
                `}
                style={{
                  backgroundColor: color.bg,
                  color: color.text,
                  borderColor: isSelected ? color.text : isLinked ? color.border : color.border,
                  boxShadow: isSelected ? `0 0 0 3px ${color.border}` : undefined,
                  opacity: isDragging ? 0.4 : 1,
                }}
              >
                ☰ {pair.left}
              </div>
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

// ===== Соответствие: название → картина =====
interface PictureMatchingProps {
  taskId: number;
  pairs: Array<{ left: string; right: string; imageUrl?: string }>;
  onComplete: (taskId: number, answer: string) => void;
  isCompleted: boolean;
}

function PictureMatchingWidget({ taskId, pairs, onComplete, isCompleted }: PictureMatchingProps) {
  const [matched, setMatched] = useState<Record<number, number>>({});
  const [draggingLeft, setDraggingLeft] = useState<number | null>(null);
  const [dragOverRight, setDragOverRight] = useState<number | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  const [shuffledRight] = useState(() => {
    const arr = pairs.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  const rightToOrig = Object.fromEntries(shuffledRight.map((orig, pos) => [pos, orig]));
  const origToLeft = Object.fromEntries(Object.entries(matched).map(([l, r]) => [r, Number(l)]));

  useEffect(() => {
    if (Object.keys(matched).length === pairs.length && pairs.length > 0 && !isCompleted) {
      const answerStr = Object.entries(matched).map(([l, r]) => `${l}:${r}`).join(',');
      onComplete(taskId, answerStr);
    }
  }, [matched, pairs.length, taskId, onComplete, isCompleted]);

  const applyMatch = (leftIdx: number, origIdx: number) => {
    const newMatched = { ...matched };
    const prevLeft = origToLeft[origIdx];
    if (prevLeft !== undefined) delete newMatched[prevLeft];
    newMatched[leftIdx] = origIdx;
    setMatched(newMatched);
  };

  const onDragStart = (e: React.DragEvent, leftIdx: number) => {
    if (isCompleted) return;
    setDraggingLeft(leftIdx);
    setSelectedLeft(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(leftIdx));
  };
  const onDragEnd = () => { setDraggingLeft(null); setDragOverRight(null); };
  const onDragOver = (e: React.DragEvent, pos: number) => { e.preventDefault(); setDragOverRight(pos); };
  const onDragLeave = () => setDragOverRight(null);
  const onDrop = (e: React.DragEvent, pos: number) => {
    e.preventDefault();
    const leftIdx = Number(e.dataTransfer.getData('text/plain'));
    applyMatch(leftIdx, rightToOrig[pos]);
    setDraggingLeft(null);
    setDragOverRight(null);
  };
  const onLeftClick = (idx: number) => {
    if (isCompleted) return;
    setSelectedLeft(prev => prev === idx ? null : idx);
  };
  const onRightClick = (pos: number) => {
    if (isCompleted || selectedLeft === null) return;
    applyMatch(selectedLeft, rightToOrig[pos]);
    setSelectedLeft(null);
  };

  const matchedCount = Object.keys(matched).length;

  return (
    <div className="space-y-3 select-none">
      <p className="text-xs text-gray-400">
        Перетащи название на нужную картину или нажми на название, затем на картину.
      </p>
      {!isCompleted && (
        <div className="text-xs text-gray-500 font-medium">
          Соединено пар: <span className="text-orange-500 font-bold">{matchedCount}</span> из {pairs.length}
        </div>
      )}

      {/* Картины сверху — без подписи */}
      <div className="grid grid-cols-2 gap-2">
        {shuffledRight.map((origIdx, pos) => {
          const pair = pairs[origIdx];
          const linkedLeft = origToLeft[origIdx];
          const isLinked = linkedLeft !== undefined;
          const isDragTarget = dragOverRight === pos;
          const color = isLinked ? MATCHING_BADGE_COLORS[linkedLeft % MATCHING_BADGE_COLORS.length] : null;

          return (
            <div
              key={pos}
              onClick={() => onRightClick(pos)}
              onDragOver={e => onDragOver(e, pos)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, pos)}
              className={`relative rounded-2xl border-2 overflow-hidden transition-all cursor-pointer aspect-[4/3]
                ${isDragTarget ? 'border-orange-400 shadow-lg scale-[1.03]' : isLinked ? 'shadow-md' : selectedLeft !== null ? 'border-orange-200 hover:border-orange-400' : 'border-gray-200 hover:border-gray-300'}
              `}
              style={isLinked && color ? { borderColor: color.border } : isDragTarget ? { backgroundColor: '#fff7ed' } : {}}
            >
              {isDragTarget && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-orange-400/20 backdrop-blur-[1px]">
                  <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">Отпустить здесь</div>
                </div>
              )}
              {pair.imageUrl ? (
                <img src={pair.imageUrl} alt="" className="w-full h-full object-cover" draggable={false} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center p-2">{pair.right}</div>
              )}
              {/* Бейдж с названием если привязан */}
              {isLinked && color && (
                <div
                  className="absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px] font-bold text-center truncate border-t-2"
                  style={{ backgroundColor: color.bg, color: color.text, borderColor: color.border }}
                >
                  {pairs[linkedLeft].left}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Названия снизу — перетаскиваемые чипы */}
      <div className="flex flex-wrap gap-2 pt-1">
        {pairs.map((pair, idx) => {
          const isLinked = matched[idx] !== undefined;
          const isDragging = draggingLeft === idx;
          const isSelected = selectedLeft === idx;
          const color = MATCHING_BADGE_COLORS[idx % MATCHING_BADGE_COLORS.length];
          return (
            <div
              key={idx}
              draggable={!isCompleted}
              onDragStart={e => onDragStart(e, idx)}
              onDragEnd={onDragEnd}
              onClick={() => onLeftClick(idx)}
              className="cursor-grab active:cursor-grabbing px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all duration-150 select-none hover:scale-105 hover:shadow-md"
              style={{
                backgroundColor: color.bg,
                color: color.text,
                borderColor: isSelected ? color.text : color.border,
                boxShadow: isSelected ? `0 0 0 3px ${color.border}` : undefined,
                opacity: isDragging ? 0.4 : 1,
              }}
            >
              ☰ {pair.left}
            </div>
          );
        })}
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

// ===== Раскраска =====
const COLORING_COLORS = [
  "#E31E24","#FF6B35","#FFD700","#4CAF50","#2196F3",
  "#9C27B0","#FF69B4","#00BCD4","#795548","#FF9800",
  "#000000","#FFFFFF","#9E9E9E","#8BC34A","#E91E63",
  "#3F51B5","#009688","#CDDC39","#FFC107","#F44336",
];

interface ColoringHandle {
  exportImage: () => Promise<string | null>;
}

interface ColoringProps {
  taskId: number;
  imageUrl: string;
  coloringRef: React.RefObject<ColoringHandle | null>;
}

function ColoringWidget({ imageUrl, coloringRef }: ColoringProps) {
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const catImgEl = useRef<HTMLImageElement | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState("#FFD700");
  const [brushSize, setBrushSize] = useState(18);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [isDrawing, setIsDrawing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgBlobUrl, setImgBlobUrl] = useState<string | null>(null);

  const proxyImgUrl = imageUrl
    ? `${PROXY_URL}?url=${encodeURIComponent(imageUrl)}`
    : '';

  useEffect(() => {
    if (!imageUrl) return;
    fetch(`${PROXY_URL}?url=${encodeURIComponent(imageUrl)}`)
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setImgBlobUrl(url);
        const img = new Image();
        img.onload = () => { catImgEl.current = img; setImgLoaded(true); };
        img.src = url;
      })
      .catch(() => { setImgLoaded(true); });
  }, [imageUrl]);

  // Экспортируем метод получения картинки наружу
  useEffect(() => {
    if (coloringRef) {
      (coloringRef as React.MutableRefObject<ColoringHandle>).current = {
        exportImage: async () => {
          const drawCanvas = drawCanvasRef.current;
          if (!drawCanvas) return null;
          const merged = document.createElement("canvas");
          merged.width = drawCanvas.width;
          merged.height = drawCanvas.height;
          const ctx = merged.getContext("2d");
          if (!ctx) return null;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, merged.width, merged.height);
          if (catImgEl.current) ctx.drawImage(catImgEl.current, 0, 0, merged.width, merged.height);
          ctx.drawImage(drawCanvas, 0, 0);
          return new Promise(res => merged.toBlob(b => {
            if (!b) { res(null); return; }
            const reader = new FileReader();
            reader.onload = () => res((reader.result as string).split(",")[1]);
            reader.readAsDataURL(b);
          }, "image/jpeg", 0.85));
        }
      };
    }
  }, [coloringRef, imgLoaded]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const paintDot = (x: number, y: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.globalAlpha = tool === "eraser" ? 1 : 0.85;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "rgba(0,0,0,1)" : selectedColor;
    ctx.fill();
  };

  const paintLine = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
    ctx.globalAlpha = tool === "eraser" ? 1 : 0.85;
    ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : selectedColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    paintDot(pos.x, pos.y);
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    if (lastPos.current) paintLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y);
    lastPos.current = pos;
  };

  const stopDraw = () => { setIsDrawing(false); lastPos.current = null; };

  const handleReset = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">Раскрась картинку кистью. Раскраска сохранится автоматически при отправке ответов.</p>

      <div className="relative rounded-2xl overflow-hidden border-2 border-orange-100 bg-white"
        style={{ touchAction: 'none' }}>
        <img
          src={imgBlobUrl || proxyImgUrl}
          alt="Раскраска"
          className="block w-full select-none pointer-events-none"
          draggable={false}
          onLoad={() => setImgLoaded(true)}
        />
        {imgLoaded && (
          <canvas
            ref={drawCanvasRef}
            width={700}
            height={700}
            className="absolute top-0 left-0 w-full h-full"
            style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
            onMouseDown={startDraw}
            onMouseMove={moveDraw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={moveDraw}
            onTouchEnd={stopDraw}
          />
        )}
      </div>

      {/* Инструменты */}
      <div className="bg-orange-50 rounded-2xl p-3 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {COLORING_COLORS.map(color => (
            <button
              key={color}
              onClick={() => { setSelectedColor(color); setTool("brush"); }}
              className="w-7 h-7 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0"
              style={{
                backgroundColor: color,
                borderColor: selectedColor === color && tool === "brush" ? "#f97316" : "#e2e8f0",
                boxShadow: selectedColor === color && tool === "brush" ? "0 0 0 2px #f97316" : undefined,
                transform: selectedColor === color && tool === "brush" ? "scale(1.2)" : undefined,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="range" min={4} max={40} value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>
          <button
            onClick={() => setTool(t => t === "eraser" ? "brush" : "eraser")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all flex items-center gap-1 ${tool === "eraser" ? "bg-gray-700 text-white border-gray-700" : "bg-white text-gray-600 border-gray-200"}`}
          >
            <Icon name="Eraser" size={12} />
            Ластик
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border-2 bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600 transition-all flex items-center gap-1"
          >
            <Icon name="RotateCcw" size={12} />
            Очистить
          </button>
        </div>
      </div>
    </div>
  );
}

interface ColorMixProps { taskId: number; options: string[]; onComplete: (taskId: number, answer: string) => void; isCompleted: boolean; existingAnswer?: string; }

function ColorMixWidget({ taskId, options, onComplete, isCompleted, existingAnswer }: ColorMixProps) {
  const [selected, setSelected] = useState<string[]>(() => existingAnswer ? existingAnswer.split(',').filter(Boolean) : []);
  const toggle = (name: string) => {
    if (isCompleted) return;
    setSelected(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name];
      onComplete(taskId, next.sort().join(','));
      return next;
    });
  };
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Выберите нужные цвета:</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => {
          const [name, hex] = opt.includes('||') ? opt.split('||') : [opt, '#cccccc'];
          const isSelected = selected.includes(name);
          return (
            <button key={name} type="button" onClick={() => toggle(name)} disabled={isCompleted}
              className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left ${isSelected ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50'} ${isCompleted ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
            >
              <span className="w-10 h-10 rounded-xl flex-shrink-0 shadow-inner border border-black/10" style={{ backgroundColor: hex }} />
              <span className={`text-sm font-semibold ${isSelected ? 'text-orange-800' : 'text-gray-700'}`}>{name}</span>
              {isSelected && <Icon name="Check" size={16} className="text-orange-500 ml-auto flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && <p className="text-xs text-orange-600 font-medium">Выбрано: {selected.join(', ')}</p>}
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
  const [wasAlreadySubmitted, setWasAlreadySubmitted] = useState(false);

  const taskCardRef = useRef<HTMLDivElement>(null);
  // Refs для ColoringWidget — по taskId
  const coloringRefs = useRef<Record<number, React.RefObject<ColoringHandle | null>>>({});
  // Отслеживаем какие coloring-задания участник уже видел
  const [seenColoring, setSeenColoring] = useState<Set<number>>(new Set());

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
          if (data.already_submitted) {
            setSubmitted(true);
            setWasAlreadySubmitted(true);
          }
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

  // Помечаем coloring-задание как увиденное когда оно становится текущим
  useEffect(() => {
    if (task?.task_type === 'coloring') {
      setSeenColoring(prev => { const next = new Set(prev); next.add(task.id); return next; });
    }
  }, [task?.id, task?.task_type]);

  const answered = tasks.filter(t =>
    answers[t.id] !== undefined || (t.task_type === 'coloring' && seenColoring.has(t.id))
  ).length;

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

      // Сначала загружаем все раскраски на S3
      const coloringTasks = tasks.filter(t => t.task_type === 'coloring');
      for (const ct of coloringTasks) {
        const ref = coloringRefs.current[ct.id];
        const base64 = ref?.current ? await ref.current.exportImage() : null;
        if (base64) {
          try {
            const uploadId = crypto.randomUUID();
            const res = await fetch(UPLOAD_FILE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chunk: base64, chunkIndex: 0, totalChunks: 1,
                fileName: `coloring_${ct.id}_${uploadId}.jpg`,
                fileType: 'image/jpeg',
                folder: 'olympiad-coloring',
                uploadId,
              }),
            });
            const data = await res.json();
            if (data.url) answersPayload[String(ct.id)] = data.url;
            else answersPayload[String(ct.id)] = '__coloring_done__';
          } catch {
            answersPayload[String(ct.id)] = '__coloring_done__';
          }
        } else {
          answersPayload[String(ct.id)] = '__coloring_done__';
        }
      }

      // Остальные ответы
      for (const [taskId, answer] of Object.entries(answers)) {
        if (!answersPayload[taskId]) answersPayload[taskId] = answer;
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
              <h2 className="text-2xl font-bold text-gray-800">
                {wasAlreadySubmitted ? 'Олимпиада уже пройдена!' : 'Ответы отправлены!'}
              </h2>
              <p className="text-gray-500 text-sm">
                {wasAlreadySubmitted
                  ? 'Вы уже отправили ответы. Повторное прохождение недоступно.'
                  : 'Спасибо за участие в олимпиаде!'}
              </p>
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
                  const isAnswered = answers[t.id] !== undefined || (t.task_type === 'coloring' && seenColoring.has(t.id));
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
                  ) : task.task_type === 'picture-matching' ? (
                    <PictureMatchingWidget
                      taskId={task.id}
                      pairs={(task.options || []).map(opt => { const [left, right, imageUrl] = opt.split('|'); return { left: left || '', right: right || '', imageUrl: imageUrl || undefined }; })}
                      onComplete={(id, answer) => { setAnswers(prev => ({ ...prev, [id]: answer })); }}
                      isCompleted={!!answers[task.id] && answers[task.id] !== ''}
                    />
                  ) : task.task_type === 'coloring' ? (
                    <ColoringWidget
                      taskId={task.id}
                      imageUrl={task.image_url || ''}
                      coloringRef={(() => {
                        if (!coloringRefs.current[task.id]) {
                          coloringRefs.current[task.id] = { current: null } as React.RefObject<ColoringHandle | null>;
                        }
                        return coloringRefs.current[task.id];
                      })()}
                    />
                  ) : task.task_type === 'color-mix' ? (
                    <ColorMixWidget
                      taskId={task.id}
                      options={task.options || []}
                      onComplete={(id, answer) => { setAnswers(prev => ({ ...prev, [id]: answer })); }}
                      isCompleted={false}
                      existingAnswer={answers[task.id] || ''}
                    />
                  ) : (<>
                    {task.image_url && (
                      <div className="flex justify-center">
                        <img src={task.image_url} alt={task.title} className="max-w-full max-h-72 rounded-2xl border border-orange-100 object-contain" />
                      </div>
                    )}
                    {task.options && task.options.length > 0 && (() => {
                      const isImageOptions = task.options.some(opt => opt.startsWith('http'));
                      if (isImageOptions) {
                        return (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Выберите ответ:</p>
                            <div className="grid grid-cols-2 gap-3">
                              {task.options.map((opt, i) => {
                                const [imgUrl, label] = opt.includes('||') ? opt.split('||') : [opt, ''];
                                const isSelected = answers[task.id] === opt;
                                return (
                                  <button key={i} onClick={() => handleAnswer(task.id, opt)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50'}`}
                                  >
                                    <img src={imgUrl} alt={label} className="w-full aspect-square object-cover rounded-xl" />
                                    {label && <span className={`text-sm font-semibold ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>{label}</span>}
                                    {isSelected && <Icon name="Check" size={16} className="text-orange-500" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return (
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
                      );
                    })()}
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