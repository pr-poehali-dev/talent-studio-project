import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Contest, PAYMENT_API_URL } from "../IndexTypes";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const CHUNK_SIZE = 2 * 1024 * 1024;
const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";

interface UploadedFileItem {
  file: File;
  url: string;
  uploading: boolean;
  progress: number;
  error: string | null;
}

interface ApplicationModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  selectedContest: string;
  contests: Contest[];
  uploadedFile: File | null;
  setUploadedFile: (f: File | null) => void;
  uploadProgress: number;
  setUploadProgress: (n: number) => void;
  isUploading: boolean;
  setIsUploading: (v: boolean) => void;
  applicationFormUrl: string | null;
}

async function uploadFileInChunks(
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadId = '';
  let fileUrl = '';

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const chunkBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(chunk);
    });

    onProgress(Math.round(((chunkIndex + 0.5) / totalChunks) * 100));

    const res = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chunk: chunkBase64,
        chunkIndex,
        totalChunks,
        fileName: file.name,
        fileType: file.type,
        folder: 'works',
        uploadId: uploadId || undefined
      })
    });

    if (!res.ok) throw new Error('Не удалось загрузить файл');

    const result = await res.json();
    if (!uploadId && result.uploadId) uploadId = result.uploadId;
    if (result.complete && result.url) fileUrl = result.url;
  }

  if (!fileUrl) throw new Error('Сервер не вернул URL файла');
  return fileUrl;
}

