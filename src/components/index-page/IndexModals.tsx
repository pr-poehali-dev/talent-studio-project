import { Dialog, DialogContent } from "@/components/ui/dialog";
import Coloring from "@/pages/Coloring";
import { Contest } from "./IndexTypes";
import ApplicationModal from "./modals/ApplicationModal";
import ImageModal from "./modals/ImageModal";
import PdfModal from "./modals/PdfModal";
import ReviewModal from "./modals/ReviewModal";

interface IndexModalsProps {
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

  isImageModalOpen: boolean;
  setIsImageModalOpen: (v: boolean) => void;
  imagePreview: string | null;

  isPdfModalOpen: boolean;
  setIsPdfModalOpen: (v: boolean) => void;
  pdfUrl: string | null;

  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (v: boolean) => void;

  isColoringModalOpen: boolean;
  setIsColoringModalOpen: (v: boolean) => void;
}

const IndexModals = ({
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
  isImageModalOpen,
  setIsImageModalOpen,
  imagePreview,
  isPdfModalOpen,
  setIsPdfModalOpen,
  pdfUrl,
  isReviewModalOpen,
  setIsReviewModalOpen,
  isColoringModalOpen,
  setIsColoringModalOpen,
}: IndexModalsProps) => {
  return (
    <>
      <ApplicationModal
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
      />

      <ImageModal
        isImageModalOpen={isImageModalOpen}
        setIsImageModalOpen={setIsImageModalOpen}
        imagePreview={imagePreview}
      />

      <PdfModal
        isPdfModalOpen={isPdfModalOpen}
        setIsPdfModalOpen={setIsPdfModalOpen}
        pdfUrl={pdfUrl}
      />

      <ReviewModal
        isReviewModalOpen={isReviewModalOpen}
        setIsReviewModalOpen={setIsReviewModalOpen}
      />

      <Dialog open={isColoringModalOpen} onOpenChange={setIsColoringModalOpen}>
        <DialogContent className="max-w-[98vw] w-[1200px] max-h-[95vh] overflow-hidden p-0 rounded-3xl">
          <Coloring />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IndexModals;
