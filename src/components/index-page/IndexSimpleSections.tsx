import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { Contest, GalleryWork, Review, getCategoryIcon } from "./IndexTypes";

interface IndexSimpleSectionsProps {
  activeSection: string;
  contests: Contest[];
  galleryWorks: GalleryWork[];
  galleryVisible: number;
  setGalleryVisible: (v: number | ((prev: number) => number)) => void;
  reviews: Review[];
  applicationFormUrl: string | null;
  setIsReviewModalOpen: (v: boolean) => void;
  setImagePreview: (url: string) => void;
  setIsImageModalOpen: (v: boolean) => void;
  setPdfUrl: (url: string) => void;
  setIsPdfModalOpen: (v: boolean) => void;
  setSelectedContest: (s: string) => void;
  setIsModalOpen: (v: boolean) => void;
  setActiveSection: (s: string) => void;
}

const GALLERY_STEP = 16;

const categoryContests: Array<{
  section: string;
  emoji: string;
  title: string;
  categoryId: string;
}> = [
  { section: "visual-arts", emoji: "🎨", title: "Конкурсы изобразительного искусства", categoryId: "visual-arts" },
  { section: "decorative-arts", emoji: "✨", title: "Конкурсы декоративно-прикладного искусства", categoryId: "decorative-arts" },
  { section: "nature", emoji: "🌿", title: "Конкурсы, посвященные теме природы", categoryId: "nature" },
  { section: "animals", emoji: "🐾", title: "Конкурсы, посвященные теме животных", categoryId: "animals" },
  { section: "plants", emoji: "🌸", title: "Конкурсы, посвященные теме растений", categoryId: "plants" },
  { section: "holidays", emoji: "🎉", title: "Конкурсы, посвященные теме праздников", categoryId: "holidays" },
  { section: "thematic", emoji: "✨", title: "Тематические конкурсы ИЗО и ДПИ", categoryId: "thematic" },
  { section: "literary", emoji: "📚", title: "Конкурсы по литературным сюжетам", categoryId: "literary" },
  { section: "preschool", emoji: "🎈", title: "Конкурсы для дошкольников", categoryId: "preschool" },
  { section: "artists-masters", emoji: "🖼️", title: "Конкурсы о творчестве художников", categoryId: "artists-masters" },
];

const renderContestCard = (
  contest: Contest,
  setSelectedContest: (s: string) => void,
  setIsModalOpen: (v: boolean) => void,
  setImagePreview: (url: string) => void,
  setIsImageModalOpen: (v: boolean) => void,
  setPdfUrl: (url: string) => void,
  setIsPdfModalOpen: (v: boolean) => void,
) => (
  <Card
    key={contest.id}
    className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary rounded-3xl"
  >
    <div className="flex flex-col md:flex-row md:h-64">
      <div className="md:w-64 h-48 md:h-full bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center flex-shrink-0">
        <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
      </div>
      <CardContent className="p-6 flex-[0.6] flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-2xl font-heading font-bold text-primary">{contest.title}</h4>
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
);

