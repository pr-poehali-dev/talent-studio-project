import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Trophy, CheckCircle } from "lucide-react";

const WORD_SEARCH_API_URL = "https://functions.poehali.dev/68f0a840-3a59-44e0-b092-f6e6cc9d3633";

const DIRECTIONS = [
  [0, 1],   // →
  [1, 0],   // ↓
  [0, -1],  // ←
  [-1, 0],  // ↑
];

const ALPHABET = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
const GRID_SIZE = 12;

function buildGrid(words: string[]): { grid: string[][], placements: Record<string, [number, number, number, number][]> } {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
  const placements: Record<string, [number, number, number, number][]> = {};

  const sorted = [...words].sort((a, b) => b.length - a.length);

  for (const word of sorted) {
    const upper = word.toUpperCase();
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 300) {
      attempts++;
      const dirIdx = Math.floor(Math.random() * DIRECTIONS.length);
      const [dr, dc] = DIRECTIONS[dirIdx];
      const maxRow = dr === 0 ? GRID_SIZE - 1 : dr > 0 ? GRID_SIZE - upper.length : upper.length - 1;
      const maxCol = dc === 0 ? GRID_SIZE - 1 : dc > 0 ? GRID_SIZE - upper.length : upper.length - 1;
      const minRow = dr < 0 ? upper.length - 1 : 0;
      const minCol = dc < 0 ? upper.length - 1 : 0;
      if (maxRow < minRow || maxCol < minCol) continue;
      const row = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
      const col = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));

      let canPlace = true;
      for (let i = 0; i < upper.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (grid[r][c] !== "" && grid[r][c] !== upper[i]) { canPlace = false; break; }
      }
      if (!canPlace) continue;

      const cells: [number, number, number, number][] = [];
      for (let i = 0; i < upper.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        grid[r][c] = upper[i];
        cells.push([r, c, dr, dc]);
      }
      placements[upper] = cells;
      placed = true;
    }
  }

  // Заполняем пустые ячейки
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, placements };
}

function cellKey(r: number, c: number) { return `${r}-${c}`; }

const FOUND_COLORS = [
  "bg-green-200 text-green-900",
  "bg-blue-200 text-blue-900",
  "bg-purple-200 text-purple-900",
  "bg-pink-200 text-pink-900",
  "bg-yellow-200 text-yellow-900",
  "bg-teal-200 text-teal-900",
  "bg-orange-200 text-orange-900",
  "bg-red-200 text-red-900",
  "bg-indigo-200 text-indigo-900",
  "bg-emerald-200 text-emerald-900",
];

