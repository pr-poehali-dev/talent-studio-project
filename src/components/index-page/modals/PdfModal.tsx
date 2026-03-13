import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PdfModalProps {
  isPdfModalOpen: boolean;
  setIsPdfModalOpen: (v: boolean) => void;
  pdfUrl: string | null;
}

const PdfModal = ({ isPdfModalOpen, setIsPdfModalOpen, pdfUrl }: PdfModalProps) => {
  return (
    <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] p-0 overflow-hidden rounded-3xl">
        <div className="relative w-full h-[90vh] bg-white">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 rounded-full shadow-lg"
            onClick={() => setIsPdfModalOpen(false)}
          >
            <Icon name="X" size={24} />
          </Button>
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Положение конкурса"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfModal;
