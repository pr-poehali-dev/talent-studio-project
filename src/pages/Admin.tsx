import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useToast } from "@/components/ui/use-toast";
import AdminContestsTab from "@/components/admin/AdminContestsTab";
import AdminApplicationsTab from "@/components/admin/AdminApplicationsTab";
import AdminResultsAndReviewsTab from "@/components/admin/AdminResultsAndReviewsTab";
import AdminRevenueTab from "@/components/admin/AdminRevenueTab";
import AdminLoginPage from "@/components/admin/AdminLoginPage";
import AdminNav from "@/components/admin/AdminNav";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import {
  Contest,
  Application,
  Result,
  Review,
  API_URL,
  UPLOAD_URL,
  RESULTS_API_URL,
  APPLICATIONS_API_URL,
  SUBMIT_APPLICATION_URL,
  REVIEWS_API_URL,
  SETTINGS_API_URL,
  CERTIFICATES_LOG_URL,
} from "@/components/admin/AdminTypes";

type Tab = 'contests' | 'applications' | 'results' | 'reviews' | 'certificates' | 'settings' | 'revenue';

const Admin = () => {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>('contests');
  const [certificatesLog, setCertificatesLog] = useState<{id: number; result_id: number; full_name: string; contest_name: string; issued_at: string}[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [applicationsSubTab, setApplicationsSubTab] = useState<'active' | 'archive' | 'trash'>('active');
  const [contests, setContests] = useState<Contest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deletedApplications, setDeletedApplications] = useState<Application[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [applicationsWithResults, setApplicationsWithResults] = useState<Set<number>>(new Set());
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [resultFilters, setResultFilters] = useState({
    contest_name: '',
    full_name: '',
    result: 'all',
    date: undefined as Date | undefined
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [appStatus, setAppStatus] = useState<'new' | 'viewed' | 'sent'>('new');
  const [appResult, setAppResult] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'viewed' | 'sent'>('all');
  const [workPreviewFiles, setWorkPreviewFiles] = useState<string[]>([]);
  const [workPreviewIndex, setWorkPreviewIndex] = useState(0);
  const [isWorkPreviewOpen, setIsWorkPreviewOpen] = useState(false);
  const [formData, setFormData] = useState<Contest>({
    title: "",
    description: "",
    categoryId: "visual-arts",
    deadline: "",
    price: 200,
    status: "active",
    rulesLink: "#",
    diplomaImage: "",
    image: ""
  });
  const [uploadingRules, setUploadingRules] = useState(false);
  const [uploadingDiploma, setUploadingDiploma] = useState(false);
  const [uploadingAppForm, setUploadingAppForm] = useState(false);
  const [applicationFormUrl, setApplicationFormUrl] = useState<string>('');
  const [collectiveFreeEnabled, setCollectiveFreeEnabled] = useState(false);
  const [savingCollectiveFree, setSavingCollectiveFree] = useState(false);
  const [isManualAppModalOpen, setIsManualAppModalOpen] = useState(false);
  const [manualAppFile, setManualAppFile] = useState<File | null>(null);
  const [manualContestName, setManualContestName] = useState("");
  const [submittingManualApp, setSubmittingManualApp] = useState(false);
  const [manualAppUploadProgress, setManualAppUploadProgress] = useState(0);
  const { toast } = useToast();

  // Подавляем предупреждение о неиспользуемой переменной
  void statusFilter;

  const loadContests = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setContests(data);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить конкурсы", variant: "destructive" });
    }
  };

  const loadApplications = async () => {
    try {
      const response = await fetch(APPLICATIONS_API_URL);
      const data = await response.json();
      setApplications(data);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить заявки", variant: "destructive" });
    }
  };

  const loadDeletedApplications = async () => {
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?deleted=true`);
      const data = await response.json();
      setDeletedApplications(data);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить корзину", variant: "destructive" });
    }
  };

  const loadResults = async () => {
    try {
      const response = await fetch(RESULTS_API_URL);
      const data = await response.json();
      setResults(data);
      const appIds = new Set(data.filter((r: Result) => r.application_id).map((r: Result) => r.application_id));
      setApplicationsWithResults(appIds);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить результаты", variant: "destructive" });
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`${REVIEWS_API_URL}?status=all`);
      const data = await response.json();
      setReviews(data);
    } catch {
      toast({ title: "Ошибка", description: "Не удалось загрузить отзывы", variant: "destructive" });
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(SETTINGS_API_URL);
      const data = await response.json();
      if (data.application_form_url) {
        setApplicationFormUrl(data.application_form_url);
      }
      setCollectiveFreeEnabled(data.collective_free_enabled === 'true');
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadContests();
      loadApplications();
      loadDeletedApplications();
      loadResults();
      loadReviews();
      loadSettings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = [...results];
    if (resultFilters.contest_name) {
      filtered = filtered.filter(r =>
        r.contest_name?.toLowerCase().includes(resultFilters.contest_name.toLowerCase())
      );
    }
    if (resultFilters.full_name) {
      filtered = filtered.filter(r =>
        r.full_name?.toLowerCase().includes(resultFilters.full_name.toLowerCase())
      );
    }
    if (resultFilters.result !== 'all') {
      filtered = filtered.filter(r => r.result === resultFilters.result);
    }
    if (resultFilters.date) {
      filtered = filtered.filter(r => {
        if (!r.created_at) return false;
        const resultDate = new Date(r.created_at);
        const filterDate = new Date(resultFilters.date!);
        return resultDate.toDateString() === filterDate.toDateString();
      });
    }
    setFilteredResults(filtered);
  }, [results, resultFilters]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      toast({ title: "Вход выполнен", description: "Добро пожаловать в админ-панель!" });
    } else {
      toast({ title: "Ошибка входа", description: "Неверный логин или пароль", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLogin("");
    setPassword("");
    toast({ title: "Выход выполнен", description: "Вы вышли из админ-панели" });
  };

  const handleCreateContest = () => {
    setEditingContest(null);
    setFormData({
      title: "",
      description: "",
      categoryId: "visual-arts",
      deadline: "",
      price: 200,
      status: "active",
      rulesLink: "#",
      diplomaImage: "",
      image: ""
    });
    setIsModalOpen(true);
  };

  const parseRussianDate = (dateStr: string): string => {
    const months: Record<string, string> = {
      'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
      'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
      'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12',
      'january': '01', 'february': '02', 'march': '03', 'april': '04',
      'may': '05', 'june': '06', 'july': '07', 'august': '08',
      'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };
    const parts = dateStr.trim().split(' ');
    if (parts.length === 3 && months[parts[1].toLowerCase()]) {
      return `${parts[2]}-${months[parts[1].toLowerCase()]}-${parts[0].padStart(2, '0')}`;
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  const handleEditContest = (contest: Contest) => {
    setEditingContest(contest);
    setFormData({
      ...contest,
      deadline: contest.deadline ? parseRussianDate(contest.deadline) : ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingContest ? 'PUT' : 'POST';
      const body = editingContest ? { ...formData, id: editingContest.id } : formData;
      const response = await fetch(API_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        toast({ title: "Успешно", description: editingContest ? "Конкурс обновлен" : "Конкурс создан" });
        setIsModalOpen(false);
        loadContests();
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить конкурс", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот конкурс?")) return;
    try {
      const response = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Успешно", description: "Конкурс удален" });
        loadContests();
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось удалить конкурс", variant: "destructive" });
    }
  };

  const handleDeleteApplication = async (id: number) => {
    if (!confirm("Переместить заявку в корзину?")) return;
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Успешно", description: "Заявка перемещена в корзину" });
        loadApplications();
        loadDeletedApplications();
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось удалить заявку", variant: "destructive" });
    }
  };

  const handlePermanentDeleteApplication = async (id: number) => {
    if (!confirm("Удалить заявку навсегда? Это действие нельзя отменить.")) return;
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?id=${id}&permanent=true`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Удалено", description: "Заявка удалена безвозвратно" });
        loadDeletedApplications();
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось удалить заявку", variant: "destructive" });
    }
  };

  const handleRestoreApplication = async (id: number) => {
    try {
      const response = await fetch(`${APPLICATIONS_API_URL}?id=${id}&restore=true`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Успешно", description: "Заявка восстановлена" });
        loadApplications();
        loadDeletedApplications();
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось восстановить заявку", variant: "destructive" });
    }
  };

  const handleEditResult = (result: Result) => {
    setEditingResult(result);
    setIsResultModalOpen(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    try {
      const response = await fetch(RESULTS_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingResult)
      });
      if (response.ok) {
        toast({ title: "Успешно", description: "Результат обновлен" });
        setIsResultModalOpen(false);
        loadResults();
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось сохранить результат", variant: "destructive" });
    }
  };

  const handleDeleteResult = async (id: number) => {
    if (!confirm("Удалить этот результат?")) return;
    try {
      const response = await fetch(`${RESULTS_API_URL}?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: "Успешно", description: "Результат удален" });
        loadResults();
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось удалить результат", variant: "destructive" });
    }
  };

  const handleCreateResultFromApplication = async (app: Application) => {
    if (!app.result) {
      toast({ title: "Результат не указан", description: "Сначала установите результат в заявке", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(RESULTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: app.id,
          full_name: app.full_name,
          age: app.age,
          teacher: app.teacher,
          institution: app.institution,
          work_title: app.work_title,
          email: app.email,
          contest_id: app.contest_id,
          contest_name: app.contest_name,
          work_file_url: app.work_file_url,
          result: app.result,
          gallery_consent: app.gallery_consent,
          notes: null,
          diploma_issued_at: app.diploma_issued_at || null
        })
      });
      if (response.ok) {
        toast({ title: "Успешно", description: "Результат создан из заявки" });
        loadResults();
        loadApplications();
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось создать результат", variant: "destructive" });
    }
  };

  const handleManualAppSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!manualAppFile) {
      toast({ title: "Выберите файл работы", variant: "destructive" });
      return;
    }
    if (!manualContestName) {
      toast({ title: "Выберите конкурс", variant: "destructive" });
      return;
    }

    setSubmittingManualApp(true);
    setManualAppUploadProgress(10);

    try {
      const fd = new FormData(e.currentTarget);
      const CHUNK_SIZE = 2 * 1024 * 1024;
      const totalChunks = Math.ceil(manualAppFile.size / CHUNK_SIZE);
      let uploadId = "";
      let file_url = "";

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const chunk = manualAppFile.slice(start, Math.min(start + CHUNK_SIZE, manualAppFile.size));

        const chunkBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = () => reject(new Error('Ошибка чтения файла'));
          reader.readAsDataURL(chunk);
        });

        setManualAppUploadProgress(Math.round(10 + ((chunkIndex) / totalChunks) * 50));

        const uploadResponse = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chunk: chunkBase64,
            chunkIndex,
            totalChunks,
            fileName: manualAppFile.name,
            fileType: manualAppFile.type,
            folder: 'works',
            uploadId: uploadId || undefined
          })
        });

        if (!uploadResponse.ok) throw new Error('Не удалось загрузить файл');

        const result = await uploadResponse.json();
        if (!uploadId) uploadId = result.uploadId;
        if (result.complete) file_url = result.url;
      }

      setManualAppUploadProgress(60);

      const response = await fetch(SUBMIT_APPLICATION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fd.get('manualFullName'),
          age: parseInt(fd.get('manualAge') as string),
          teacher: fd.get('manualTeacher') || null,
          institution: fd.get('manualInstitution') || null,
          work_title: fd.get('manualWorkTitle'),
          email: fd.get('manualEmail'),
          contest_name: manualContestName,
          work_file_url: file_url,
          gallery_consent: fd.get('manualGallery') === 'on'
        })
      });

      setManualAppUploadProgress(90);

      const result = await response.json();
      if (response.ok && result.success) {
        setManualAppUploadProgress(100);
        toast({ title: "Успешно", description: "Заявка добавлена вручную" });
        setIsManualAppModalOpen(false);
        setManualAppFile(null);
        setManualAppUploadProgress(0);
        loadApplications();
      } else {
        toast({ title: "Ошибка", description: result.error || "Не удалось создать заявку", variant: "destructive" });
      }
      setSubmittingManualApp(false);
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      toast({ title: "Ошибка", description: error instanceof Error ? error.message : "Произошла ошибка при создании заявки", variant: "destructive" });
      setSubmittingManualApp(false);
      setManualAppUploadProgress(0);
    }
  };

  if (!isAuthenticated) {
    return (
      <AdminLoginPage
        login={login}
        setLogin={setLogin}
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        applicationsCount={applications.length}
        deletedApplicationsCount={deletedApplications.length}
        resultsCount={results.length}
        reviewsCount={reviews.length}
        certificatesLogLength={certificatesLog.length}
        setCertificatesLog={setCertificatesLog}
        setCertLoading={setCertLoading}
      />

      <div className="container mx-auto px-4 py-12">
        {activeTab === 'contests' && (
          <AdminContestsTab
            contests={contests}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            editingContest={editingContest}
            formData={formData}
            setFormData={setFormData}
            uploadingRules={uploadingRules}
            setUploadingRules={setUploadingRules}
            uploadingDiploma={uploadingDiploma}
            setUploadingDiploma={setUploadingDiploma}
            handleCreateContest={handleCreateContest}
            handleEditContest={handleEditContest}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            UPLOAD_URL={UPLOAD_URL}
          />
        )}

        {activeTab === 'applications' && (
          <AdminApplicationsTab
            contests={contests}
            applications={applications}
            deletedApplications={deletedApplications}
            applicationsSubTab={applicationsSubTab}
            setApplicationsSubTab={setApplicationsSubTab}
            applicationsWithResults={applicationsWithResults}
            isAppModalOpen={isAppModalOpen}
            setIsAppModalOpen={setIsAppModalOpen}
            editingApplication={editingApplication}
            setEditingApplication={setEditingApplication}
            appResult={appResult}
            setAppResult={setAppResult}
            appStatus={appStatus}
            setAppStatus={setAppStatus}
            isWorkPreviewOpen={isWorkPreviewOpen}
            setIsWorkPreviewOpen={setIsWorkPreviewOpen}
            workPreviewFiles={workPreviewFiles}
            setWorkPreviewFiles={setWorkPreviewFiles}
            workPreviewIndex={workPreviewIndex}
            setWorkPreviewIndex={setWorkPreviewIndex}
            isManualAppModalOpen={isManualAppModalOpen}
            setIsManualAppModalOpen={setIsManualAppModalOpen}
            manualAppFile={manualAppFile}
            setManualAppFile={setManualAppFile}
            manualContestName={manualContestName}
            setManualContestName={setManualContestName}
            submittingManualApp={submittingManualApp}
            manualAppUploadProgress={manualAppUploadProgress}
            handleCreateResultFromApplication={handleCreateResultFromApplication}
            handleDeleteApplication={handleDeleteApplication}
            handlePermanentDeleteApplication={handlePermanentDeleteApplication}
            handleRestoreApplication={handleRestoreApplication}
            handleManualAppSubmit={handleManualAppSubmit}
            loadApplications={loadApplications}
            loadDeletedApplications={loadDeletedApplications}
            APPLICATIONS_API_URL={APPLICATIONS_API_URL}
            UPLOAD_URL={UPLOAD_URL}
            toast={toast}
          />
        )}

        {(activeTab === 'results' || activeTab === 'reviews') && (
          <AdminResultsAndReviewsTab
            activeTab={activeTab}
            filteredResults={filteredResults}
            resultFilters={resultFilters}
            setResultFilters={setResultFilters}
            isResultModalOpen={isResultModalOpen}
            setIsResultModalOpen={setIsResultModalOpen}
            editingResult={editingResult}
            setEditingResult={setEditingResult}
            handleSaveResult={handleSaveResult}
            handleDeleteResult={handleDeleteResult}
            handleEditResult={handleEditResult}
            reviews={reviews}
            loadReviews={loadReviews}
            REVIEWS_API_URL={REVIEWS_API_URL}
            toast={toast}
          />
        )}

        {activeTab === 'certificates' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-heading font-bold text-primary">Выданные справки</h2>
              <Button variant="outline" size="sm" onClick={() => {
                setCertLoading(true);
                fetch(CERTIFICATES_LOG_URL)
                  .then(r => r.json())
                  .then(data => setCertificatesLog(data))
                  .finally(() => setCertLoading(false));
              }}>
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
            </div>
            {certLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground"><Icon name="Loader2" className="animate-spin" /> Загрузка...</div>
            ) : certificatesLog.length === 0 ? (
              <p className="text-muted-foreground">Справки ещё не выдавались</p>
            ) : (
              <div className="rounded-2xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold">ID</th>
                      <th className="text-left px-4 py-3 font-semibold">Участник</th>
                      <th className="text-left px-4 py-3 font-semibold">Конкурс</th>
                      <th className="text-left px-4 py-3 font-semibold">ID результата</th>
                      <th className="text-left px-4 py-3 font-semibold">Дата и время выдачи</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificatesLog.map((row, i) => (
                      <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                        <td className="px-4 py-3 text-muted-foreground">{row.id}</td>
                        <td className="px-4 py-3 font-medium">{row.full_name || '—'}</td>
                        <td className="px-4 py-3">{row.contest_name || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.result_id}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(row.issued_at).toLocaleString('ru-RU', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const res = await fetch(`https://functions.poehali.dev/7ea2c01d-bd1a-4567-b4f0-21aab3b96774?id=${row.result_id}`);
                              if (!res.ok) { toast({ title: 'Ошибка', description: 'Не удалось сформировать справку', variant: 'destructive' }); return; }
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `certificate_${row.result_id}_${(row.full_name || '').replace(/\s+/g, '_')}.pdf`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Icon name="Download" size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'revenue' && (
          <AdminRevenueTab applications={[...applications, ...deletedApplications]} />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsTab
            uploadingAppForm={uploadingAppForm}
            setUploadingAppForm={setUploadingAppForm}
            applicationFormUrl={applicationFormUrl}
            setApplicationFormUrl={setApplicationFormUrl}
            collectiveFreeEnabled={collectiveFreeEnabled}
            setCollectiveFreeEnabled={setCollectiveFreeEnabled}
            savingCollectiveFree={savingCollectiveFree}
            setSavingCollectiveFree={setSavingCollectiveFree}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
