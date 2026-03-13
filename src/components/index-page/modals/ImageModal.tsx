import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageModalProps {
  isImageModalOpen: boolean;
  setIsImageModalOpen: (v: boolean) => void;
  imagePreview: string | null;
}

const ImageModal = ({ isImageModalOpen, setIsImageModalOpen, imagePreview }: ImageModalProps) => {
  return (
    <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden rounded-3xl">
        <div className="relative w-full h-full flex items-center justify-center bg-black/95">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full"
            onClick={() => setIsImageModalOpen(false)}
          >
            <Icon name="X" size={24} />
          </Button>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Увеличенное изображение"
              className="max-w-full max-h-[85vh] object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
