import { Card, CardContent } from "@/components/ui/card";
import { GalleryWork } from "./IndexTypes";

interface GalleryWorkCardProps {
  work: GalleryWork;
  onOpen: (url: string) => void;
}

const GalleryWorkCard = ({ work, onOpen }: GalleryWorkCardProps) => (
  <Card
    className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl cursor-pointer"
    onClick={() => onOpen(work.work_file_url)}
  >
    <div className="h-48 overflow-hidden">
      <img
        src={work.work_file_url}
        alt={work.work_title}
        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
      />
    </div>
    <CardContent className="p-4">
      <h4 className="text-base font-heading font-bold mb-1">{work.work_title}</h4>
      <p className="text-xs text-muted-foreground mb-1">👤 {work.full_name}{work.age && work.age !== '—' ? `, ${work.age}` : ''}</p>
      {work.study_year && (
        <p className="text-xs text-muted-foreground mb-1">📚 {work.study_year}</p>
      )}
      <p className="text-xs text-muted-foreground">🏆 {work.contest_name}</p>
    </CardContent>
  </Card>
);

export default GalleryWorkCard;
