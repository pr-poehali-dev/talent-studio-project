import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Contest, PAYMENT_API_URL } from "../IndexTypes";

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

const ApplicationModal = ({
  isModalOpen,
  setIsModalOpen,
  selectedContest,
  contests,
  uploadedFile,
  setUploadedFile,
  uploadProgress,
  setUploadProgress,
  isUploading,
  setIsUploading,
  applicationFormUrl,
}: ApplicationModalProps) => {
  const { toast } = useToast();

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      setIsModalOpen(open);
      if (!open) {
        setUploadedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      }
    }}>
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

            if (!uploadedFile) {
              toast({
                title: "Ошибка",
                description: "Пожалуйста, загрузите файл работы",
                variant: "destructive"
              });
              return;
            }

            const formData = new FormData(e.currentTarget);
            const contestPrice = contests.find(c => c.title === selectedContest)?.price || 300;

            try {
              setIsUploading(true);
              setUploadProgress(10);

              const CHUNK_SIZE = 2 * 1024 * 1024;
              const totalChunks = Math.ceil(uploadedFile.size / CHUNK_SIZE);
              let uploadId = '';
              let file_url = '';

              for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, uploadedFile.size);
                const chunk = uploadedFile.slice(start, end);

                const chunkBase64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                  };
                  reader.onerror = () => reject(new Error('Ошибка чтения файла'));
                  reader.readAsDataURL(chunk);
                });

                const chunkProgress = 10 + Math.round((chunkIndex / totalChunks) * 70);
                setUploadProgress(chunkProgress);

                const uploadResponse = await fetch("https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b", {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chunk: chunkBase64,
                    chunkIndex,
                    totalChunks,
                    fileName: uploadedFile.name,
                    fileType: uploadedFile.type,
                    folder: 'works',
                    uploadId: uploadId || undefined
                  })
                });

                if (!uploadResponse.ok) {
                  throw new Error('Не удалось загрузить файл');
                }

                const result = await uploadResponse.json();

                if (!uploadId) {
                  uploadId = result.uploadId;
                }

                if (result.complete) {
                  file_url = result.url;
                }
              }

              setUploadProgress(85);

              const applicationData = {
                full_name: formData.get('fullName'),
                age: parseInt(formData.get('age') as string),
                teacher: formData.get('teacher') || null,
                institution: formData.get('institution') || null,
                work_title: formData.get('workTitle'),
                email: formData.get('email'),
                contest_name: selectedContest,
                work_file_url: file_url,
                gallery_consent: formData.get('gallery') === 'on'
              };

              const paymentResponse = await fetch(PAYMENT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  amount: contestPrice,
                  description: `Оплата участия в конкурсе "${selectedContest}"`,
                  contest_name: selectedContest,
                  email: formData.get('email'),
                  application_data: applicationData
                })
              });

              const paymentResult = await paymentResponse.json();

              setUploadProgress(100);
              setIsUploading(false);

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
              setIsUploading(false);
              setUploadProgress(0);
              console.error('Ошибка при подаче заявки:', error);
              toast({
                title: "Ошибка",
                description: error instanceof Error ? error.message : "Произошла ошибка при загрузке файла или создании платежа",
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
            <Label htmlFor="age" className="text-base font-semibold">Возраст *</Label>
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
            <Label htmlFor="workTitle" className="text-base font-semibold">Название творческой работы *</Label>
            <Input id="workTitle" name="workTitle" placeholder="Введите название работы" required className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold">Электронная почта *</Label>
            <Input id="email" name="email" type="email" placeholder="example@mail.ru" required className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workFile" className="text-base font-semibold">Загрузить работу *</Label>
            <div className="relative">
              <Input
                id="workFile"
                type="file"
                accept="image/*,.pdf"
                required
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const maxSize = 15 * 1024 * 1024;
                    if (file.size > maxSize) {
                      toast({
                        title: "Файл слишком большой",
                        description: `Максимальный размер файла — 15 МБ. Ваш файл: ${(file.size / 1024 / 1024).toFixed(1)} МБ`,
                        variant: "destructive"
                      });
                      e.target.value = '';
                      setUploadedFile(null);
                      return;
                    }
                    setUploadedFile(file);
                  } else {
                    setUploadedFile(null);
                  }
                }}
                className="rounded-xl border-2 focus:border-primary h-10 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:cursor-pointer hover:file:bg-primary/90"
              />
            </div>
            {uploadedFile && !isUploading && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-xl text-sm">
                <Icon name="CheckCircle" className="text-success" size={20} />
                <span className="text-success font-semibold">Файл выбран: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(1)} МБ)</span>
              </div>
            )}
            {isUploading && (
              <div className="space-y-2 p-3 bg-primary/10 rounded-xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-primary">Загрузка файла...</span>
                  <span className="text-primary">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Форматы: JPG, PNG, PDF (макс. 15 МБ)</p>
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
            disabled={isUploading}
            className="w-full text-lg py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" />
                Загрузка файла {uploadProgress}%
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
