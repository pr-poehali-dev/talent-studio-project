import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { Contest, contestCategories, getCategoryIcon } from "./IndexTypes";

interface IndexContestsProps {
  contests: Contest[];
  contestFilter: string | null;
  setContestFilter: (v: string | null) => void;
  setSelectedContest: (s: string) => void;
  setIsModalOpen: (v: boolean) => void;
  setImagePreview: (url: string) => void;
  setIsImageModalOpen: (v: boolean) => void;
  setPdfUrl: (url: string) => void;
  setIsPdfModalOpen: (v: boolean) => void;
}

const contestHeadings: Record<string, string> = {
  "visual-arts": "Всероссийские конкурсы изобразительного искусства",
  "decorative-arts": "Всероссийские конкурсы декоративно-прикладного искусства",
  "nature": "Всероссийские конкурсы изобразительного и декоративно-прикладного искусства, посвященные теме природы",
  "animals": "Всероссийские конкурсы изобразительного и декоративно-прикладного искусства, посвященные теме животных",
  "plants": "Всероссийские конкурсы изобразительного и декоративно-прикладного искусства, посвященные теме растений",
  "holidays": "Всероссийские конкурсы изобразительного и декоративно-прикладного искусства, посвященные теме праздников",
  "thematic": "Всероссийские тематические конкурсы изобразительного и декоративно-прикладного искусства",
  "literary": "Всероссийские конкурсы, посвященные литературным сюжетам и образам",
  "preschool": "Всероссийские конкурсы для детей дошкольного возраста",
  "artists-masters": "Всероссийские конкурсы ИЗО и ДПИ, посвященные творчеству выдающихся художников",
};

const IndexContests = ({
  contests,
  contestFilter,
  setContestFilter,
  setSelectedContest,
  setIsModalOpen,
  setImagePreview,
  setIsImageModalOpen,
  setPdfUrl,
  setIsPdfModalOpen,
}: IndexContestsProps) => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-5xl font-heading font-bold text-center mb-8 text-primary">🏆 Все конкурсы</h2>

      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            onClick={() => setContestFilter(null)}
            variant={contestFilter === null ? "default" : "outline"}
            className={`rounded-xl ${contestFilter === null ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            Все конкурсы
            <Badge className="ml-2" variant="secondary">{contests.length}</Badge>
          </Button>
          {contestCategories.map((category) => {
            const count = contests.filter(c => c.categoryId === category.id).length;
            return (
              <Button
                key={category.id}
                onClick={() => setContestFilter(category.id)}
                variant={contestFilter === category.id ? "default" : "outline"}
                className={`rounded-xl ${contestFilter === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
              >
                <Icon name={category.icon} size={18} className="mr-2" />
                {category.label}
                <Badge className="ml-2" variant="secondary">{count}</Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 max-w-5xl mx-auto">
        <h3 className="text-3xl font-heading font-bold text-center text-primary" data-editable={`contest-heading-${contestFilter ?? 'all'}`}>
          {contestFilter === null
            ? "Всероссийские конкурсы изобразительного и декоративно-прикладного искусства"
            : contestHeadings[contestFilter] ?? ""}
        </h3>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto">
        {contests
          .filter(contest => !contestFilter || contest.categoryId === contestFilter)
          .map((contest) => (
            <Card
              key={contest.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary rounded-3xl"
            >
              <div className="flex flex-col md:flex-row md:min-h-64">
                <div className="md:w-64 h-48 md:h-auto md:min-h-64 bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                  <div className="transition-all duration-300 absolute inset-0 flex items-center justify-center opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-75">
                    <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
                  </div>
                  <div className="transition-all duration-300 absolute inset-0 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100">
                    <img src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/b1debbdb-7197-41f7-93f1-a0cb0845bacf.png" alt="" className="w-full h-full object-contain p-2" />
                  </div>
                </div>
                <CardContent className="p-6 flex-[0.6] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-2xl font-heading font-bold text-primary">{contest.title}</h4>
                      {contest.status === "new" && (
                        <Badge className="bg-success text-success-foreground">Новый!</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{contest.description}</p>
                    <button
                      onClick={() => {
                        if (contest.rulesLink && contest.rulesLink !== '#') {
                          setPdfUrl(contest.rulesLink);
                          setIsPdfModalOpen(true);
                        }
                      }}
                      className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold mb-1"
                    >
                      <Icon name="FileText" size={16} />
                      Положение конкурса
                    </button>
                    <p className="text-sm font-semibold text-success">💰 Стоимость участия: {contest.price} ₽</p>
                  </div>
                  <Button
                    className="w-full md:w-auto rounded-xl bg-primary hover:bg-primary/90 px-8"
                    onClick={() => {
                      setSelectedContest(contest.title);
                      setIsModalOpen(true);
                    }}
                  >
                    Участвовать
                  </Button>
                </CardContent>
                <div className="flex-[0.4] p-3 flex flex-col items-center justify-center border-l">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 text-center">Образец диплома</p>
                  <div
                    className="w-full flex-1 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
                    onClick={() => {
                      setImagePreview(contest.diplomaImage);
                      setIsImageModalOpen(true);
                    }}
                  >
                    <img
                      src={contest.diplomaImage}
                      alt="Образец диплома"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
};

export default IndexContests;
