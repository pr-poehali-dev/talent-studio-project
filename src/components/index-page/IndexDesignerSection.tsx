import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

interface IndexDesignerSectionProps {
  setImagePreview: (url: string) => void;
  setIsImageModalOpen: (v: boolean) => void;
}

const IndexDesignerSection = ({ setImagePreview, setIsImageModalOpen }: IndexDesignerSectionProps) => {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden py-20" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
              <Icon name="PenTool" size={16} className="mr-2" />
              Профессиональный дизайн
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-6 leading-tight">
              Услуги дизайнера
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 leading-relaxed">
              Нужна яркая афиша или официальный диплом для мероприятия?
            </p>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Разработаем дизайн анонсов, афиш, грамот, дипломов и благодарственных писем под ваши задачи. Для музыкальных школ, концертных залов, домов культуры и творческих организаций.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">Что мы создаём</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Предоставляем услуги по созданию дизайн-макетов официальной и рекламной полиграфии для мероприятий любого масштаба
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/7f67c92e-7c9f-4693-9b5c-92d2659ee74a.jpg"); setIsImageModalOpen(true); }}>
                <img src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/7f67c92e-7c9f-4693-9b5c-92d2659ee74a.jpg" alt="Афиши и анонсы" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon name="Megaphone" size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Афиши и анонсы</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Яркие, привлекающие внимание афиши для концертов, фестивалей, отчётных выступлений и творческих вечеров. Анонсы мероприятий для социальных сетей и печати.
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/0759c799-d612-4cdf-9c5f-89383ed43558.jpg"); setIsImageModalOpen(true); }}>
                <img src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/0759c799-d612-4cdf-9c5f-89383ed43558.jpg" alt="Дипломы и грамоты" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Icon name="Award" size={20} className="text-secondary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Дипломы и грамоты</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Официальные дипломы лауреатов, почётные грамоты для победителей конкурсов и участников мероприятий. Индивидуальный дизайн с учётом фирменного стиля вашей организации.
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/1d0a1cce-ff11-4433-a55c-79a222878f38.jpg"); setIsImageModalOpen(true); }}>
                <img src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/1d0a1cce-ff11-4433-a55c-79a222878f38.jpg" alt="Благодарственные письма" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Icon name="Heart" size={20} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Благодарственные письма</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Элегантные благодарственные письма для педагогов, спонсоров, партнёров и организаторов. Торжественное оформление, подчёркивающее значимость вклада каждого.
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/c7540fd7-567e-45e1-b1c5-b48bdda48180.jpg"); setIsImageModalOpen(true); }}>
                <img src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/c7540fd7-567e-45e1-b1c5-b48bdda48180.jpg" alt="Программки" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
                    <Icon name="BookOpen" size={20} className="text-info" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Программки</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Красочные программки для концертов, фестивалей и творческих вечеров. Удобный формат с расписанием выступлений, информацией об участниках и организаторах.
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/e0d9cbb8-8eb7-4b01-a3d2-a7ada3e6c2b8.jpg"); setIsImageModalOpen(true); }}>
                <img src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/e0d9cbb8-8eb7-4b01-a3d2-a7ada3e6c2b8.jpg" alt="Баннеры и растяжки" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <Icon name="Flag" size={20} className="text-success" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Баннеры и растяжки</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Масштабные баннеры и растяжки для оформления сцены, фойе и входных групп. Яркий дизайн, который создаёт праздничную атмосферу любого мероприятия.
                </p>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden rounded-3xl border-2 border-transparent hover:border-primary/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 overflow-hidden cursor-pointer" onClick={() => { setImagePreview("https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/f5a2b3c4-d6e7-4f8a-9b0c-1d2e3f4a5b6c.jpg"); setIsImageModalOpen(true); }}>
                <img src="https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/f5a2b3c4-d6e7-4f8a-9b0c-1d2e3f4a5b6c.jpg" alt="Фирменный стиль" className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon name="Palette" size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold">Фирменный стиль</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Разработка фирменного стиля для школ, студий и творческих организаций. Логотип, фирменные цвета, шрифты — всё для создания узнаваемого образа.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl p-8 mb-16">
            <h2 className="text-3xl font-heading font-bold text-center mb-10">Как мы работаем</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Icon name="MessageSquare" size={32} className="text-primary" />
                </div>
                <h3 className="font-heading font-bold mb-2">Обсуждение</h3>
                <p className="text-sm text-muted-foreground">Рассказываете о задаче и пожеланиях по стилю</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                  <Icon name="PenTool" size={32} className="text-secondary" />
                </div>
                <h3 className="font-heading font-bold mb-2">Разработка</h3>
                <p className="text-sm text-muted-foreground">Создаём макет в течение 1–3 рабочих дней</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Icon name="RefreshCw" size={32} className="text-accent" />
                </div>
                <h3 className="font-heading font-bold mb-2">Правки включены</h3>
                <p className="text-sm text-muted-foreground">Вносим корректировки до полного согласования результата</p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <Icon name="FileCheck" size={32} className="text-success" />
                </div>
                <h3 className="font-heading font-bold mb-2">Готово к печати</h3>
                <p className="text-sm text-muted-foreground">Передаём файлы в форматах для типографии и цифрового использования</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Готовы обсудить ваш проект?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Свяжитесь с нами — расскажите о вашем мероприятии, и мы предложим лучшее решение по дизайну полиграфии
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="mailto:sidio-talantov@yandex.ru">
                <Button size="lg" className="text-lg px-8 py-6 rounded-2xl bg-primary hover:bg-primary/90 shadow-xl">
                  <Icon name="Mail" className="mr-2" size={20} />
                  Написать на почту
                </Button>
              </a>
              <a href="https://vk.com/studio.talantov" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="text-lg px-8 py-6 rounded-2xl bg-[#0077FF] hover:bg-[#0066DD] text-white shadow-xl">
                  <Icon name="MessageCircle" className="mr-2" size={20} />
                  Написать в ВК
                </Button>
              </a>
              <a href="tel:+79082433179">
                <Button size="lg" className="text-lg px-8 py-6 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-xl">
                  <Icon name="Phone" className="mr-2" size={20} />
                  Позвонить
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexDesignerSection;
