import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import JuryEditForm, { JuryEditValues } from "./JuryEditForm";
import func2url from "../../../backend/func2url.json";

const URL = func2url["jury-applications"];
const UPLOAD_URL = func2url["upload-file"];
const SETTINGS_URL = func2url["site-settings"];

const PLACE_LABELS: Record<string, string> = {
  grand_prix: "Гран-при",
  first_degree: "Лауреат 1 степени",
  second_degree: "Лауреат 2 степени",
  third_degree: "Лауреат 3 степени",
};

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
  number: number | null;
  is_published: boolean;
  certificate_url: string | null;
  gender: string | null;
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

  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [sampleUrl, setSampleUrl] = useState("");
  const [sampleUploading, setSampleUploading] = useState(false);

  useEffect(() => {
    fetch(SETTINGS_URL)
      .then((r) => r.json())
      .then((data) => setSampleUrl(data.jury_certificate_sample_url || ""))
      .catch(() => setSampleUrl(""));
  }, []);

  const saveSample = async (url: string) => {
    const res = await fetch(SETTINGS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "jury_certificate_sample_url", value: url }),
    });
    if (res.ok) {
      setSampleUrl(url);
      toast({ title: url ? "Образец сертификата сохранён" : "Образец удалён" });
    } else {
      toast({ title: "Не удалось сохранить", variant: "destructive" });
    }
  };

  const uploadSample = (file: File) => {
    setSampleUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result?.toString().split(",")[1];
        const res = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chunk: base64,
            chunkIndex: 0,
            totalChunks: 1,
            uploadId: crypto.randomUUID(),
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            folder: "jury-certificates",
          }),
        });
        const data = await res.json();
        if (data.url) await saveSample(data.url);
        else toast({ title: data.error || "Не удалось загрузить файл", variant: "destructive" });
      } catch {
        toast({ title: "Ошибка соединения", variant: "destructive" });
      } finally {
        setSampleUploading(false);
      }
    };
    reader.onerror = () => {
      toast({ title: "Не удалось прочитать файл", variant: "destructive" });
      setSampleUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const savePublish = async (id: number, is_published: boolean, certificate_url: string | null) => {
    const res = await fetch(`${URL}?action=publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_published, certificate_url }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({ title: data.error || "Не удалось сохранить", variant: "destructive" });
      return false;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_published, certificate_url } : i)));
    return true;
  };

  const saveGender = async (id: number, gender: string) => {
    const res = await fetch(`${URL}?action=gender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, gender }),
    });
    if (!res.ok) {
      toast({ title: "Не удалось сохранить пол", variant: "destructive" });
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, gender } : i)));
    toast({ title: "Пол сохранён" });
  };

  const [editingId, setEditingId] = useState<number | null>(null);

  const saveEdit = async (id: number, values: JuryEditValues) => {
    const res = await fetch(`${URL}?action=update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...values }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast({ title: data.error || "Не удалось сохранить", variant: "destructive" });
      return false;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, ...values, participation_date: values.participation_date || null } : i
      )
    );
    toast({ title: "Заявка обновлена" });
    return true;
  };

  const uploadCertificate = (item: JuryApplication, file: File) => {
    setUploadingId(item.id);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result?.toString().split(",")[1];
        const res = await fetch(UPLOAD_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chunk: base64,
            chunkIndex: 0,
            totalChunks: 1,
            uploadId: crypto.randomUUID(),
            fileName: file.name,
            fileType: file.type || "application/octet-stream",
            folder: "jury-certificates",
          }),
        });
        const data = await res.json();
        if (data.url) {
          if (await savePublish(item.id, item.is_published, data.url)) toast({ title: "Сертификат загружен" });
        } else {
          toast({ title: data.error || "Не удалось загрузить файл", variant: "destructive" });
        }
      } catch {
        toast({ title: "Ошибка соединения", variant: "destructive" });
      } finally {
        setUploadingId(null);
      }
    };
    reader.onerror = () => {
      toast({ title: "Не удалось прочитать файл", variant: "destructive" });
      setUploadingId(null);
    };
    reader.readAsDataURL(file);
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

      <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-2xl border-2 border-gray-100 bg-white">
        <label className="text-sm font-semibold">Образец сертификата для страницы заявки:</label>
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          disabled={sampleUploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadSample(f);
            e.target.value = "";
          }}
          className="w-64 h-10"
        />
        {sampleUploading && <Icon name="Loader2" className="animate-spin" size={16} />}
        {sampleUrl && (
          <>
            <a href={sampleUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
              <Icon name="ExternalLink" size={14} />
              Открыть образец
            </a>
            <Button variant="ghost" size="sm" onClick={() => saveSample("")}>
              <Icon name="Trash2" size={14} className="mr-1" />
              Удалить
            </Button>
          </>
        )}
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
                <span className="px-2.5 py-0.5 rounded-lg bg-gray-900 text-white text-sm font-bold">№ {item.number}</span>
                <p className="font-heading font-bold text-lg">{item.full_name}</p>
                {item.is_published && (
                  <span className="px-2 py-0.5 rounded-full bg-green-600 text-white text-xs font-bold">Опубликовано</span>
                )}
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
            {editingId === item.id ? (
              <JuryEditForm
                initial={{
                  full_name: item.full_name,
                  position: item.position,
                  institution: item.institution,
                  location: item.location,
                  email: item.email,
                  contest_name: item.contest_name,
                  participation_date: item.participation_date ? item.participation_date.slice(0, 10) : "",
                }}
                onSave={(v) => saveEdit(item.id, v)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <Button size="sm" variant="outline" className="mb-3" onClick={() => setEditingId(item.id)}>
                <Icon name="Pencil" size={14} className="mr-1" />
                Редактировать
              </Button>
            )}
            <div className="grid gap-1 text-sm mb-4 sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground">Пол:</span>
                <select
                  value={item.gender || ""}
                  onChange={(e) => e.target.value && saveGender(item.id, e.target.value)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="">не указан</option>
                  <option value="M">М</option>
                  <option value="F">Ж</option>
                </select>
              </p>
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
            <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">Сертификат:</label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  disabled={uploadingId === item.id}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadCertificate(item, f);
                    e.target.value = "";
                  }}
                  className="w-64 h-10"
                />
                {uploadingId === item.id && <Icon name="Loader2" className="animate-spin" size={16} />}
              </div>
              {item.certificate_url && (
                <a href={item.certificate_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <Icon name="ExternalLink" size={14} />
                  Открыть файл
                </a>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm font-semibold">Статус:</label>
                <select
                  value={item.is_published ? "published" : "draft"}
                  onChange={async (e) => {
                    const publish = e.target.value === "published";
                    if (publish && !item.gender) {
                      toast({ title: "Сначала укажите пол", variant: "destructive" });
                      return;
                    }
                    if (publish && !item.certificate_url) {
                      toast({ title: "Сначала прикрепите файл сертификата", variant: "destructive" });
                      return;
                    }
                    if (await savePublish(item.id, publish, item.certificate_url)) {
                      toast({ title: publish ? "Опубликовано на сайте" : "Снято с публикации" });
                    }
                  }}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="draft">Не опубликовано</option>
                  <option value="published">Опубликовано</option>
                </select>
              </div>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {item.ratings.map((r, i) => (
                <div key={r.work_id} className="rounded-xl border border-gray-200 p-2 text-xs">
                  <a href={r.image_url} target="_blank" rel="noopener noreferrer">
                    <img src={r.image_url} alt={`Работа ${i + 1}`} className="w-full h-28 object-contain bg-gray-50 rounded-lg" />
                  </a>
                  <p className="mt-2 font-bold text-sm">{PLACE_LABELS[r.place] || r.place_label}</p>
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
