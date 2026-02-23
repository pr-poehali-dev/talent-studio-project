import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";

interface Contest {
  id?: number;
  title: string;
}

interface Application {
  id: number;
  full_name: string;
  age: number;
  teacher: string | null;
  institution: string | null;
  work_title: string;
  email: string;
  contest_id: number | null;
  contest_name: string;
  work_file_url: string;
  status: 'new' | 'viewed' | 'sent';
  result: 'grand_prix' | 'first_degree' | 'second_degree' | 'third_degree' | 'participant' | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface AdminApplicationsTabProps {
  contests: Contest[];
  applications: Application[];
  deletedApplications: Application[];
  applicationsSubTab: 'active' | 'trash';
  setApplicationsSubTab: (v: 'active' | 'trash') => void;
  applicationsWithResults: Set<number>;
  isAppModalOpen: boolean;
  setIsAppModalOpen: (v: boolean) => void;
  editingApplication: Application | null;
  setEditingApplication: (v: Application | null) => void;
  appResult: string | undefined;
  setAppResult: (v: string | undefined) => void;
  appStatus: 'new' | 'viewed' | 'sent';
  setAppStatus: (v: 'new' | 'viewed' | 'sent') => void;
  isWorkPreviewOpen: boolean;
  setIsWorkPreviewOpen: (v: boolean) => void;
  workPreview: string | null;
  setWorkPreview: (v: string | null) => void;
  isManualAppModalOpen: boolean;
  setIsManualAppModalOpen: (v: boolean) => void;
  manualAppFile: File | null;
  setManualAppFile: (v: File | null) => void;
  manualContestName: string;
  setManualContestName: (v: string) => void;
  submittingManualApp: boolean;
  manualAppUploadProgress: number;
  handleCreateResultFromApplication: (app: Application) => void;
  handleDeleteApplication: (id: number) => void;
  handlePermanentDeleteApplication: (id: number) => void;
  handleRestoreApplication: (id: number) => void;
  handleManualAppSubmit: (e: React.FormEvent) => void;
  loadApplications: () => void;
  loadDeletedApplications: () => void;
  APPLICATIONS_API_URL: string;
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

const AdminApplicationsTab = ({
  contests,
  applications,
  deletedApplications,
  applicationsSubTab,
  setApplicationsSubTab,
  applicationsWithResults,
  isAppModalOpen,
  setIsAppModalOpen,
  editingApplication,
  setEditingApplication,
  appResult,
  setAppResult,
  appStatus,
  setAppStatus,
  isWorkPreviewOpen,
  setIsWorkPreviewOpen,
  workPreview,
  setWorkPreview,
  isManualAppModalOpen,
  setIsManualAppModalOpen,
  manualAppFile,
  setManualAppFile,
  manualContestName,
  setManualContestName,
  submittingManualApp,
  manualAppUploadProgress,
  handleCreateResultFromApplication,
  handleDeleteApplication,
  handlePermanentDeleteApplication,
  handleRestoreApplication,
  handleManualAppSubmit,
  loadApplications,
  loadDeletedApplications,
  APPLICATIONS_API_URL,
  toast,
}: AdminApplicationsTabProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-heading font-bold text-primary">Заявки на участие</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { loadApplications(); loadDeletedApplications(); }}
            className="rounded-xl"
          >
            <Icon name="RefreshCw" className="mr-2" size={16} />
            Обновить
          </Button>
          <Button
            onClick={() => { setManualAppFile(null); setManualContestName(""); setIsManualAppModalOpen(true); }}
            className="rounded-xl bg-primary hover:bg-primary/90"
          >
            <Icon name="Plus" className="mr-2" size={16} />
            Добавить заявку
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={applicationsSubTab === 'active' ? 'default' : 'outline'}
          onClick={() => setApplicationsSubTab('active')}
          className="rounded-xl"
        >
          <Icon name="FileText" className="mr-2" size={16} />
          Активные ({applications.length})
        </Button>
        <Button
          variant={applicationsSubTab === 'trash' ? 'default' : 'outline'}
          onClick={() => setApplicationsSubTab('trash')}
          className="rounded-xl"
        >
          <Icon name="Trash2" className="mr-2" size={16} />
          Корзина ({deletedApplications.length})
        </Button>
      </div>

      {applicationsSubTab === 'active' && (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={`app-${app.id}`} className="rounded-2xl shadow-md">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">ФИО</p>
                      <p className="font-semibold text-sm">{app.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Возраст</p>
                      <p className="font-semibold text-sm">{app.age} лет</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Название работы</p>
                      <p className="font-semibold text-sm">{app.work_title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Конкурс</p>
                      <p className="font-semibold text-sm">{app.contest_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Педагог</p>
                      <p className="font-semibold text-sm">{app.teacher || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Учреждение</p>
                      <p className="font-semibold text-sm">{app.institution || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-semibold text-sm">{app.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Дата подачи</p>
                      <p className="font-semibold text-sm">
                        {app.created_at ? new Date(app.created_at).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Работа</p>
                      <button
                        onClick={() => {
                          setWorkPreview(app.work_file_url);
                          setIsWorkPreviewOpen(true);
                        }}
                        className="text-primary hover:underline flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <Icon name="Eye" size={14} />
                        Посмотреть
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Публикация в галерее</p>
                      <span className={`text-sm font-semibold ${app.gallery_consent ? 'text-green-600' : 'text-red-600'}`}>
                        {app.gallery_consent ? '✓ Согласен' : '✗ Не согласен'}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Дата вручения</p>
                      <p className="font-semibold text-sm">
                        {app.diploma_issued_at
                          ? new Date(app.diploma_issued_at).toLocaleDateString('ru-RU')
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => handleCreateResultFromApplication(app)}
                      variant="default"
                      size="sm"
                      className={`rounded-xl ${applicationsWithResults.has(app.id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                      title={applicationsWithResults.has(app.id) ? "Результат уже создан" : "Добавить в результаты"}
                      disabled={applicationsWithResults.has(app.id)}
                    >
                      <Icon name={applicationsWithResults.has(app.id) ? "Check" : "Award"} size={16} />
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingApplication(app);
                        setAppStatus(app.status);
                        setAppResult(app.result || undefined);
                        setIsAppModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDeleteApplication(app.id)}
                      variant="destructive"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-3">
                    <Icon name="Award" size={20} className={app.result ? "text-orange-500" : "text-gray-400"} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2">Результат</p>
                      {app.result ? (
                        <span className="inline-block px-4 py-2 rounded-lg text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md">
                          {app.result === 'grand_prix' ? '🏆 Гран-При' :
                           app.result === 'first_degree' ? '🥇 Диплом 1 степени' :
                           app.result === 'second_degree' ? '🥈 Диплом 2 степени' :
                           app.result === 'third_degree' ? '🥉 Диплом 3 степени' : '✨ Участник'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-md text-xs bg-gray-200 text-gray-600">
                          Не выбран
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {applicationsSubTab === 'trash' && (
        <div className="grid gap-4">
          {deletedApplications.length === 0 ? (
            <Card className="rounded-2xl p-8 text-center">
              <Icon name="Trash2" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Корзина пуста</p>
            </Card>
          ) : (
            deletedApplications.map((app) => (
              <Card key={app.id} className="rounded-2xl shadow-md opacity-60">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">ФИО</p>
                        <p className="font-semibold text-sm">{app.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Возраст</p>
                        <p className="font-semibold text-sm">{app.age} лет</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Название работы</p>
                        <p className="font-semibold text-sm">{app.work_title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Конкурс</p>
                        <p className="font-semibold text-sm">{app.contest_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-semibold text-sm">{app.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Удалено</p>
                        <p className="font-semibold text-sm">
                          {app.deleted_at ? new Date(app.deleted_at).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleRestoreApplication(app.id)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        <Icon name="RotateCcw" size={16} className="mr-1" />
                        Восстановить
                      </Button>
                      <Button
                        onClick={() => handlePermanentDeleteApplication(app.id)}
                        variant="destructive"
                        size="sm"
                        className="rounded-xl"
                      >
                        <Icon name="Trash2" size={16} className="mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Модал редактирования заявки */}
      <Dialog open={isAppModalOpen} onOpenChange={setIsAppModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary">
              Редактирование заявки
            </DialogTitle>
          </DialogHeader>

          {editingApplication && (
            <form
              className="space-y-5 mt-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);

                try {
                  const diplomaDate = formData.get('diplomaIssuedAt') as string;
                  const updateData = {
                    id: editingApplication.id,
                    full_name: formData.get('fullName') as string,
                    age: parseInt(formData.get('age') as string),
                    teacher: formData.get('teacher') as string || null,
                    institution: formData.get('institution') as string || null,
                    work_title: formData.get('workTitle') as string,
                    email: formData.get('email') as string,
                    result: appResult && appResult !== 'none' ? appResult : null,
                    diploma_issued_at: diplomaDate || null
                  };

                  const response = await fetch(APPLICATIONS_API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateData)
                  });

                  if (response.ok) {
                    toast({ title: "Успешно", description: "Заявка обновлена" });
                    setIsAppModalOpen(false);
                    loadApplications();
                  }
                } catch {
                  toast({ title: "Ошибка", description: "Не удалось обновить заявку", variant: "destructive" });
                }
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-base font-semibold">ФИО *</Label>
                <Input id="fullName" name="fullName" defaultValue={editingApplication.full_name} required className="rounded-xl border-2 focus:border-primary" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-base font-semibold">Возраст *</Label>
                <Input id="age" name="age" type="number" defaultValue={editingApplication.age} required className="rounded-xl border-2 focus:border-primary" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher" className="text-base font-semibold">Педагог</Label>
                <Input id="teacher" name="teacher" defaultValue={editingApplication.teacher || ''} className="rounded-xl border-2 focus:border-primary" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution" className="text-base font-semibold">Учреждение</Label>
                <Input id="institution" name="institution" defaultValue={editingApplication.institution || ''} className="rounded-xl border-2 focus:border-primary" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workTitle" className="text-base font-semibold">Название работы *</Label>
                <Input id="workTitle" name="workTitle" defaultValue={editingApplication.work_title} required className="rounded-xl border-2 focus:border-primary" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
                <Input id="email" name="email" type="email" defaultValue={editingApplication.email} required className="rounded-xl border-2 focus:border-primary" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="result" className="text-base font-semibold">Результат</Label>
                <Select value={appResult || 'none'} onValueChange={(val) => setAppResult(val === 'none' ? undefined : val)}>
                  <SelectTrigger className="rounded-xl border-2">
                    <SelectValue placeholder="Не выбран" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не выбран</SelectItem>
                    <SelectItem value="grand_prix">Гран-При</SelectItem>
                    <SelectItem value="first_degree">1 степень</SelectItem>
                    <SelectItem value="second_degree">2 степень</SelectItem>
                    <SelectItem value="third_degree">3 степень</SelectItem>
                    <SelectItem value="participant">Участник</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diplomaIssuedAt" className="text-base font-semibold">Дата вручения</Label>
                <Input id="diplomaIssuedAt" name="diplomaIssuedAt" type="date" defaultValue={editingApplication.diploma_issued_at || ''} className="rounded-xl border-2 focus:border-primary" />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Файл работы</Label>
                <button
                  type="button"
                  onClick={() => {
                    setWorkPreview(editingApplication.work_file_url);
                    setIsWorkPreviewOpen(true);
                  }}
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <Icon name="Eye" size={16} />
                  Посмотреть работу
                </button>
              </div>

              <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90">
                Сохранить изменения
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Модал просмотра работы */}
      <Dialog open={isWorkPreviewOpen} onOpenChange={setIsWorkPreviewOpen}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden rounded-3xl">
          <div className="relative w-full h-full flex items-center justify-center bg-black/95">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsWorkPreviewOpen(false)}
            >
              <Icon name="X" size={24} />
            </Button>
            {workPreview && (
              <>
                {workPreview.toLowerCase().includes('.pdf') ? (
                  <iframe src={workPreview} className="w-full h-[85vh]" title="Работа участника" />
                ) : (
                  <img
                    src={workPreview}
                    alt="Работа участника"
                    className="max-w-full max-h-[85vh] object-contain"
                  />
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Модал ручного добавления заявки */}
      <Dialog open={isManualAppModalOpen} onOpenChange={setIsManualAppModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary">
              Добавить заявку вручную
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleManualAppSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>ФИО участника *</Label>
              <Input name="manualFullName" placeholder="Введите ФИО участника" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Возраст *</Label>
              <Input name="manualAge" type="number" placeholder="Введите возраст" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Педагог</Label>
              <Input name="manualTeacher" placeholder="ФИО педагога (если есть)" className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Учреждение</Label>
              <Input name="manualInstitution" placeholder="Название школы, студии или учреждения" className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Название творческой работы *</Label>
              <Input name="manualWorkTitle" placeholder="Введите название работы" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Электронная почта *</Label>
              <Input name="manualEmail" type="email" placeholder="example@mail.ru" required className="rounded-xl" />
            </div>

            <div className="space-y-2">
              <Label>Конкурс *</Label>
              <Select value={manualContestName} onValueChange={setManualContestName}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Выберите конкурс" />
                </SelectTrigger>
                <SelectContent>
                  {contests.map((c) => (
                    <SelectItem key={c.id || c.title} value={c.title}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Загрузить работу *</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
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
                      setManualAppFile(null);
                      return;
                    }
                    setManualAppFile(file);
                  } else {
                    setManualAppFile(null);
                  }
                }}
                className="rounded-xl h-10"
              />
              {manualAppFile && !submittingManualApp && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-xl text-sm">
                  <Icon name="CheckCircle" className="text-green-600" size={16} />
                  <span className="text-green-700 font-semibold">{manualAppFile.name} ({(manualAppFile.size / 1024 / 1024).toFixed(1)} МБ)</span>
                </div>
              )}
              {submittingManualApp && manualAppUploadProgress > 0 && (
                <div className="space-y-2 p-3 bg-primary/10 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">Загрузка файла...</span>
                    <span className="text-primary">{manualAppUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${manualAppUploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">Форматы: JPG, PNG, PDF (макс. 15 МБ)</p>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-xl">
              <Checkbox id="manualGallery" name="manualGallery" />
              <Label htmlFor="manualGallery" className="text-sm cursor-pointer">
                Согласие на публикацию работы в галерее сайта
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submittingManualApp}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {submittingManualApp ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                    {manualAppUploadProgress < 60 ? `Загрузка ${manualAppUploadProgress}%` : 'Создание заявки...'}
                  </>
                ) : (
                  <><Icon name="Plus" className="mr-2" size={16} />Создать заявку</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsManualAppModalOpen(false)}
                className="flex-1 rounded-xl"
              >
                Отмена
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplicationsTab;