const ApplicationModal = ({
  isModalOpen,
  setIsModalOpen,
  selectedContest,
  contests,
  setUploadedFile,
  setUploadProgress,
  setIsUploading,
  applicationFormUrl,
}: ApplicationModalProps) => {
  const { toast } = useToast();
  const [fileItems, setFileItems] = useState<UploadedFileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  const handleClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setFileItems([]);
      setIsSubmitting(false);
      setSubmitProgress(0);
      setUploadedFile(null);
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  const handleFileAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const valid = files.filter(f => {
      if (f.size > MAX_FILE_SIZE) {
        toast({
          title: "Файл слишком большой",
          description: `${f.name}: максимум 15 МБ`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    const newItems: UploadedFileItem[] = valid.map(f => ({
      file: f,
      url: '',
      uploading: true,
      progress: 0,
      error: null
    }));

    setFileItems(prev => [...prev, ...newItems]);

    for (const item of newItems) {
      const idx = newItems.indexOf(item);
      setFileItems(prev => {
        const list = [...prev];
        const globalIdx = list.findIndex(x => x.file === item.file);
        if (globalIdx !== -1) list[globalIdx] = { ...list[globalIdx], uploading: true, progress: 0 };
        return list;
      });

      try {
        const url = await uploadFileInChunks(item.file, (pct) => {
          setFileItems(prev => {
            const list = [...prev];
            const gi = list.findIndex(x => x.file === item.file);
            if (gi !== -1) list[gi] = { ...list[gi], progress: pct };
            return list;
          });
        });

        setFileItems(prev => {
          const list = [...prev];
          const gi = list.findIndex(x => x.file === item.file);
          if (gi !== -1) list[gi] = { ...list[gi], uploading: false, progress: 100, url };
          return list;
        });
      } catch {
        setFileItems(prev => {
          const list = [...prev];
          const gi = list.findIndex(x => x.file === item.file);
          if (gi !== -1) list[gi] = { ...list[gi], uploading: false, error: 'Ошибка загрузки' };
          return list;
        });
      }
      void idx;
    }
  };

  const removeFile = (index: number) => {
    setFileItems(prev => prev.filter((_, i) => i !== index));
  };

  const uploadedUrls = fileItems.filter(f => f.url && !f.uploading);
  const anyUploading = fileItems.some(f => f.uploading);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading font-bold text-primary">
            🎨 Подача заявки на конкурс
          </DialogTitle>
          <DialogDescription className="text-base">
            Конкурс: <span className="font-semibold text-primary">{selectedContest}</span>
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5 mt-4"
          onSubmit={async (e) => {
            e.preventDefault();

            if (uploadedUrls.length === 0) {
              toast({
                title: "Ошибка",
                description: "Пожалуйста, загрузите хотя бы один файл работы",
                variant: "destructive"
              });
              return;
            }

            if (anyUploading) {
              toast({
                title: "Подождите",
                description: "Файлы ещё загружаются",
                variant: "destructive"
              });
              return;
            }

            const formData = new FormData(e.currentTarget);
            const contestPrice = contests.find(c => c.title === selectedContest)?.price || 300;
            const [mainFile, ...extraFiles] = uploadedUrls.map(f => f.url);

            try {
              setIsSubmitting(true);
              setSubmitProgress(30);

              const applicationData = {
                full_name: formData.get('fullName'),
                age: parseInt(formData.get('age') as string),
                teacher: formData.get('teacher') || null,
                institution: formData.get('institution') || null,
                work_title: formData.get('workTitle'),
                email: formData.get('email'),
                contest_name: selectedContest,
                work_file_url: mainFile,
                extra_files: extraFiles,
                gallery_consent: formData.get('gallery') === 'on'
              };

              setSubmitProgress(60);

              const paymentResponse = await fetch(PAYMENT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  amount: contestPrice,
                  description: `${applicationData.full_name} — ${selectedContest}`,
                  contest_name: selectedContest,
                  email: formData.get('email'),
                  application_data: applicationData
                })
              });

              const paymentResult = await paymentResponse.json();
              setSubmitProgress(100);
              setIsSubmitting(false);

              if (paymentResponse.ok && paymentResult.confirmation_url) {
                window.location.href = paymentResult.confirmation_url;
              } else {
                toast({
                  title: "Ошибка оплаты",
                  description: paymentResult.error || "Не удалось создать платёж",
                  variant: "destructive"
                });
              }
            } catch (error) {
              setIsSubmitting(false);
              setSubmitProgress(0);
              toast({
                title: "Ошибка",
                description: error instanceof Error ? error.message : "Произошла ошибка",
                variant: "destructive"
              });
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-base font-semibold">ФИО *</Label>
            <Input id="fullName" name="fullName" placeholder="Введите ФИО участника" required className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age" className="text-base font-semibold">Возраст, год обучения *</Label>
            <Input id="age" name="age" type="number" placeholder="Введите возраст" required className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher" className="text-base font-semibold">Педагог</Label>
            <Input id="teacher" name="teacher" placeholder="ФИО педагога (если есть)" className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution" className="text-base font-semibold">Учреждение, город, страна</Label>
            <Input id="institution" name="institution" placeholder="Название школы, студии, город, страна" className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workTitle" className="text-base font-semibold">Название работы, техника выполнения *</Label>
            <Input id="workTitle" name="workTitle" placeholder="Введите название работы" required className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold">Электронная почта *</Label>
            <Input id="email" name="email" type="email" placeholder="example@mail.ru" required className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Файлы работы *
                {fileItems.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({uploadedUrls.length} из {fileItems.length} загружено)
                  </span>
                )}
              </Label>
              <Label
                htmlFor="workFiles"
                className="flex items-center gap-1.5 text-sm text-primary cursor-pointer hover:underline font-medium"
              >
                <Icon name="Plus" size={15} />
                Добавить файл
              </Label>
            </div>

            <Input
              id="workFiles"
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleFileAdd}
            />

            {fileItems.length === 0 ? (
              <Label
                htmlFor="workFiles"
                className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors block text-center"
              >
                <Icon name="Upload" size={28} className="text-muted-foreground" />
                <span className="text-sm font-medium">Нажмите, чтобы выбрать файлы</span>
                <span className="text-xs text-muted-foreground">JPG, PNG, PDF — до 15 МБ каждый</span>
              </Label>
            ) : (
              <div className="space-y-2">
                {fileItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-sm ${
                      item.error
                        ? 'border-red-200 bg-red-50'
                        : item.uploading
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {item.error ? (
                        <Icon name="AlertCircle" size={18} className="text-red-500" />
                      ) : item.uploading ? (
                        <Icon name="Loader2" size={18} className="animate-spin text-primary" />
                      ) : (
                        <Icon name="CheckCircle" size={18} className="text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.file.name}</p>
                      {item.uploading && (
                        <div className="mt-1 w-full bg-white/60 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                      {item.error && <p className="text-xs text-red-500 mt-0.5">{item.error}</p>}
                      {!item.uploading && !item.error && index === 0 && (
                        <p className="text-xs text-green-600 mt-0.5">Основной файл</p>
                      )}
                      {!item.uploading && !item.error && index > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">Дополнительный файл</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Первый файл будет основным. Форматы: JPG, PNG, PDF (макс. 15 МБ каждый)
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3 p-3 bg-accent/10 rounded-xl">
              <Checkbox id="gallery" name="gallery" className="mt-1" />
              <Label htmlFor="gallery" className="text-sm leading-relaxed cursor-pointer">
                Согласен на публикацию работы в галерее сайта
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-accent/10 rounded-xl">
              <Checkbox id="terms" required className="mt-1" />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                Согласен с условиями конкурса и политикой обработки персональных данных *
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || anyUploading}
            className="w-full text-lg py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {anyUploading ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" />
                Загрузка файлов...
              </>
            ) : isSubmitting ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" />
                Создание платежа... {submitProgress}%
              </>
            ) : (
              <>
                <Icon name="CreditCard" className="mr-2" />
                Оплатить и подать заявку
              </>
            )}
          </Button>

          <div className="mt-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Если у Вас возникли проблемы с подачей заявки, Вы можете отправить пакет документов (
              {applicationFormUrl ? (
                <a
                  href={applicationFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-semibold"
                >
                  заполненный лист подачи заявки
                </a>
              ) : (
                <span className="font-semibold">заполненный лист подачи заявки</span>
              )}, квитанцию об оплате орг. взноса, фото работы) на электронную почту{' '}
              <a
                href="mailto:studio-talantov@yandex.ru"
                className="text-primary hover:underline font-semibold"
              >
                studio-talantov@yandex.ru
              </a>
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationModal;