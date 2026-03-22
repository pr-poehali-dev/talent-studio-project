import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const CONTESTS_API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
const UPLOAD_FILE_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
const SUBMIT_APPLICATION_URL = "https://functions.poehali.dev/2d352955-9c6c-4bbb-ad1e-944c7ea04d84";
const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
const MAX_FILE_SIZE = 15 * 1024 * 1024;

interface Contest {
  id: number;
  title: string;
  status: string;
}

interface Participant {
  id: string;
  fullName: string;
  age: string;
  contestId: string;
  workTitle: string;
  file: File | null;
  uploading: boolean;
  uploadProgress: number;
  fileUrl: string;
}

function makeParticipant(): Participant {
  return {
    id: crypto.randomUUID(),
    fullName: "",
    age: "",
    contestId: "",
    workTitle: "",
    file: null,
    uploading: false,
    uploadProgress: 0,
    fileUrl: "",
  };
}

export default function CollectiveFree() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [contests, setContests] = useState<Contest[]>([]);
  const [teacher, setTeacher] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([makeParticipant()]);
  const [galleryConsent, setGalleryConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(SETTINGS_API_URL).then((r) => r.json()),
      fetch(CONTESTS_API_URL).then((r) => r.json()),
    ])
      .then(([settings, contestsData]) => {
        setEnabled(settings.collective_free_enabled === "true");
        setContests(
          Array.isArray(contestsData)
            ? contestsData.filter((c: Contest) => c.status === "active")
            : []
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateParticipant = (id: string, patch: Partial<Participant>) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeParticipant = (id: string) => {
    if (participants.length === 1) return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const uploadFile = async (participantId: string, file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Файл слишком большой",
        description: `Максимальный размер — 15 МБ. Ваш файл: ${(file.size / 1024 / 1024).toFixed(1)} МБ`,
        variant: "destructive",
      });
      return;
    }

    updateParticipant(participantId, { file, uploading: true, uploadProgress: 0, fileUrl: "" });

    try {
      const CHUNK_SIZE = 2 * 1024 * 1024;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadId = "";
      let fileUrl = "";

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const chunk = file.slice(start, Math.min(start + CHUNK_SIZE, file.size));

        const chunkBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = () => reject(new Error("Ошибка чтения файла"));
          reader.readAsDataURL(chunk);
        });

        updateParticipant(participantId, {
          uploadProgress: Math.round(((chunkIndex) / totalChunks) * 90),
        });

        const res = await fetch(UPLOAD_FILE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chunk: chunkBase64,
            chunkIndex,
            totalChunks,
            fileName: file.name,
            fileType: file.type,
            folder: "collective",
            uploadId: uploadId || undefined,
          }),
        });

        if (!res.ok) throw new Error("Ошибка загрузки файла");

        const result = await res.json();
        if (!uploadId) uploadId = result.uploadId;
        if (result.complete) fileUrl = result.url;
      }

      updateParticipant(participantId, { fileUrl, uploading: false, uploadProgress: 100 });
    } catch (err) {
      updateParticipant(participantId, { uploading: false, uploadProgress: 0, file: null });
      toast({ title: "Ошибка загрузки", description: String(err), variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacher.trim()) return toast({ title: "Укажите педагога", variant: "destructive" });
    if (!institution.trim()) return toast({ title: "Укажите учреждение", variant: "destructive" });
    if (!email.trim()) return toast({ title: "Укажите электронную почту", variant: "destructive" });
    if (!termsConsent)
      return toast({
        title: "Необходимо согласиться с обработкой персональных данных",
        variant: "destructive",
      });

    for (const [i, p] of participants.entries()) {
      if (!p.fullName.trim())
        return toast({ title: `Участник ${i + 1}: укажите ФИО`, variant: "destructive" });
      if (!p.age || isNaN(Number(p.age)))
        return toast({ title: `Участник ${i + 1}: укажите возраст`, variant: "destructive" });
      if (!p.contestId)
        return toast({ title: `Участник ${i + 1}: выберите конкурс`, variant: "destructive" });
      if (!p.workTitle.trim())
        return toast({ title: `Участник ${i + 1}: укажите название работы`, variant: "destructive" });
      if (!p.fileUrl)
        return toast({ title: `Участник ${i + 1}: загрузите файл работы`, variant: "destructive" });
    }

    setSubmitting(true);

    try {
      for (const p of participants) {
        const contestName = contests.find((c) => String(c.id) === p.contestId)?.title || "";
        const res = await fetch(SUBMIT_APPLICATION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: p.fullName,
            age: Number(p.age),
            teacher,
            institution,
            email,
            contest_name: contestName,
            work_title: p.workTitle,
            work_file_url: p.fileUrl,
            gallery_consent: galleryConsent,
            is_collective: true,
          }),
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Ошибка при сохранении заявки");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      toast({ title: "Ошибка", description: String(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Icon name="Lock" size={48} className="text-muted-foreground" />
        <h1 className="text-2xl font-bold text-muted-foreground">Страница недоступна</h1>
        <p className="text-muted-foreground">Приём коллективных заявок без оплаты временно закрыт.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          На главную
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <Icon name="CheckCircle" size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Заявки успешно поданы!</h1>
        <p className="text-muted-foreground max-w-md">
          Заявки на {participants.length} {participants.length === 1 ? "участника" : "участников"} успешно приняты.
        </p>
        <Button onClick={() => navigate("/")}>На главную</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFFBDB, #FEFEFE)" }}>
      <div
        className="sticky top-0 z-10 backdrop-blur-md shadow-sm"
        style={{ background: "linear-gradient(to right, #FEFEFE, #FFFBDB)" }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <Icon name="ArrowLeft" size={18} />
            На главную
          </Button>
          <h1 className="font-bold text-lg" style={{ color: "var(--primary, #E31E24)" }}>
            Коллективная заявка
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Данные педагога */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Icon name="User" size={18} />
                Данные педагога
              </h2>
              <div className="space-y-1">
                <Label htmlFor="teacher">Педагог *</Label>
                <Input
                  id="teacher"
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                  placeholder="ФИО педагога"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="institution">Учреждение *</Label>
                <Input
                  id="institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Название учреждения"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Электронная почта *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="rounded-xl"
                />
              </div>
            </CardContent>
          </Card>

          {/* Участники */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Icon name="Users" size={18} />
                Участники ({participants.length})
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setParticipants((prev) => [...prev, makeParticipant()])}
              >
                <Icon name="Plus" size={16} className="mr-1" />
                Добавить
              </Button>
            </div>

            {participants.map((p, i) => (
              <Card key={p.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-muted-foreground">
                      Участник {i + 1}
                    </span>
                    {participants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeParticipant(p.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label>ФИО *</Label>
                      <Input
                        value={p.fullName}
                        onChange={(e) => updateParticipant(p.id, { fullName: e.target.value })}
                        placeholder="Фамилия Имя Отчество"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Возраст *</Label>
                      <Input
                        type="number"
                        value={p.age}
                        onChange={(e) => updateParticipant(p.id, { age: e.target.value })}
                        placeholder="Лет"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Конкурс *</Label>
                      <Select
                        value={p.contestId}
                        onValueChange={(v) => updateParticipant(p.id, { contestId: v })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Выберите конкурс" />
                        </SelectTrigger>
                        <SelectContent>
                          {contests.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label>Название творческой работы *</Label>
                      <Input
                        value={p.workTitle}
                        onChange={(e) => updateParticipant(p.id, { workTitle: e.target.value })}
                        placeholder="Название работы"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label>Файл работы * (JPG, PNG, PDF, до 15 МБ)</Label>
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        disabled={p.uploading}
                        className="rounded-xl"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadFile(p.id, file);
                        }}
                      />
                      {p.uploading && (
                        <div className="space-y-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${p.uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Загрузка... {p.uploadProgress}%
                          </p>
                        </div>
                      )}
                      {p.fileUrl && !p.uploading && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <Icon name="CheckCircle" size={14} />
                          Файл загружен
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Согласия */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="gallery"
                  checked={galleryConsent}
                  onCheckedChange={(v) => setGalleryConsent(!!v)}
                  className="mt-0.5"
                />
                <Label htmlFor="gallery" className="text-sm leading-relaxed cursor-pointer">
                  Согласен(а) на публикацию работ участников в галерее конкурса
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={termsConsent}
                  onCheckedChange={(v) => setTermsConsent(!!v)}
                  className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  Согласен(а) с условиями участия и политикой обработки персональных данных *
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full rounded-xl h-12 text-base font-semibold"
            disabled={submitting || participants.some((p) => p.uploading)}
          >
            {submitting ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Отправляем заявки...
              </>
            ) : (
              <>
                <Icon name="Send" size={18} className="mr-2" />
                Подать заявки ({participants.length}{" "}
                {participants.length === 1 ? "участник" : "участников"})
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}