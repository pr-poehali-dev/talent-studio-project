import { useRef, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

interface JuryMember {
  name: string;
  title: string;
  description: string;
  photo: string | null;
  isOrganizer?: boolean;
  tags?: string[];
}

const juryMembers: JuryMember[] = [
  {
    name: "Мозжерина Анна Владимировна",
    title: "Руководитель студии «Мечтай, твори, дерзай!»",
    description:
      "Дизайнер-график, дизайнер бисерных украшений. С отличием окончила филиал ФГБОУ ВО «РГХПУ им. С.Г. Строганова», г. Кунгур, (ИМДТ) Институт моды, дизайна и технологий, г. Москва, Россия.",
    photo: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/a3839629-5bba-486c-a541-155c881b708e.jpg",
    isOrganizer: true,
    tags: ["Дизайн-график", "Бисерные украшения"],
  },
  {
    name: "Архипова Валентина Николаевна",
    title: "Художник-эмальер, гальванист",
    description:
      "Руководитель творческой художественной мастерской «Тепло Души» для детей и взрослых. С отличием окончила Профессиональный лицей № 58 (отделение «Роспись по эмали», г. Кунгур), затем — Государственный Педагогический Университет (отделение «Дизайн», г. Пермь). В настоящее время развивает домашний музей гальванопластики и активно участвует в художественных конкурсах, выставках и пленэрах, Россия.",
    photo: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/cbb8e074-7b32-475e-9a12-5744ea404870.jpg",
    tags: ["Эмаль", "Гальванопластика", "Пленэры"],
  },
  {
    name: "Юлия Суханова (Карагулова)",
    title: "Инженер-проектировщик, фотограф",
    description:
      "С отличием окончила ПНИПУ, строительный факультет (бакалавриат — ГСХ, магистратура — архитектурное проектирование). Призёр и победитель муниципальных и всероссийских конкурсов по фотографии. В 2024 году вошла в топ 26% международной премии по фотографии 35AWARDS в номинации «Отцы и дети», Россия.",
    photo: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/4a1a7439-4311-4102-b4aa-156adc936821.jpg",
    tags: ["Фотография", "Архитектура", "35AWARDS"],
  },
  {
    name: "Суханова Людмила Васильевна",
    title: "Педагог, руководитель кружков",
    description:
      "Преподаватель технологии для девочек в школе. Руководитель кружка народных промыслов «Золушка». Инструктор детско-юношеского спортивного туризма. В настоящее время — руководитель кружка «Мастерская вдохновения», Россия.",
    photo: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/04e9c7c2-fe5c-415a-8558-423789b96295.jpg",
    tags: ["Народные промыслы", "Педагог", "Туризм"],
  },
  {
    name: "Епифанова Светлана Викторовна",
    title: "Преподаватель ИЗО и технологии",
    description:
      "Преподаватель изобразительного искусства и технологии МАОУ «Филипповская основная общеобразовательная школа», Россия. Руководитель студии талантов «Мечтай, твори, дерзай!»",
    photo: "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/bucket/c6f2113a-5081-46f6-9baa-1b8633e3c4f9.jpg",
    tags: ["ИЗО", "Технология", "Педагог"],
  },
];

const JuryCard = ({ member, index }: { member: JuryMember; index: number }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const [imgHeight, setImgHeight] = useState<number | null>(null);

  useEffect(() => {
    const check = () => {
      if (!imgRef.current || !textRef.current) return;
      const h = imgRef.current.offsetHeight;
      setImgHeight(h);
      const textEl = textRef.current;
      setNeedsExpand(textEl.scrollHeight > textEl.offsetHeight);
    };
    const img = imgRef.current;
    if (img?.complete) {
      check();
    } else {
      img?.addEventListener("load", check);
    }
    window.addEventListener("resize", check);
    return () => {
      img?.removeEventListener("load", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-50 group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex gap-0">
        {/* Photo */}
        <div className="w-36 flex-shrink-0 overflow-hidden">
          {member.photo ? (
            <img
              ref={imgRef}
              src={member.photo}
              alt={member.name}
              className="w-full h-auto block group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full min-h-[200px] bg-gradient-to-br from-orange-100 to-amber-100 flex flex-col items-center justify-center">
              <Icon name="User" size={40} className="text-orange-300 mb-2" />
              <span className="text-orange-300 text-xs text-center px-2">Фото скоро</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div
          className="flex-1 p-5 flex flex-col transition-all duration-300"
          style={!expanded && imgHeight ? { maxHeight: imgHeight, overflow: "hidden" } : {}}
        >
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-bold text-gray-800 text-base leading-snug">
                {member.name}
              </h3>
              <p className="text-orange-500 text-sm font-medium mt-0.5">{member.title}</p>
            </div>
            <div className="ml-2 flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
              <Icon name="Award" size={14} className="text-orange-500" />
            </div>
          </div>
          <p
            ref={textRef}
            className="text-gray-500 text-sm leading-relaxed mt-2"
            style={!expanded && imgHeight ? { overflow: "hidden" } : {}}
          >
            {member.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {member.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-orange-50 text-orange-500 text-xs px-2 py-0.5 rounded-full border border-orange-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expand button */}
      {needsExpand && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-center text-orange-500 text-xs font-medium py-2 border-t border-orange-50 hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
        >
          Подробнее
          <Icon name="ChevronDown" size={12} className="text-orange-400" />
        </button>
      )}
      {needsExpand && expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="w-full text-center text-orange-400 text-xs font-medium py-2 border-t border-orange-50 hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
        >
          Свернуть
          <Icon name="ChevronUp" size={12} className="text-orange-400" />
        </button>
      )}
    </div>
  );
};

const IndexJurySection = () => {
  const organizer = juryMembers.find((m) => m.isOrganizer);
  const members = juryMembers.filter((m) => !m.isOrganizer);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 py-16 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-0 right-16 w-48 h-48 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Icon name="Star" size={16} className="text-white" />
            <span className="text-white text-sm font-medium">Состав жюри</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-sm">
            Жюри конкурсов
          </h1>
          <p className="text-orange-100 text-lg max-w-xl mx-auto">
            Профессионалы в области искусства, педагогики и дизайна, которые оценивают работы участников
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14">

        {/* Organizer — featured card */}
        {organizer && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-1 rounded-full bg-orange-400" />
              <span className="text-orange-500 font-semibold uppercase tracking-widest text-sm">
                Руководитель студии
              </span>
              <div className="flex-1 h-px bg-orange-100" />
            </div>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
              <div className="flex flex-col md:flex-row">
                {/* Photo */}
                <div className="md:w-64 flex-shrink-0 relative">
                  <div className="aspect-[3/4] md:aspect-auto md:h-full min-h-[280px] relative overflow-hidden">
                    <img
                      src={organizer.photo!}
                      alt={organizer.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/30 to-transparent md:bg-gradient-to-r" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Icon name="Crown" size={12} />
                      Организатор
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{organizer.name}</h2>
                  <p className="text-orange-500 font-semibold mb-4">{organizer.title}</p>
                  <p className="text-gray-600 leading-relaxed mb-6">{organizer.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {organizer.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members grid */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-1 rounded-full bg-orange-400" />
            <span className="text-orange-500 font-semibold uppercase tracking-widest text-sm">
              Члены жюри
            </span>
            <div className="flex-1 h-px bg-orange-100" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {members.map((member, index) => (
              <JuryCard key={member.name} member={member} index={index} />
            ))}
          </div>
        </div>

        {/* Bottom accent */}
        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-6 py-4">
            <Icon name="Heart" size={20} className="text-orange-400" />
            <p className="text-gray-600 text-sm">
              Наши эксперты с любовью оценивают каждую работу участников
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexJurySection;