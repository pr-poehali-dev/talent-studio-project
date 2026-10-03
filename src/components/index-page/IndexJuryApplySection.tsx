import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import func2url from "../../../backend/func2url.json";

const JURY_API_URL = func2url["jury-applications"];
const SETTINGS_URL = func2url["site-settings"];

const PLACES = [
  { value: "grand_prix", label: "Гран-при" },
  { value: "first_degree", label: "Лауреат 1 степени" },
  { value: "second_degree", label: "Лауреат 2 степени" },
  { value: "third_degree", label: "Лауреат 3 степени" },
];

interface ContestOption {
  id: number;
  title: string;
  category_name: string;
}

interface Work {
  id: number;
  image_url: string;
  age: string;
  study_year: string | null;
  work_title: string | null;
}

const IndexJuryApplySection = () => {
  const { toast } = useToast();
  const [contests, setContests] = useState<ContestOption[]>([]);
  const [contestId, setContestId] = useState("");
  const [works, setWorks] = useState<Work[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);
  const [places, setPlaces] = useState<Record<number, string>>({});
  const [price, setPrice] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [zoomWork, setZoomWork] = useState<Work | null>(null);
  const [sampleUrl, setSampleUrl] = useState("");
  const [sampleZoom, setSampleZoom] = useState(false);
  const isPaid = new URLSearchParams(window.location.search).get("paid") === "1";
  const [form, setForm] = useState({
    full_name: "",
    position: "",
    institution: "",
    location: "",
    email: "",
    participation_date: "",
  });

  useEffect(() => {
    fetch(`${JURY_API_URL}?action=contests`)
      .then((r) => r.json())
      .then((data) => setContests(Array.isArray(data) ? data : []))
      .catch(() => setContests([]));
    fetch(SETTINGS_URL)
      .then((r) => r.json())
      .then((data) => setSampleUrl(data.jury_certificate_sample_url || ""))
      .catch(() => setSampleUrl(""));
    fetch(`${JURY_API_URL}?action=price`)
      .then((r) => r.json())
      .then((data) => setPrice(data.price ?? null))
      .catch(() => setPrice(null));
  }, []);

  const handleContestChange = (value: string) => {
    setContestId(value);
    setWorks([]);
    setPlaces({});
    if (!value) return;
    setWorksLoading(true);
    fetch(`${JURY_API_URL}?action=works&contest_id=${value}`)
      .then((r) => r.json())
      .then((data) => setWorks(Array.isArray(data) ? data : []))
      .catch(() => setWorks([]))
      .finally(() => setWorksLoading(false));
  };

  const categoryGroups = contests.reduce<{ name: string; items: ContestOption[] }[]>((acc, c) => {
    const group = acc.find((g) => g.name === c.category_name);
    if (group) group.items.push(c);
    else acc.push({ name: c.category_name, items: [c] });
    return acc;
  }, []);

  const allRated = works.length === 3 && works.every((w) => places[w.id]);

  const isFormValid = Object.values(form).every((v) => v.trim().length > 0);

  const handleSubmit = async () => {
    if (!allRated || !isFormValid || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(JURY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          contest_id: Number(contestId),
          ratings: works.map((w) => ({ work_id: w.id, place: places[w.id] })),
          return_url: `${window.location.origin}/?section=sostav&paid=1`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        toast({
          title: "Не удалось создать оплату",
          description: data.error || "Попробуйте ещё раз",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Ошибка соединения", description: "Попробуйте ещё раз", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  if (isPaid) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-heading font-bold text-primary">Спасибо, заявка принята!</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h2 className="text-5xl font-heading font-bold text-center mb-4 text-primary">Войти в состав жюри</h2>
      <div className="mb-10 p-6 rounded-2xl border-2 border-orange-100 bg-orange-50/50">
        <h3 className="text-lg font-heading font-bold mb-3">Как войти в состав приглашённого жюри</h3>
        <ol className="list-decimal pl-5 space-y-1.5 text-sm text-foreground">
          <li>Выберите конкурс, в жюри которого хотите войти.</li>
          <li>Оцените три работы наших участников: для каждой выберите место.</li>
          <li>Заполните Ваши данные: ФИО, должность, учреждение, страну или населённый пункт, e-mail и дату участия.</li>
          <li>Оплатите участие и дождитесь подтверждения.</li>
        </ol>
        <p className="mt-4 text-sm">
          Сертификат члена жюри будет доступен на сайте в разделе{" "}
          <a href="/?section=jury#invited-jury" className="text-primary font-semibold underline">
            «Наша команда»
          </a>{" "}
          , а также отправлен на Вашу электронную почту в течение 1–2 дней.
        </p>
        {sampleUrl && (
          <div className="mt-5">
            <p className="text-sm font-semibold mb-2">Образец сертификата</p>
            {/\.pdf(\?.*)?$/i.test(sampleUrl) ? (
              <a
                href={sampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-semibold underline text-sm"
              >
                <Icon name="FileText" size={16} />
                Открыть образец сертификата
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setSampleZoom(true)}
                className="block max-w-sm cursor-zoom-in"
                aria-label="Увеличить образец сертификата"
              >
                <img src={sampleUrl} alt="Образец сертификата" className="w-full rounded-xl border border-gray-200 bg-white" />
              </button>
            )}
          </div>
        )}
      </div>

      <Dialog open={sampleZoom} onOpenChange={setSampleZoom}>
        <DialogContent className="max-w-5xl w-[95vw] p-2">
          <DialogTitle className="sr-only">Образец сертификата</DialogTitle>
          <img src={sampleUrl} alt="Образец сертификата" className="w-full max-h-[85vh] object-contain" />
        </DialogContent>
      </Dialog>

      <div className="mb-10">
        <Label htmlFor="jury-contest" className="text-base font-semibold mb-2 block">
          1. Выберите конкурс
        </Label>
        <select
          id="jury-contest"
          value={contestId}
          onChange={(e) => handleContestChange(e.target.value)}
          className="w-full h-12 rounded-xl border-2 border-input bg-background px-4 text-base"
        >
          <option value="">— Выберите конкурс —</option>
          {categoryGroups.map((group) => (
            <optgroup key={group.name} label={group.name}>
              {group.items.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {worksLoading && (
        <div className="flex justify-center py-10">
          <Icon name="Loader2" size={36} className="animate-spin text-primary" />
        </div>
      )}

      {works.length > 0 && (
        <div className="mb-10">
          <h3 className="text-base font-semibold mb-4">2. Оцените работы и выберите место для каждой</h3>
          <div className="flex flex-col gap-4">
            {works.map((work, index) => (
              <div
                key={work.id}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 border-gray-100 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setZoomWork(work)}
                  className="relative w-full sm:w-64 shrink-0 cursor-zoom-in"
                  aria-label="Увеличить работу"
                >
                  <img
                    src={work.image_url}
                    alt={`Работа ${index + 1}`}
                    className="w-full h-56 object-contain rounded-xl bg-gray-50"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-1.5">
                    <Icon name="ZoomIn" size={16} />
                  </span>
                </button>
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <p className="font-heading font-bold text-lg">Работа {index + 1}</p>
                  <div className="text-sm text-muted-foreground">
                    <p>Название работы: {work.work_title || "—"}</p>
                    <p>Возраст участника: {work.age || "—"}</p>
                    <p>Год обучения: {work.study_year || "—"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PLACES.map((place) => (
                      <button
                        key={place.value}
                        type="button"
                        onClick={() => setPlaces((prev) => ({ ...prev, [work.id]: place.value }))}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                          places[work.id] === place.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-white text-foreground border-gray-200 hover:border-primary"
                        }`}
                      >
                        {place.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!zoomWork} onOpenChange={(open) => !open && setZoomWork(null)}>
        <DialogContent className="max-w-5xl w-[95vw] p-2">
          <DialogTitle className="sr-only">Просмотр работы</DialogTitle>
          {zoomWork && (
            <img
              src={zoomWork.image_url}
              alt={zoomWork.work_title || "Работа"}
              className="w-full max-h-[85vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {allRated && (
        <div className="p-6 rounded-2xl border-2 border-gray-100 bg-white shadow-sm">
          <h3 className="text-base font-semibold mb-4">3. Данные педагога</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="jury-name">ФИО педагога</Label>
              <Input id="jury-name" value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="jury-position">Должность</Label>
              <Input id="jury-position" value={form.position} onChange={(e) => setField("position", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="jury-institution">Учреждение</Label>
              <Input
                id="jury-institution"
                value={form.institution}
                onChange={(e) => setField("institution", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="jury-location">Страна / населённый пункт</Label>
              <Input id="jury-location" value={form.location} onChange={(e) => setField("location", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="jury-date">Дата участия в составе жюри</Label>
              <Input
                id="jury-date"
                type="date"
                value={form.participation_date}
                onChange={(e) => setField("participation_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="jury-email">Электронная почта</Label>
              <Input
                id="jury-email"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            className="w-full mt-6 h-12 text-base font-bold rounded-xl"
          >
            {submitting ? (
              <Icon name="Loader2" size={20} className="animate-spin mr-2" />
            ) : (
              <Icon name="CreditCard" size={20} className="mr-2" />
            )}
            Оплатить{price !== null ? ` — ${price} ₽` : ""}
          </Button>
        </div>
      )}
    </div>
  );
};

export default IndexJuryApplySection;
