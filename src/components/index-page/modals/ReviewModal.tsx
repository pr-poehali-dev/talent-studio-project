import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { REVIEWS_API_URL } from "../IndexTypes";

interface ReviewModalProps {
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (v: boolean) => void;
}

const ReviewModal = ({ isReviewModalOpen, setIsReviewModalOpen }: ReviewModalProps) => {
  const { toast } = useToast();

  return (
    <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-heading font-bold text-primary">
            ✍️ Напишите отзыв
          </DialogTitle>
          <DialogDescription className="text-base">
            Поделитесь своим опытом участия в конкурсах студии
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5 mt-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            try {
              const response = await fetch(REVIEWS_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  author_name: formData.get('author_name'),
                  author_role: formData.get('author_role') || null,
                  rating: parseInt(formData.get('rating') as string),
                  text: formData.get('text')
                })
              });

              const result = await response.json();

              if (response.ok) {
                toast({
                  title: "Отзыв отправлен!",
                  description: "Спасибо за ваш отзыв!",
                });
                setIsReviewModalOpen(false);
                e.currentTarget.reset();
              } else {
                toast({
                  title: "Ошибка",
                  description: result.error || "Произошла ошибка при отправке",
                  variant: "destructive"
                });
              }
            } catch {
              toast({
                title: "Ошибка",
                description: "Произошла ошибка при отправке отзыва",
                variant: "destructive"
              });
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="author_name" className="text-base font-semibold">Ваше имя *</Label>
            <Input id="author_name" name="author_name" placeholder="Как вас зовут?" required className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author_role" className="text-base font-semibold">Ваша роль</Label>
            <Input id="author_role" name="author_role" placeholder="Например: Мама участника, Педагог, и т.д." className="rounded-xl border-2 focus:border-primary" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating" className="text-base font-semibold">Оценка *</Label>
            <Select name="rating" required>
              <SelectTrigger className="rounded-xl border-2 focus:border-primary">
                <SelectValue placeholder="Выберите оценку" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">⭐⭐⭐⭐⭐ Отлично</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ Хорошо</SelectItem>
                <SelectItem value="3">⭐⭐⭐ Нормально</SelectItem>
                <SelectItem value="2">⭐⭐ Плохо</SelectItem>
                <SelectItem value="1">⭐ Ужасно</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text" className="text-base font-semibold">Ваш отзыв *</Label>
            <textarea
              id="text"
              name="text"
              placeholder="Расскажите о вашем опыте участия в конкурсах студии..."
              required
              rows={6}
              className="flex min-h-[120px] w-full rounded-xl border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            className="w-full text-lg py-6 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            <Icon name="Send" className="mr-2" />
            Отправить отзыв
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;