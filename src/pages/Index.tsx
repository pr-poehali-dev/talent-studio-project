import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import Seo from "@/components/Seo";
import IndexNav from "@/components/index-page/IndexNav";
import IndexHome from "@/components/index-page/IndexHome";
import IndexModals from "@/components/index-page/IndexModals";
import IndexContests from "@/components/index-page/IndexContests";
import IndexResultsSection from "@/components/index-page/IndexResultsSection";
import IndexSimpleSections from "@/components/index-page/IndexSimpleSections";
import IndexDesignerSection from "@/components/index-page/IndexDesignerSection";
import IndexFooter from "@/components/index-page/IndexFooter";
import IndexJurySection from "@/components/index-page/IndexJurySection";
import IndexOlympiadsSection from "@/components/index-page/IndexOlympiadsSection";
import {
  Contest,
  PublicResult,
  GalleryWork,
  Review,
  MonthlyRegistry,
  API_URL,
  GALLERY_API_URL,
  REVIEWS_API_URL,
  SETTINGS_API_URL,
  GENERATE_REGISTRY_URL,
  contestCategories,
} from "@/components/index-page/IndexTypes";

const SECTION_SEO: Record<string, { title: string; description: string; path: string }> = {
  home: {
    title: "Студия талантов «Мечтай, твори, дерзай» — творческие конкурсы для детей и взрослых",
    description: "Всероссийские онлайн-конкурсы по изобразительному и декоративно-прикладному искусству для детей и взрослых. Дипломы, грамоты, галерея работ. Участвуйте и побеждайте!",
    path: "/",
  },
  contests: {
    title: "Все конкурсы — Студия талантов «Мечтай, твори, дерзай»",
    description: "Каталог всероссийских конкурсов изобразительного и декоративно-прикладного искусства для детей и взрослых. Выберите конкурс и подайте заявку онлайн.",
    path: "/contests",
  },
  results: {
    title: "Итоги конкурсов и олимпиад — Студия талантов «Мечтай, твори, дерзай»",
    description: "Результаты участников всероссийских конкурсов и олимпиад по изобразительному и декоративно-прикладному искусству за 2026 год.",
    path: "/results",
  },
  gallery: {
    title: "Галерея работ участников — Студия талантов «Мечтай, твори, дерзай»",
    description: "Лучшие творческие работы участников всероссийских конкурсов изобразительного и декоративно-прикладного искусства.",
    path: "/gallery",
  },
  documents: {
    title: "Документы и положения конкурсов — Студия талантов «Мечтай, твори, дерзай»",
    description: "Реестры сведений об участниках и результатах, положения конкурсов и листы заявок студии талантов «Мечтай, твори, дерзай».",
    path: "/documents",
  },
  reviews: {
    title: "Отзывы участников — Студия талантов «Мечтай, твори, дерзай»",
    description: "Отзывы родителей, педагогов и участников о всероссийских конкурсах студии талантов «Мечтай, твори, дерзай».",
    path: "/reviews",
  },
  about: {
    title: "О нас — Студия талантов «Мечтай, твори, дерзай»",
    description: "Студия талантов «Мечтай, твори, дерзай» — онлайн-платформа для юных художников и творцов. Конкурсы, дипломы, галерея работ.",
    path: "/about",
  },
  shop: {
    title: "Магазин наградной атрибутики — Студия талантов «Мечтай, твори, дерзай»",
    description: "Кубки, медали, дипломы и другая наградная атрибутика для победителей конкурсов студии талантов «Мечтай, твори, дерзай».",
    path: "/shop",
  },
  designer: {
    title: "Услуги дизайнера — Студия талантов «Мечтай, твори, дерзай»",
    description: "Разработка афиш, дипломов, грамот, благодарственных писем и фирменного стиля для конкурсов и мероприятий.",
    path: "/designer",
  },
  jury: {
    title: "Наша команда — Студия талантов «Мечтай, твори, дерзай»",
    description: "Профессионалы в области искусства, педагогики и дизайна, которые развивают студию и оценивают работы участников конкурсов.",
    path: "/?section=jury",
  },
  olympiads: {
    title: "Интерактивные олимпиады — Студия талантов «Мечтай, твори, дерзай»",
    description: "Всероссийские интерактивные олимпиады по ИЗО и ДПИ для школьников — выполняйте задания онлайн, без скачивания файлов.",
    path: "/?section=olympiads",
  },
};

