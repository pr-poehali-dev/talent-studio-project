import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { CERTIFICATES_LOG_URL } from "./AdminTypes";

type Tab = 'contests' | 'applications' | 'results' | 'reviews' | 'certificates' | 'settings' | 'revenue' | 'olympiads' | 'clients' | 'participants';

interface AdminNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onLogout: () => void;
  applicationsCount: number;
  deletedApplicationsCount: number;
  resultsCount: number;
  reviewsCount: number;
  certificatesLogLength: number;
  setCertificatesLog: (data: {id: number; result_id: number; full_name: string; contest_name: string; issued_at: string}[]) => void;
  setCertLoading: (v: boolean) => void;
}

export default function AdminNav({
  activeTab,
  setActiveTab,
  onLogout,
  applicationsCount,
  deletedApplicationsCount,
  resultsCount,
  reviewsCount,
  certificatesLogLength,
  setCertificatesLog,
  setCertLoading,
}: AdminNavProps) {
  const handleCertificatesClick = () => {
    setActiveTab('certificates');
    if (certificatesLogLength === 0) {
      setCertLoading(true);
      fetch(CERTIFICATES_LOG_URL)
        .then(r => r.json())
        .then(data => setCertificatesLog(data))
        .finally(() => setCertLoading(false));
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-md shadow-md bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-white">Админ-панель</h1>
            <Button onClick={onLogout} variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
              <Icon name="LogOut" className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex gap-4 mb-8 border-b">
        <Button
          variant={activeTab === 'contests' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('contests')}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="Trophy" className="mr-2" />
          Конкурсы
        </Button>
        <Button
          variant={activeTab === 'applications' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('applications')}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="FileText" className="mr-2" />
          Заявки ({applicationsCount + deletedApplicationsCount})
        </Button>
        <Button
          variant={activeTab === 'results' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('results')}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="Award" className="mr-2" />
          Результаты ({resultsCount})
        </Button>
        <Button
          variant={activeTab === 'reviews' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('reviews')}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="MessageSquare" className="mr-2" />
          Отзывы ({reviewsCount})
        </Button>
        <Button
          variant={activeTab === 'certificates' ? 'default' : 'ghost'}
          onClick={handleCertificatesClick}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="ScrollText" className="mr-2" />
          Выданные справки
        </Button>
        <Button
          variant={activeTab === 'revenue' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('revenue')}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="TrendingUp" className="mr-2" />
          Доходность
        </Button>
        <Button
          variant={activeTab === 'olympiads' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('olympiads')}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="GraduationCap" className="mr-2" />
          Олимпиады
        </Button>
        <Button
          variant={activeTab === 'clients' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('clients')}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="Users" className="mr-2" />
          Клиенты
        </Button>
        <Button
          variant={activeTab === 'participants' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('participants')}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="AtSign" className="mr-2" />
          Адреса участников
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('settings')}
          className="rounded-t-xl rounded-b-none"
        >
          <Icon name="Settings" className="mr-2" />
          Настройки
        </Button>
      </div>
    </>
  );
}