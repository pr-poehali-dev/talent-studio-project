import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const URL = func2url["participants-emails"];

interface Participant {
  email: string;
  sources: string[];
  first_seen: string;
  last_seen: string;
  total_entries: number;
}

type SourceFilter = "all" | "contests" | "olympiads";

export default function AdminParticipantsTab() {
  const [data, setData] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch(URL)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return data.filter((p) => {
      const matchSearch =
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.sources.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchSource =
        sourceFilter === "all" ||
        (sourceFilter === "contests" && p.sources.some((s) => s.startsWith("Конкурс:"))) ||
        (sourceFilter === "olympiads" && p.sources.some((s) => s.startsWith("Олимпиада:")));

      return matchSearch && matchSource;
    });
  }, [data, search, sourceFilter]);

  const contestCount = data.filter((p) => p.sources.some((s) => s.startsWith("Конкурс:"))).length;
  const olympiadCount = data.filter((p) => p.sources.some((s) => s.startsWith("Олимпиада:"))).length;

  const copyAll = () => {
    const emails = filtered.map((p) => p.email).join("\n\n");
    navigator.clipboard.writeText(emails);
  };

  const filterBtns: { label: string; value: SourceFilter; count: number }[] = [
    { label: "Все", value: "all", count: data.length },
    { label: "Конкурсы", value: "contests", count: contestCount },
    { label: "Олимпиады", value: "olympiads", count: olympiadCount },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold">Адреса участников</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Уникальные email-адреса без дублей — {data.length} записей
          </p>
        </div>
        <Button variant="outline" onClick={copyAll} className="gap-2">
          <Icon name="Copy" size={16} />
          Скопировать {filtered.length} адресов
        </Button>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 mb-4">
        {filterBtns.map((f) => (
          <button
            key={f.value}
            onClick={() => setSourceFilter(f.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              sourceFilter === f.value
                ? "bg-primary text-primary-foreground border-primary shadow"
                : "bg-white border-gray-200 text-gray-600 hover:border-primary/40"
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${sourceFilter === f.value ? "bg-white/20" : "bg-gray-100"}`}>
              {f.count}
            </span>
          </button>
        ))}
        <Input
          placeholder="Поиск по email или конкурсу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px]"
        />
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-16">Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">Ничего не найдено</div>
      ) : (
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Участий</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Последний раз</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Тип</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const hasContests = p.sources.some((s) => s.startsWith("Конкурс:"));
                const hasOlympiads = p.sources.some((s) => s.startsWith("Олимпиада:"));
                const isExpanded = expandedEmail === p.email;

                return (
                  <>
                    <tr
                      key={p.email}
                      className={`border-b last:border-0 cursor-pointer hover:bg-gray-50/70 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                      onClick={() => setExpandedEmail(isExpanded ? null : p.email)}
                    >
                      <td className="px-4 py-3 font-mono text-gray-800">{p.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block bg-primary/10 text-primary font-bold text-xs px-2 py-0.5 rounded-full">
                          {p.total_entries}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(p.last_seen).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {hasContests && (
                            <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">Конкурс</span>
                          )}
                          {hasOlympiads && (
                            <span className="text-xs bg-lime-100 text-lime-700 font-semibold px-2 py-0.5 rounded-full">Олимпиада</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${p.email}-expand`} className="bg-blue-50/40 border-b">
                        <td colSpan={5} className="px-6 py-3">
                          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Участвовал в:</p>
                          <div className="flex flex-col gap-1">
                            {p.sources.map((s) => (
                              <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                                <Icon
                                  name={s.startsWith("Олимпиада:") ? "GraduationCap" : "Trophy"}
                                  size={14}
                                  className={s.startsWith("Олимпиада:") ? "text-lime-600" : "text-orange-500"}
                                />
                                {s}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}