const Index = () => {
  const [searchParams] = useSearchParams();
  const initialSection = searchParams.get('section') || 'home';
  const categoryParam = searchParams.get('category');
  const [activeSection, setActiveSection] = useState(initialSection);
  const [showCatWelcome, setShowCatWelcome] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [applicationFormUrl, setApplicationFormUrl] = useState<string | null>(null);
  const [showContestsDropdown, setShowContestsDropdown] = useState(false);
  const [contestFilter, setContestFilter] = useState<string | null>(categoryParam);
  const [isColoringModalOpen, setIsColoringModalOpen] = useState(false);

  const [contests, setContests] = useState<Contest[]>([]);
  const [results, setResults] = useState<PublicResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<PublicResult[]>([]);
  const [galleryWorks, setGalleryWorks] = useState<GalleryWork[]>([]);
  const [galleryVisible, setGalleryVisible] = useState(16);
  const GALLERY_STEP = 16;
  const [featuredWorks, setFeaturedWorks] = useState<GalleryWork[]>([]);
  const [featuredPage, setFeaturedPage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [registries, setRegistries] = useState<MonthlyRegistry[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [resultFilters, setResultFilters] = useState({
    contest: '',
    fullName: '',
    result: 'all',
    date: undefined as Date | undefined
  });
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [resultsPage, setResultsPage] = useState(1);
  const RESULTS_PER_PAGE = 20;

  useEffect(() => {
    const loadContests = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setContests(data);
      } catch (error) {
        console.error('Ошибка загрузки конкурсов:', error);
      }
    };
    loadContests();
  }, []);

  useEffect(() => {
    if (window.location.pathname === '/results') {
      setActiveSection('results');
    }
    if (categoryParam) {
      setActiveSection('contests');
      setContestFilter(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(SETTINGS_API_URL);
        const data = await response.json();
        if (data.application_form_url) {
          setApplicationFormUrl(data.application_form_url);
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const loadFeaturedWorks = async () => {
      try {
        const response = await fetch(`${GALLERY_API_URL}?featured=true`);
        const data = await response.json();
        setFeaturedWorks(data);
      } catch (error) {
        console.error('Ошибка загрузки лучших работ:', error);
      }
    };
    if (activeSection === 'home') {
      loadFeaturedWorks();
    }
  }, [activeSection]);

  useEffect(() => {
    const loadGalleryWorks = async () => {
      try {
        const response = await fetch(GALLERY_API_URL);
        const data = await response.json();
        setGalleryWorks(data);
      } catch (error) {
        console.error('Ошибка загрузки работ галереи:', error);
      }
    };
    if (activeSection === 'gallery') {
      setGalleryVisible(16);
      loadGalleryWorks();
    }
  }, [activeSection]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch(`${REVIEWS_API_URL}?status=approved`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
      }
    };
    if (activeSection === 'reviews') {
      loadReviews();
    }
  }, [activeSection]);

  useEffect(() => {
    const loadRegistries = async () => {
      try {
        const response = await fetch(`${GENERATE_REGISTRY_URL}?action=list`);
        const data = await response.json();
        setRegistries(data);
      } catch (error) {
        console.error('Ошибка загрузки реестров:', error);
      }
    };
    if (activeSection === 'documents') {
      loadRegistries();
    }
  }, [activeSection]);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/181f157e-94db-4c48-b7f6-a9d8f1a6e7b6');
        const data = await response.json();
        setResults(data);
        setFilteredResults(data);
      } catch (error) {
        console.error('Ошибка загрузки результатов:', error);
      }
    };
    if (activeSection === 'results') {
      loadResults();
    }
  }, [activeSection]);

  useEffect(() => {
    let filtered = [...results];

    if (selectedMonth !== null) {
      filtered = filtered.filter(r => {
        if (!r.diploma_issued_at) return false;
        return new Date(r.diploma_issued_at).getMonth() === selectedMonth;
      });
    }

    if (resultFilters.contest) {
      filtered = filtered.filter(r =>
        r.contest_name.toLowerCase().includes(resultFilters.contest.toLowerCase())
      );
    }

    if (resultFilters.fullName) {
      filtered = filtered.filter(r =>
        r.full_name.toLowerCase().includes(resultFilters.fullName.toLowerCase())
      );
    }

    if (resultFilters.result !== 'all') {
      filtered = filtered.filter(r => r.result === resultFilters.result);
    }

    if (resultFilters.date) {
      filtered = filtered.filter(r => {
        if (!r.diploma_issued_at) return false;
        const resultDate = new Date(r.diploma_issued_at);
        const filterDate = new Date(resultFilters.date!);
        return resultDate.toDateString() === filterDate.toDateString();
      });
    }

    filtered.sort((a, b) => {
      const dateA = a.diploma_issued_at ? new Date(a.diploma_issued_at).getTime() : 0;
      const dateB = b.diploma_issued_at ? new Date(b.diploma_issued_at).getTime() : 0;
      return dateA - dateB;
    });

    setFilteredResults(filtered);
    setResultsPage(1);
  }, [results, resultFilters, selectedMonth]);

  const simpleSections = [
    'gallery', 'documents', 'shop', 'reviews', 'about',
    'visual-arts', 'decorative-arts', 'nature', 'animals',
    'plants', 'holidays', 'thematic', 'literary', 'preschool', 'artists-masters'
  ];

  const category = contestCategories.find(c => c.id === activeSection);
  const seo = category
    ? {
        title: `${category.heading} — Студия талантов «Мечтай, твори, дерзай»`,
        description: `${category.heading}: участвуйте во всероссийских творческих конкурсах для детей и взрослых. Дипломы, грамоты, участие онлайн.`,
        path: `/?section=${category.id}`,
      }
    : SECTION_SEO[activeSection] || SECTION_SEO.home;

  return (
    <div className="min-h-screen bg-white">
      <Seo title={seo.title} description={seo.description} path={seo.path} />
      <IndexNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        showCatWelcome={showCatWelcome}
        setShowCatWelcome={setShowCatWelcome}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        mobileOpenSubmenu={mobileOpenSubmenu}
        setMobileOpenSubmenu={setMobileOpenSubmenu}
        showContestsDropdown={showContestsDropdown}
        setShowContestsDropdown={setShowContestsDropdown}
        setContestFilter={setContestFilter}
        setIsColoringModalOpen={setIsColoringModalOpen}
      />

      {activeSection === "home" && (
        <IndexHome
          contests={contests}
          featuredWorks={featuredWorks}
          featuredPage={featuredPage}
          setFeaturedPage={setFeaturedPage}
          setActiveSection={setActiveSection}
          setSelectedContest={setSelectedContest}
          setIsModalOpen={setIsModalOpen}
          setImagePreview={setImagePreview}
          setIsImageModalOpen={setIsImageModalOpen}
          setPdfUrl={setPdfUrl}
          setIsPdfModalOpen={setIsPdfModalOpen}
          applicationFormUrl={applicationFormUrl}
        />
      )}

      {activeSection === "contests" && (
        <IndexContests
          contests={contests}
          contestFilter={contestFilter}
          setContestFilter={setContestFilter}
          setSelectedContest={setSelectedContest}
          setIsModalOpen={setIsModalOpen}
          setImagePreview={setImagePreview}
          setIsImageModalOpen={setIsImageModalOpen}
          setPdfUrl={setPdfUrl}
          setIsPdfModalOpen={setIsPdfModalOpen}
        />
      )}

      {activeSection === "results" && (
        <IndexResultsSection
          filteredResults={filteredResults}
          resultFilters={resultFilters}
          setResultFilters={setResultFilters}
          resultsPage={resultsPage}
          setResultsPage={setResultsPage}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />
      )}

      {activeSection === "jury" && <IndexJurySection />}

      {activeSection === "olympiads" && <IndexOlympiadsSection />}

      {activeSection === "designer" && (
        <IndexDesignerSection
          setImagePreview={setImagePreview}
          setIsImageModalOpen={setIsImageModalOpen}
        />
      )}

      {simpleSections.includes(activeSection) && (
        <IndexSimpleSections
          activeSection={activeSection}
          contests={contests}
          galleryWorks={galleryWorks}
          galleryVisible={galleryVisible}
          setGalleryVisible={setGalleryVisible}
          reviews={reviews}
          registries={registries}
          applicationFormUrl={applicationFormUrl}
          setIsReviewModalOpen={setIsReviewModalOpen}
          setImagePreview={setImagePreview}
          setIsImageModalOpen={setIsImageModalOpen}
          setPdfUrl={setPdfUrl}
          setIsPdfModalOpen={setIsPdfModalOpen}
          setSelectedContest={setSelectedContest}
          setIsModalOpen={setIsModalOpen}
          setActiveSection={setActiveSection}
        />
      )}

      <IndexModals
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        selectedContest={selectedContest}
        contests={contests}
        uploadedFile={uploadedFile}
        setUploadedFile={setUploadedFile}
        uploadProgress={uploadProgress}
        setUploadProgress={setUploadProgress}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        applicationFormUrl={applicationFormUrl}
        isImageModalOpen={isImageModalOpen}
        setIsImageModalOpen={setIsImageModalOpen}
        imagePreview={imagePreview}
        isPdfModalOpen={isPdfModalOpen}
        setIsPdfModalOpen={setIsPdfModalOpen}
        pdfUrl={pdfUrl}
        isReviewModalOpen={isReviewModalOpen}
        setIsReviewModalOpen={setIsReviewModalOpen}
        isColoringModalOpen={isColoringModalOpen}
        setIsColoringModalOpen={setIsColoringModalOpen}
      />

      <IndexFooter setActiveSection={setActiveSection} />
    </div>
  );
};

export default Index;