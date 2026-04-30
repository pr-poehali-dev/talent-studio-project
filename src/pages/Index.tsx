import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

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
  API_URL,
  GALLERY_API_URL,
  REVIEWS_API_URL,
  SETTINGS_API_URL,
} from "@/components/index-page/IndexTypes";

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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [resultFilters, setResultFilters] = useState({
    contest: '',
    fullName: '',
    result: 'all',
    date: undefined as Date | undefined
  });
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

    setFilteredResults(filtered);
    setResultsPage(1);
  }, [results, resultFilters]);

  const simpleSections = [
    'gallery', 'documents', 'shop', 'reviews', 'about',
    'visual-arts', 'decorative-arts', 'nature', 'animals',
    'plants', 'holidays', 'thematic', 'literary', 'preschool', 'artists-masters'
  ];

  return (
    <div className="min-h-screen bg-white">
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