export default function WordSearchGame() {
  const [searchParams] = useSearchParams();
  const puzzleId = searchParams.get("id") || "";

  const [title, setTitle] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][]>([]);
  const [placements, setPlacements] = useState<Record<string, [number, number, number, number][]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Record<string, number>>({}); // cellKey -> colorIdx
  const [selecting, setSelecting] = useState(false);
  const [selection, setSelection] = useState<[number, number][]>([]);
  const [startCell, setStartCell] = useState<[number, number] | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [finished, setFinished] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!puzzleId) { setError("Не указан ID искалки"); setLoading(false); return; }
    fetch(`${WORD_SEARCH_API_URL}?id=${puzzleId}&admin=true`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const puzzle = list.find((p: { id: number }) => String(p.id) === puzzleId);
        if (!puzzle) { setError("Задание не найдено"); return; }
        setTitle(puzzle.title);
        const w: string[] = (puzzle.words || []).map((x: string) => x.toUpperCase());
        setWords(w);
        const { grid: g, placements: pl } = buildGrid(w);
        setGrid(g);
        setPlacements(pl);
      })
      .catch(() => setError("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [puzzleId]);

  useEffect(() => {
    if (words.length > 0 && foundWords.length === words.length) {
      setTimeout(() => setFinished(true), 400);
    }
  }, [foundWords, words]);

  const getCellFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): [number, number] | null => {
    const touch = "touches" in e ? e.touches[0] || e.changedTouches[0] : null;
    const clientX = touch ? touch.clientX : (e as React.MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as React.MouseEvent).clientY;
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const r = el.getAttribute("data-row");
    const c = el.getAttribute("data-col");
    if (r === null || c === null) return null;
    return [parseInt(r), parseInt(c)];
  }, []);

  const getLineCells = (start: [number, number], end: [number, number]): [number, number][] => {
    const dr = end[0] - start[0];
    const dc = end[1] - start[1];
    const len = Math.max(Math.abs(dr), Math.abs(dc));
    if (len === 0) return [start];
    const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
    const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
    if (Math.abs(dr) !== 0 && Math.abs(dc) !== 0) return [start];
    const cells: [number, number][] = [];
    for (let i = 0; i <= len; i++) {
      cells.push([start[0] + stepR * i, start[1] + stepC * i]);
    }
    return cells;
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const cell = getCellFromEvent(e);
    if (!cell) return;
    setSelecting(true);
    setStartCell(cell);
    setSelection([cell]);
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!selecting || !startCell) return;
    const cell = getCellFromEvent(e);
    if (!cell) return;
    setSelection(getLineCells(startCell, cell));
  };

  const onPointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setSelecting(false);
    if (selection.length < 2) { setSelection([]); setStartCell(null); return; }

    const selected = selection.map(([r, c]) => grid[r][c]).join("");
    const selectedRev = [...selection].reverse().map(([r, c]) => grid[r][c]).join("");

    let matchWord: string | null = null;
    for (const word of words) {
      if (!foundWords.includes(word) && (word === selected || word === selectedRev)) {
        matchWord = word;
        break;
      }
    }

    if (matchWord) {
      const colorIdx = foundWords.length % FOUND_COLORS.length;
      const newFoundCells = { ...foundCells };
      selection.forEach(([r, c]) => { newFoundCells[cellKey(r, c)] = colorIdx; });
      setFoundCells(newFoundCells);
      setFoundWords((p) => [...p, matchWord!]);
    } else {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 400);
    }

    setSelection([]);
    setStartCell(null);
  };

  const selectionSet = new Set(selection.map(([r, c]) => cellKey(r, c)));

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
      <div className="text-gray-400 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-300 border-t-orange-500 rounded-full mx-auto mb-3" />
        Загружаем задание...
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-md border border-red-100 p-10 text-center max-w-sm">
        <p className="font-semibold text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-6 px-3 select-none">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Шапка */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium">Задание — Искалка слов</p>
            <p className="font-bold text-gray-800">{title}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400">Найдено</p>
            <p className="font-bold text-orange-500">{foundWords.length}/{words.length}</p>
          </div>
        </div>

        {/* Завершено */}
        {finished && (
          <div className="bg-white rounded-3xl shadow-md border border-green-100 p-8 text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Все слова найдены!</h2>
            <p className="text-gray-500 text-sm">Отличная работа! Ты нашёл все {words.length} слов.</p>
          </div>
        )}

        {/* Слова для поиска */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Найди эти слова:</p>
          <div className="flex flex-wrap gap-2">
            {words.map((word) => {
              const found = foundWords.includes(word);
              const colorIdx = foundWords.indexOf(word);
              return (
                <span
                  key={word}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    found
                      ? `${FOUND_COLORS[colorIdx % FOUND_COLORS.length]} border-transparent line-through opacity-60`
                      : "bg-white text-gray-700 border-gray-200"
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        {/* Сетка */}
        <div
          ref={gridRef}
          className={`bg-white rounded-3xl shadow-sm border border-orange-100 p-3 overflow-auto transition-all ${wrongFlash ? "ring-2 ring-red-300" : ""}`}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onPointerDown}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
        >
          <div
            className="grid gap-0.5 mx-auto"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, width: "100%", maxWidth: 560 }}
          >
            {grid.map((row, r) =>
              row.map((letter, c) => {
                const key = cellKey(r, c);
                const isSelecting = selectionSet.has(key);
                const foundColorIdx = foundCells[key];
                const isFound = foundColorIdx !== undefined;

                let cellClass = "bg-gray-50 text-gray-700";
                if (isFound) cellClass = FOUND_COLORS[foundColorIdx % FOUND_COLORS.length];
                if (isSelecting) cellClass = "bg-orange-400 text-white scale-110 shadow-sm z-10";

                return (
                  <div
                    key={key}
                    data-row={r}
                    data-col={c}
                    className={`aspect-square flex items-center justify-center rounded-md text-xs font-bold cursor-default transition-all relative ${cellClass}`}
                    style={{ fontSize: "clamp(9px, 2.2vw, 14px)" }}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 pb-2">
          Проведи пальцем или мышью по буквам, чтобы выделить слово
        </p>
      </div>
    </div>
  );
}