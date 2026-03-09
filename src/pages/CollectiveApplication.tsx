import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
const UPLOAD_PRESIGNED_URL = "https://functions.poehali.dev/be7b31ca-63ff-4082-9667-d4ab8c4c7f94";
const COLLECTIVE_PAYMENT_URL = "https://functions.poehali.dev/2d424d6d-1380-426b-9238-6343653c5533";

const PRICE_PER_PARTICIPANT = 200;

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

export default function CollectiveApplication() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [teacher, setTeacher] = useState("");
  const [institution, setInstitution] = useState("");
  const [email, setEmail] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([makeParticipant()]);
  const [galleryConsent, setGalleryConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data: Contest[]) => setContests(data.filter((c) => c.status === "active")))
      .catch(() => {});
  }, []);

  const updateParticipant = (id: string, patch: Partial<Participant>) => {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const uploadFile = async (participantId: string, file: File) => {
    updateParticipant(participantId, { file, uploading: true, uploadProgress: 0 });

    const ext = file.name.split(".").pop() || "bin";
    const filename = `collective/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const presignRes = await fetch(UPLOAD_PRESIGNED_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, content_type: file.type }),
    });
    const { upload_url, public_url } = await presignRes.json();

    const CHUNK = 2 * 1024 * 1024;
    const chunks = Math.ceil(file.size / CHUNK);
    for (let i = 0; i < chunks; i++) {
      const chunk = file.slice(i * CHUNK, (i + 1) * CHUNK);
      await fetch(upload_url, { method: "PUT", body: chunk, headers: { "Content-Type": file.type } });
      updateParticipant(participantId, { uploadProgress: Math.round(((i + 1) / chunks) * 100) });
    }

    updateParticipant(participantId, { fileUrl: public_url, uploading: false, uploadProgress: 100 });
  };

  const totalAmount = participants.length * PRICE_PER_PARTICIPANT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teacher.trim()) return toast({ title: "Укажите педагога", variant: "destructive" });
    if (!institution.trim()) return toast({ title: "Укажите учреждение", variant: "destructive" });
    if (!email.trim()) return toast({ title: "Укажите электронную почту", variant: "destructive" });
    if (!termsConsent) return toast({ title: "Необходимо принять условия", variant: "destructive" });

    for (const [i, p] of participants.entries()) {
      if (!p.fullName.trim()) return toast({ title: `Участник ${i + 1}: укажите ФИО`, variant: "destructive" });
      if (!p.age || isNaN(Number(p.age))) return toast({ title: `Участник ${i + 1}: укажите возраст`, variant: "destructive" });
      if (!p.contestId) return toast({ title: `Участник ${i + 1}: выберите конкурс`, variant: "destructive" });
      if (!p.workTitle.trim()) return toast({ title: `Участник ${i + 1}: укажите название работы`, variant: "destructive" });
      if (!p.fileUrl) return toast({ title: `Участник ${i + 1}: загрузите файл работы`, variant: "destructive" });
    }

    setSubmitting(true);

    try {
      const participantsData = participants.map((p) => ({
        full_name: p.fullName,
        age: Number(p.age),
        contest_id: Number(p.contestId),
        contest_name: contests.find((c) => String(c.id) === p.contestId)?.title || "",
        work_title: p.workTitle,
        work_file_url: p.fileUrl,
        teacher,
        institution,
        email,
        gallery_consent: galleryConsent,
      }));

      const res = await fetch(COLLECTIVE_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          description: `Коллективная заявка: ${participants.length} участн. — ${institution}`,
          email,
          participants: participantsData,
        }),
      });

      const data = await res.json();
      if (data.confirmation_url) {
        window.location.href = data.confirmation_url;
      } else {
        throw new Error(data.error || "Ошибка создания платежа");
      }
    } catch (err: unknown) {
      toast({ title: "Ошибка", description: String(err), variant: "destructive" });
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom, #FFFBDB, #FEFEFE)" }}>
      {/* Шапка */}
      <div className="sticky top-0 z-10 backdrop-blur-md shadow-sm" style={{ background: "linear-gradient(to right, #FEFEFE, #FFFBDB)" }}>
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center gap-2">
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
                <Input id="teacher" value={teacher} onChange={(e) => setTeacher(e.target.value)} placeholder="ФИО педагога" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="institution">Учреждение *</Label>
                <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Название учреждения" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Электронная почта *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
              </div>
            </CardContent>
          </Card>

          {/* Участники */}
          <div className="space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Icon name="Users" size={18} />
              Участники
            </h2>

            {participants.map((p, idx) => (
              <Card key={p.id} className="relative">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-muted-foreground">Участник {idx + 1}</span>
                    {participants.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeParticipant(p.id)} className="text-destructive hover:text-destructive h-7 px-2">
                        <Icon name="Trash2" size={15} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>ФИО *</Label>
                      <Input value={p.fullName} onChange={(e) => updateParticipant(p.id, { fullName: e.target.value })} placeholder="Фамилия Имя Отчество" />
                    </div>
                    <div className="space-y-1">
                      <Label>Возраст *</Label>
                      <Input type="number" min={1} max={99} value={p.age} onChange={(e) => updateParticipant(p.id, { age: e.target.value })} placeholder="Полных лет" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Конкурс *</Label>
                    <Select value={p.contestId} onValueChange={(v) => updateParticipant(p.id, { contestId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите конкурс" />
                      </SelectTrigger>
                      <SelectContent>
                        {contests.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Название творческой работы *</Label>
                    <Input value={p.workTitle} onChange={(e) => updateParticipant(p.id, { workTitle: e.target.value })} placeholder="Название работы" />
                  </div>

                  <div className="space-y-1">
                    <Label>Файл работы *</Label>
                    <input
                      type="file"
                      ref={(el) => { fileRefs.current[p.id] = el; }}
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(p.id, f);
                      }}
                    />
                    {p.fileUrl ? (
                      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        <Icon name="CheckCircle" size={16} />
                        <span className="truncate">{p.file?.name || "Файл загружен"}</span>
                        <Button type="button" variant="ghost" size="sm" className="h-6 px-2 ml-auto text-xs" onClick={() => { updateParticipant(p.id, { fileUrl: "", file: null, uploadProgress: 0 }); if (fileRefs.current[p.id]) fileRefs.current[p.id]!.value = ""; }}>
                          Сменить
                        </Button>
                      </div>
                    ) : p.uploading ? (
                      <div className="p-2 border rounded-lg text-sm text-muted-foreground">
                        <div className="flex justify-between mb-1"><span>Загрузка...</span><span>{p.uploadProgress}%</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${p.uploadProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" className="w-full" onClick={() => fileRefs.current[p.id]?.click()}>
                        <Icon name="Upload" size={16} />
                        Загрузить файл
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setParticipants((prev) => [...prev, makeParticipant()])}
            >
              <Icon name="Plus" size={16} />
              Добавить участника
            </Button>
          </div>

          {/* Согласия */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-accent/10 rounded-xl">
                <Checkbox id="gallery" checked={galleryConsent} onCheckedChange={(v) => setGalleryConsent(Boolean(v))} className="mt-1" />
                <Label htmlFor="gallery" className="text-sm leading-relaxed cursor-pointer">
                  Согласен на публикацию работ в галерее сайта
                </Label>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-accent/10 rounded-xl">
                <Checkbox id="terms" checked={termsConsent} onCheckedChange={(v) => setTermsConsent(Boolean(v))} className="mt-1" />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  Согласен с условиями конкурса и политикой обработки персональных данных *
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Итого и оплата */}
          <Card className="border-2" style={{ borderColor: "var(--primary, #E31E24)" }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Участников: {participants.length} × {PRICE_PER_PARTICIPANT} ₽</p>
                  <p className="text-2xl font-bold mt-1">Итого: {totalAmount} ₽</p>
                </div>
                <Icon name="CreditCard" size={32} className="text-muted-foreground" />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full text-base py-6"
                style={{ background: "var(--primary, #E31E24)", color: "#fff" }}
              >
                {submitting ? (
                  <><Icon name="Loader2" size={18} className="animate-spin" /> Создание платежа...</>
                ) : (
                  <><Icon name="CreditCard" size={18} /> Оплатить и подать заявку</>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}