const IndexSimpleSections = ({
  activeSection,
  contests,
  galleryWorks,
  galleryVisible,
  setGalleryVisible,
  reviews,
  applicationFormUrl,
  setIsReviewModalOpen,
  setImagePreview,
  setIsImageModalOpen,
  setPdfUrl,
  setIsPdfModalOpen,
  setSelectedContest,
  setIsModalOpen,
  setActiveSection,
}: IndexSimpleSectionsProps) => {
  const categorySection = categoryContests.find(c => c.section === activeSection);
  if (categorySection) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">
          {categorySection.emoji} {categorySection.title}
        </h2>
        <div className="space-y-6 max-w-5xl mx-auto">
          {contests.filter(c => c.categoryId === categorySection.categoryId).map(contest =>
            renderContestCard(contest, setSelectedContest, setIsModalOpen, setImagePreview, setIsImageModalOpen, setPdfUrl, setIsPdfModalOpen)
          )}
        </div>
      </div>
    );
  }

  if (activeSection === "gallery") {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-5xl font-heading font-bold text-center mb-12 text-secondary">🎨 Галерея работ</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryWorks.slice(0, galleryVisible).map((work) => (
            <Card
              key={work.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl cursor-pointer"
              onClick={() => {
                setImagePreview(work.work_file_url);
                setIsImageModalOpen(true);
              }}
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
                <p className="text-xs text-muted-foreground mb-1">👤 {work.full_name}{work.age ? `, ${work.age} лет` : ''}</p>
                <p className="text-xs text-muted-foreground">🏆 {work.contest_name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {galleryVisible < galleryWorks.length && (
          <div className="text-center mt-10">
            <p className="text-sm text-muted-foreground mb-3">Показано {galleryVisible} из {galleryWorks.length}</p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setGalleryVisible(v => v + GALLERY_STEP)}
            >
              Показать ещё
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (activeSection === "documents") {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">📄 Документы</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {applicationFormUrl && (
            <a href={applicationFormUrl} download className="block">
              <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-x-2 rounded-2xl cursor-pointer border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                      <Icon name="ClipboardList" className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-semibold">Лист подачи заявки</h3>
                      <p className="text-sm text-muted-foreground">Бланк заявки для участия в конкурсе (скачать)</p>
                    </div>
                  </div>
                  <Icon name="Download" className="text-primary" size={24} />
                </div>
              </Card>
            </a>
          )}
          {contests
            .filter(c => c.rulesLink && c.rulesLink !== '#')
            .sort((a, b) => a.title.localeCompare(b.title, 'ru'))
            .map((contest, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-x-2 rounded-2xl cursor-pointer"
              onClick={() => {
                setPdfUrl(contest.rulesLink);
                setIsPdfModalOpen(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-info to-success rounded-xl flex items-center justify-center">
                    <Icon name="FileText" className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-heading font-semibold">{contest.title} - положение</h3>
                </div>
                <Icon name="ExternalLink" className="text-info" size={24} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === "shop") {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">🛍️ Магазин наградной атрибутики</h2>
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden rounded-3xl shadow-2xl border-2 border-primary/20">
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-12 text-center">
              <div className="mb-8">
                <Icon name="Award" className="mx-auto text-primary mb-4" size={80} />
              </div>
              <h3 className="text-3xl font-heading font-bold text-primary mb-6">Скоро открытие!</h3>
              <div className="max-w-2xl mx-auto space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Мы рады сообщить, что в ближайшее время в нашем магазине появится возможность
                  заказать <span className="font-semibold text-primary">наградную атрибутику</span> для юных победителей!
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-8 text-left">
                  <div className="flex items-start gap-3">
                    <Icon name="Trophy" className="text-primary flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-semibold text-primary">Кубки и медали</p>
                      <p className="text-sm text-muted-foreground">Именные награды для настоящих победителей</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Award" className="text-primary flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-semibold text-primary">Оригиналы дипломов</p>
                      <p className="text-sm text-muted-foreground">Красочные дипломы с печатью и подписью</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="Medal" className="text-primary flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-semibold text-primary">Памятные награды</p>
                      <p className="text-sm text-muted-foreground">Значки, ленты и другая атрибутика</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="FileText" className="text-primary flex-shrink-0 mt-1" size={24} />
                    <div>
                      <p className="font-semibold text-primary">Благодарственные письма</p>
                      <p className="text-sm text-muted-foreground">Для педагогов и родителей</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-primary/20">
                  <p className="text-base">
                    Следите за обновлениями! Уже совсем скоро вы сможете увековечить достижения
                    ваших талантливых детей с помощью качественной наградной продукции.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === "reviews") {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">💬 Отзывы</h2>

        <div className="max-w-2xl mx-auto mb-12">
          <Card className="p-8 rounded-3xl shadow-2xl border-2 border-primary/20">
            <h3 className="text-2xl font-heading font-bold text-primary mb-6 text-center">Оставьте свой отзыв</h3>
            <p className="text-center text-muted-foreground mb-6">Поделитесь своим мнением о работе нашей студии. Все отзывы проходят модерацию перед публикацией.</p>
            <Button
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-lg py-6"
            >
              <Icon name="MessageSquare" className="mr-2" />
              Написать отзыв
            </Button>
          </Card>
        </div>

        <div className="max-w-5xl mx-auto">
          {reviews.length === 0 ? (
            <Card className="p-12 rounded-3xl text-center">
              <Icon name="MessageSquare" size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-xl text-muted-foreground">Пока нет опубликованных отзывов</p>
              <p className="text-sm text-muted-foreground mt-2">Станьте первым, кто поделится мнением!</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Icon key={i} name="Star" className="text-secondary fill-secondary" size={20} />
                    ))}
                  </div>
                  <p className="text-lg mb-4 italic">"{review.text}"</p>
                  <div>
                    <p className="font-semibold text-primary">{review.author_name}</p>
                    {review.author_role && (
                      <p className="text-sm text-muted-foreground">{review.author_role}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === "about") {
    return (
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-5xl font-heading font-bold text-center mb-12 text-primary">👋 О нас</h2>
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 rounded-3xl shadow-2xl mb-8">
            <p className="text-lg leading-relaxed mb-6">
              <strong className="text-primary text-2xl">Студия талантов "Мечтай, твори, дерзай!"</strong> - это онлайн-платформа для юных художников и творцов!
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Мы создали пространство, где каждый ребенок может:
            </p>
            <ul className="space-y-3 text-lg mb-6">
              <li className="flex items-start gap-3">
                <Icon name="CheckCircle" className="text-success mt-1" size={24} />
                <span>Участвовать в интересных конкурсах</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="CheckCircle" className="text-success mt-1" size={24} />
                <span>Делиться своими работами с друзьями</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="CheckCircle" className="text-success mt-1" size={24} />
                <span>Получать призы и признание</span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="CheckCircle" className="text-success mt-1" size={24} />
                <span>Развивать свои творческие способности</span>
              </li>
            </ul>
            <div className="bg-gradient-to-r from-accent/30 to-transparent p-6 rounded-2xl">
              <p className="text-lg font-semibold">
                🎯 Наша миссия: вдохновлять детей на творчество и помогать раскрывать их таланты!
              </p>
            </div>
          </Card>
          <div className="text-center">
            <Button size="lg" className="text-lg px-8 py-6 rounded-2xl bg-gradient-to-r from-primary to-secondary">
              <Icon name="Mail" className="mr-2" />
              Связаться с нами
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default IndexSimpleSections;
