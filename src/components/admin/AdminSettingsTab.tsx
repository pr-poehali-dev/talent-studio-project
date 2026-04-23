import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import { UPLOAD_URL, SETTINGS_API_URL } from "./AdminTypes";

interface AdminSettingsTabProps {
  uploadingAppForm: boolean;
  setUploadingAppForm: (v: boolean) => void;
  applicationFormUrl: string;
  setApplicationFormUrl: (v: string) => void;
  collectiveFreeEnabled: boolean;
  setCollectiveFreeEnabled: (v: boolean) => void;
  savingCollectiveFree: boolean;
  setSavingCollectiveFree: (v: boolean) => void;
}

export default function AdminSettingsTab({
  uploadingAppForm,
  setUploadingAppForm,
  applicationFormUrl,
  setApplicationFormUrl,
  collectiveFreeEnabled,
  setCollectiveFreeEnabled,
  savingCollectiveFree,
  setSavingCollectiveFree,
}: AdminSettingsTabProps) {
  const { toast } = useToast();

  return (
    <div>
      <h2 className="text-3xl font-heading font-bold text-primary mb-8">Настройки</h2>

      <Card className="p-6 rounded-2xl max-w-2xl">
        <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
          <Icon name="ClipboardList" size={20} className="text-primary" />
          Лист подачи заявки
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Загрузите файл листа подачи заявки (DOCX, DOC или PDF). Он будет доступен для скачивания в разделе «Документы» на сайте.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".docx,.doc,.pdf"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingAppForm(true);
                try {
                  const CHUNK_SIZE = 512 * 1024;
                  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                  const uploadId = crypto.randomUUID();
                  let finalUrl = '';

                  for (let i = 0; i < totalChunks; i++) {
                    const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                    const base64 = await new Promise<string>((resolve) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
                      reader.readAsDataURL(chunk);
                    });
                    const response = await fetch(UPLOAD_URL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        chunk: base64,
                        chunkIndex: i,
                        totalChunks,
                        uploadId,
                        fileName: file.name,
                        fileType: file.type || 'application/octet-stream',
                        folder: 'application-forms'
                      })
                    });
                    const data = await response.json();
                    if (data.url) finalUrl = data.url;
                  }

                  if (!finalUrl) throw new Error('Файл не загружен');
                  setApplicationFormUrl(finalUrl);
                  await fetch(SETTINGS_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'application_form_url', value: finalUrl })
                  });
                  toast({ title: 'Файл загружен', description: 'Лист подачи заявки успешно загружен' });
                } catch {
                  toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
                } finally {
                  setUploadingAppForm(false);
                }
              }}
              disabled={uploadingAppForm}
              className="rounded-xl h-10"
            />
            {uploadingAppForm && <Icon name="Loader2" className="animate-spin" />}
          </div>
          {applicationFormUrl && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <Icon name="CheckCircle" size={18} className="text-green-600" />
              <a href={applicationFormUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                <Icon name="ExternalLink" size={14} />
                Просмотреть загруженный файл
              </a>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={async () => {
                  setApplicationFormUrl('');
                  await fetch(SETTINGS_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'application_form_url', value: '' })
                  });
                  toast({ title: 'Удалено', description: 'Ссылка на лист подачи заявки удалена' });
                }}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6 rounded-2xl max-w-2xl mt-6">
        <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
          <Icon name="Users" size={20} className="text-primary" />
          Коллективная заявка без оплаты
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Управляет доступностью страницы <strong>/collective-free</strong>. Когда включено — страница открыта для подачи коллективных заявок без оплаты.
        </p>
        <div className="flex items-center gap-4">
          <div
            className={`relative inline-flex h-7 w-12 cursor-pointer rounded-full transition-colors ${collectiveFreeEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            onClick={async () => {
              if (savingCollectiveFree) return;
              const newVal = !collectiveFreeEnabled;
              setSavingCollectiveFree(true);
              try {
                await fetch(SETTINGS_API_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ key: 'collective_free_enabled', value: String(newVal) }),
                });
                setCollectiveFreeEnabled(newVal);
                toast({ title: newVal ? 'Страница включена' : 'Страница отключена' });
              } catch {
                toast({ title: 'Ошибка', variant: 'destructive' });
              } finally {
                setSavingCollectiveFree(false);
              }
            }}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${collectiveFreeEnabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </div>
          <span className="text-sm font-medium">
            {collectiveFreeEnabled ? 'Включено' : 'Отключено'}
          </span>
          {savingCollectiveFree && <Icon name="Loader2" size={16} className="animate-spin text-muted-foreground" />}
        </div>
        {collectiveFreeEnabled && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
            <Icon name="Link" size={16} className="text-green-600" />
            <a
              href="/collective-free"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Открыть страницу /collective-free
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}