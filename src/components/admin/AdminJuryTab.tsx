import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import func2url from "../../../backend/func2url.json";

const URL = func2url["jury-applications"];

interface Rating {
  work_id: number;
  image_url: string;
  age: string;
  study_year: string | null;
  work_title?: string | null;
  place: string;
  place_label: string;
}

interface JuryApplication {
  id: number;
  full_name: string;
  position: string;
  institution: string;
  location: string;
  email: string;
  contest_name: string;
  ratings: Rating[];
  price: number;
  payment_status: string;
  payment_id: string | null;
  created_at: string;
  participation_date: string | null;
  is_viewed: boolean;
}

export default function AdminJuryTab({ onNewCountChange }: { onNewCountChange?: (n: number) => void }) {
  const { toast } = useToast();
  const [items, setItems] = useState<JuryApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [contestFilter, setContestFilter] = useState("");
  const [onlyNew, setOnlyNew] = useState(false);

  useEffect(() => {
    fetch(`${URL}?action=list`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
    fetch(`${URL}?action=price`)
      .then((r) => r.json())
      .then((data) => setPrice(String(data.price ?? "")));
  }, []);

  const markViewed = async (id: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_viewed: true } : i)));
    await fetch(`${URL}?action=view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const contestNames = Array.from(new Set(items.map((i) => i.contest_name))).sort();

  const filteredItems = items.filter((i) => {
    if (search.trim() && !i.full_name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (contestFilter && i.contest_name !== contestFilter) return false;
    if (onlyNew && i.is_viewed) return false;
    return true;
  });

  const newCount = items.filter((i) => !i.is_viewed).length;

  useEffect(() => {
    if (!loading) onNewCountChange?.(newCount);
  }, [newCount, loading]);

  const savePrice = async () => {
    setSaving(true);
    const res = await fetch(`${URL}?action=price`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: Number(price) }),
    });
    setSaving(false);
    toast(
      res.ok
        ? { title: "Стоимость сохранена" }
        : { title: "Не удалось сохранить", variant: "destructive" }
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-8 p-4 rounded-2xl border-2 border-gray-100 bg-white">
        <div>
          <label className="text-sm font-semibold block mb-1">Стоимость заявки на жюри, ₽</label>
          <Input
            type="number"
            min={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-40"
          />
        </div>
        <Button onClick={savePrice} disabled={saving || !price}>
          <Icon name="Save" className="mr-2" size={16} />
          Сохранить
        </Button>
      </div>

      <h2 className="text-2xl font-heading font-bold mb-4">Заявки на жюри ({items.length}){newCount > 0 && <span className="ml-3 text-red-500">новых: {newCount}</span>}</h2>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Input
          placeholder="Поиск по ФИО"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <select
          value={contestFilter}
          onChange={(e) => setContestFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm max-w-xs"
        >
          <option value="">Все конкурсы</option>
          {contestNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <input type="checkbox" checked={onlyNew} onChange={(e) => setOnlyNew(e.target.checked)} />
          Только новые
        </label>
        {(search || contestFilter || onlyNew) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setContestFilter("");
              setOnlyNew(false);
            }}
          >
            <Icon name="X" size={14} className="mr-1" />
            Сбросить
          </Button>
        )}
      </div>

      {loading && <Icon name="Loader2" size={32} className="animate-spin text-primary" />}
      {!loading && items.length === 0 && <p className="text-muted-foreground">Заявок пока нет</p>}
      {!loading && items.length > 0 && filteredItems.length === 0 && (
        <p className="text-muted-foreground">По выбранным условиям заявок нет</p>
      )}

      <div className="flex flex-col gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className={`p-5 rounded-2xl border-2 bg-white shadow-sm ${item.is_viewed ? "border-gray-100" : "border-red-300"}`}>
            <div className="flex flex-wrap justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <p className="font-heading font-bold text-lg">{item.full_name}</p>
                {!item.is_viewed && (
                  <>
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">Новая</span>
                    <Button size="sm" variant="outline" onClick={() => markViewed(item.id)}>
                      <Icon name="Check" size={14} className="mr-1" />
                      Просмотрена
                    </Button>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(item.created_at).toLocaleString("ru-RU")}
              </p>
            </div>
            <div className="grid gap-1 text-sm mb-4 sm:grid-cols-2">
              <p><span className="text-muted-foreground">Должность:</span> {item.position}</p>
              <p><span className="text-muted-foreground">Учреждение:</span> {item.institution}</p>
              <p><span className="text-muted-foreground">Страна / населённый пункт:</span> {item.location}</p>
              <p><span className="text-muted-foreground">Email:</span> {item.email}</p>
              <p>
                <span className="text-muted-foreground">Дата участия в жюри:</span>{" "}
                {item.participation_date ? new Date(item.participation_date).toLocaleDateString("ru-RU") : "—"}
              </p>
              <p><span className="text-muted-foreground">Конкурс:</span> {item.contest_name}</p>
              <p>
                <span className="text-muted-foreground">Оплата:</span> {item.price} ₽,{" "}
                {item.payment_status === "paid" ? "оплачено" : item.payment_status}
              </p>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {item.ratings.map((r, i) => (
                <div key={r.work_id} className="rounded-xl border border-gray-200 p-2 text-xs">
                  <a href={r.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={r.image_url} alt={`Работа ${i + 1}`} className="w-full h-28 object-contain bg-gray-50 rounded-lg" />
                  </a>
                  <p className="mt-2 font-bold text-sm">{r.place_label}</p>
                  {r.work_title && <p className="text-muted-foreground">Название: {r.work_title}</p>}
                  <p className="text-muted-foreground">Возраст: {r.age || "—"}</p>
                  <p className="text-muted-foreground">Год обучения: {r.study_year || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
