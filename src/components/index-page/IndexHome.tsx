import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { Contest, GalleryWork, getCategoryIcon } from "./IndexTypes";

interface IndexHomeProps {
  contests: Contest[];
  featuredWorks: GalleryWork[];
  featuredPage: number;
  setFeaturedPage: (fn: (p: number) => number) => void;
  setActiveSection: (s: string) => void;
  setSelectedContest: (s: string) => void;
  setIsModalOpen: (v: boolean) => void;
  setImagePreview: (url: string) => void;
  setIsImageModalOpen: (v: boolean) => void;
  setPdfUrl: (url: string) => void;
  setIsPdfModalOpen: (v: boolean) => void;
}

const FEATURED_PER_PAGE = 8;

const IndexHome = ({
  contests,
  featuredWorks,
  featuredPage,
  setFeaturedPage,
  setActiveSection,
  setSelectedContest,
  setIsModalOpen,
  setImagePreview,
  setIsImageModalOpen,
  setPdfUrl,
  setIsPdfModalOpen,
}: IndexHomeProps) => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-[40px] py-12">

      {/* Рекламный баннер — групповая скидка */}
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-5 md:px-8 md:py-6 shadow-2xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/10"
                style={{
                  width: `${Math.random() * 60 + 15}px`,
                  height: `${Math.random() * 60 + 15}px`,
                  top: `${Math.random() * 100}%`,
                  left: `-100px`,
                  animation: `floatRight ${6 + i * 1.2}s linear ${i * 0.8}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-pink-400/10 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
                🔥 Выгодное предложение
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-white leading-tight mb-2">
                Коллективная заявка —{' '}
                <span className="text-yellow-300">150 ₽ за участника!</span>
              </h3>
              <p className="text-white/80 text-sm md:text-base max-w-md">
                Подайте заявку на <strong className="text-white">5 и более участников</strong> и получите специальную цену вместо стандартной
              </p>
            </div>

            <div className="flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-2 mb-2">
                  {[1,2,3,4,5].map((n) => (
                    <div key={n} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${n <= 4 ? 'bg-white/20 text-white/60 h-8' : 'bg-yellow-300 text-purple-900 h-11 shadow-lg shadow-yellow-400/40'}`}
                        style={n === 5 ? {animation: 'pulse 2s ease-in-out infinite'} : {}}
                      >
                        {n === 5 ? '🏆' : n}
                      </div>
                      {n === 5 && <span className="text-yellow-300 text-xs font-bold">скидка!</span>}
                    </div>
                  ))}
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2 text-center border border-white/20">
                  <div className="text-yellow-300 text-2xl font-bold font-heading">150 ₽</div>
                  <div className="text-white/70 text-xs">за одного участника</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-shrink-0 min-w-[180px]">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 bg-white/10 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-white/50 line-through text-sm">от 200 ₽</span>
                  <span className="text-white/40 text-xs">→</span>
                  <span className="text-yellow-300 font-bold text-sm">150 ₽</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 border border-white/10">
                  <span className="text-lg">⚡</span>
                  <span className="text-white/80 text-xs">Одна заявка на всех</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/collective')}
                className="inline-flex items-center justify-center gap-2 bg-yellow-300 hover:bg-yellow-200 text-purple-900 font-bold px-6 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/30 text-sm w-full"
              >
                Подать заявку
              </button>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes floatRight {
            0% { transform: translateX(0) scale(0.8); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 0.5; }
            100% { transform: translateX(calc(100vw + 200px)) scale(1.2); opacity: 0; }
          }
        `}</style>
      </section>

      <section className="text-center mb-16 animate-in fade-in duration-700">
        <h2 className="text-5xl md:text-7xl font-heading mb-6 font-bold" style={{ color: '#E31E24' }}>Мечтай, твори, дерзай!</h2>
        <p className="max-w-4xl mx-auto mb-4 py-[3px] text-xl font-normal text-center text-slate-600">Кот Ван Гог и студия талантов «Мечтай, твори, дерзай!» приглашают учащихся и педагогов художественных школ и студий, художников‑любителей и профессионалов, а также всех, кто любит творить и хочет представить свои работы широкой аудитории к участию во Всероссийских конкурсах изобразительного и декоративно-прикладного искусства!</p>
        <div className="max-w-3xl mx-auto mb-8 flex items-center gap-6 bg-white border-l-8 border-primary rounded-2xl shadow-md px-10 py-6 text-left">
          <span className="text-5xl">🎓</span>
          <p className="text-xl text-slate-700 font-medium leading-relaxed">
            Дипломы, выдаваемые по итогам участия в наших конкурсах, имеют официальный статус и принимаются в качестве подтверждающих документов при{" "}
            <span className="text-primary font-bold underline decoration-2 underline-offset-4">прохождении педагогами процедуры аттестации</span>
          </p>
        </div>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl"
            onClick={() => setActiveSection("contests")}
          >
            <Icon name="Palette" className="mr-2" />
            Участвовать в конкурсе
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6 rounded-2xl border-2 border-secondary text-secondary hover:bg-secondary hover:text-white"
            onClick={() => setActiveSection("gallery")}
          >
            <Icon name="Image" className="mr-2" />
            Смотреть галерею
          </Button>
        </div>
      </section>

      {contests.filter(c => c.status === "new").length > 0 && (
        <section className="mb-16">
          <h3 className="text-4xl font-heading font-bold text-center mb-8" style={{ color: '#FF8C00' }}>✨ Новые конкурсы</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {contests.filter(c => c.status === "new").map((contest) => (
              <Card
                key={contest.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 rounded-3xl"
                style={{ borderColor: '#FF8C00' }}
              >
                <div className="h-40 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 flex items-center justify-center relative">
                  <Icon name={getCategoryIcon(contest.categoryId)} style={{ color: '#FF8C00' }} size={60} />
                  <Badge className="absolute top-2 right-2 text-white" style={{ backgroundColor: '#FF8C00' }}>Новый!</Badge>
                </div>
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h4 className="text-lg font-heading font-bold text-primary">{contest.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{contest.description}</p>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#FF8C00' }}>💰 {contest.price} ₽</p>
                  <button
                    onClick={() => {
                      if (contest.rulesLink && contest.rulesLink !== '#') {
                        setPdfUrl(contest.rulesLink);
                        setIsPdfModalOpen(true);
                      }
                    }}
                    className="text-xs hover:underline flex items-center gap-1 font-semibold mb-2"
                    style={{ color: '#FF8C00' }}
                  >
                    <Icon name="FileText" size={14} />
                    Положение конкурса
                  </button>
                  <button
                    onClick={() => {
                      setImagePreview(contest.diplomaImage);
                      setIsImageModalOpen(true);
                    }}
                    className="text-xs hover:underline flex items-center gap-1 font-semibold mb-3"
                    style={{ color: '#FF8C00' }}
                  >
                    <Icon name="Award" size={14} />
                    Образец диплома
                  </button>
                  <Button
                    className="w-full rounded-xl text-white hover:opacity-90"
                    style={{ backgroundColor: '#FF8C00' }}
                    onClick={() => {
                      setSelectedContest(contest.title);
                      setIsModalOpen(true);
                    }}
                  >
                    Участвовать
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mb-16">
        <h3 className="text-4xl font-heading font-bold text-center mb-8 text-secondary">⭐ Популярные конкурсы</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {contests.filter(c => c.isPopular).map((contest) => (
            <Card
              key={contest.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl cursor-pointer"
              onClick={() => {
                setSelectedContest(contest.title);
                setIsModalOpen(true);
              }}
            >
              <div className="h-56 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/30 to-accent/20 flex items-center justify-center">
                <Icon name={getCategoryIcon(contest.categoryId)} className="text-primary" size={80} />
              </div>
              <CardContent className="p-6">
                <h4 className="text-lg font-heading font-bold mb-2">{contest.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{contest.description}</p>
                {contest.rulesLink && (
                  <button
                    className="text-sm text-primary underline hover:opacity-75 mb-2 block text-left"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPdfUrl(contest.rulesLink);
                      setIsPdfModalOpen(true);
                    }}
                  >
                    📄 Положение конкурса
                  </button>
                )}
                <p className="text-sm font-semibold text-success">💰 {contest.price} ₽</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-20">
        <h3 className="text-4xl font-heading font-bold text-center mb-8 text-secondary">🎨 Галерея лучших работ</h3>
        <div className="relative">
          <div className="grid md:grid-cols-4 gap-6 min-h-[560px] content-start">
            {featuredWorks.slice(featuredPage * FEATURED_PER_PAGE, (featuredPage + 1) * FEATURED_PER_PAGE).map((work) => (
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
          {featuredWorks.length > FEATURED_PER_PAGE && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12 shadow-md"
                disabled={featuredPage === 0}
                onClick={() => setFeaturedPage(p => p - 1)}
              >
                <Icon name="ChevronLeft" size={22} />
              </Button>
              <span className="text-sm text-muted-foreground">
                {featuredPage + 1} / {Math.ceil(featuredWorks.length / FEATURED_PER_PAGE)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12 shadow-md"
                disabled={(featuredPage + 1) * FEATURED_PER_PAGE >= featuredWorks.length}
                onClick={() => setFeaturedPage(p => p + 1)}
              >
                <Icon name="ChevronRight" size={22} />
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="mb-16">
        <h3 className="text-4xl font-heading font-bold text-center mb-12 text-primary">🌟 Почему выбирают нас?</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Icon name="Trophy" className="text-white" size={32} />
            </div>
            <h4 className="text-xl font-heading font-bold text-center mb-3 text-accent">Огромное количество ярких конкурсов</h4>
            <p className="text-center text-muted-foreground">
              Студия предлагает более 50 разнообразных конкурсов по изобразительному искусству, декоративно‑прикладному творчеству и специализированным тематическим направлениям. Каждый участник сможет подобрать мероприятие в соответствии со своими интересами и творческим потенциалом.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Icon name="Zap" className="text-white" size={32} />
            </div>
            <h4 className="text-xl font-heading font-bold text-center mb-3 text-secondary">Гарантированные сроки предоставления результатов</h4>
            <p className="text-center text-muted-foreground">
              Итоги конкурсов публикуются в срок от 1 до 3 рабочих дней после подачи и регистрации заявки на участие.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Icon name="Award" className="text-white" size={32} />
            </div>
            <h4 className="text-xl font-heading font-bold text-center mb-3 text-primary">Про дипломы</h4>
            <p className="text-center text-muted-foreground">
              Каждый участник конкурса получает электронный диплом установленного образца. Документ может быть использован для пополнения портфолио и соответствует требованиям, предъявляемым к материалам для школьных конкурсов и мероприятий.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-info rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Icon name="Wallet" className="text-white" size={32} />
            </div>
            <h4 className="text-xl font-heading font-bold text-center mb-3 text-success">Стоимость</h4>
            <p className="text-center text-muted-foreground">
              Стоимость участия составляет 200 рублей. Цена фиксирована, дополнительные или скрытые платежи отсутствуют.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-info to-primary rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Icon name="Users" className="text-white" size={32} />
            </div>
            <h4 className="text-xl font-heading font-bold text-center mb-3 text-info">Без возрастных ограничений</h4>
            <p className="text-center text-muted-foreground">
              К участию приглашаются: учащиеся и педагоги художественных школ и студий; художники‑любители и профессионалы; все желающие представить свои творческие работы широкой аудитории.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-success rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <Icon name="Smartphone" className="text-white" size={32} />
            </div>
            <h4 className="text-xl font-heading font-bold text-center mb-3 text-primary">Удобная подача работ</h4>
            <p className="text-center text-muted-foreground">Заполните форму → загрузите фото → оплатите оргвзнос → участвуйте! Всё просто и быстро.</p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default IndexHome;
