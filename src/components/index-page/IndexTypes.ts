export interface Contest {
  id: number;
  title: string;
  description: string;
  categoryId: string;
  deadline: string;
  price: number;
  status: string;
  rulesLink: string;
  diplomaImage: string;
  image: string;
  participants: number;
  isPopular?: boolean;
}

export interface PublicResult {
  id: number;
  full_name: string;
  age: number | null;
  teacher: string | null;
  institution: string | null;
  work_title: string;
  contest_name: string;
  contest_id: number | null;
  result: 'grand_prix' | 'first_degree' | 'second_degree' | 'third_degree' | 'participant';
  work_file_url: string;
  diploma_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryWork {
  id: number;
  full_name: string;
  age: number | null;
  work_title: string;
  contest_name: string;
  work_file_url: string;
  result: 'grand_prix' | 'first_degree' | 'second_degree' | 'third_degree' | 'participant';
  created_at: string;
}

export interface Review {
  id: number;
  author_name: string;
  author_role: string | null;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  published_at: string | null;
}

export const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
export const SUBMIT_APPLICATION_URL = "https://functions.poehali.dev/2d352955-9c6c-4bbb-ad1e-944c7ea04d84";
export const GALLERY_API_URL = "https://functions.poehali.dev/eddc53e6-7462-4e4b-95fe-3b3ce3e6f95a";
export const REVIEWS_API_URL = "https://functions.poehali.dev/3daafc39-174c-4669-8e8a-71172a246929";
export const PAYMENT_API_URL = "https://functions.poehali.dev/f40bd7c6-a503-4165-8673-e8091832d07c";
export const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
export const UPLOAD_PRESIGNED_URL = "https://functions.poehali.dev/be7b31ca-63ff-4082-9667-d4ab8c4c7f94";

export const contestCategories = [
  { id: "visual-arts", label: "Конкурсы изобразительного искусства", icon: "Palette", heading: "Конкурсы изобразительного искусства" },
  { id: "decorative-arts", label: "Конкурсы декоративно-прикладного искусства", icon: "Scissors", heading: "Конкурсы декоративно-прикладного искусства" },
  { id: "nature", label: "Конкурсы, посвященные теме природы", icon: "TreePine", heading: "Конкурсы о природе" },
  { id: "animals", label: "Конкурсы, посвященные теме животных", icon: "PawPrint", heading: "Конкурсы о животных" },
  { id: "plants", label: "Конкурсы, посвященные теме растений", icon: "Flower2", heading: "Конкурсы о растениях" },
  { id: "holidays", label: "Конкурсы, посвященные теме праздников", icon: "PartyPopper", heading: "Праздничные конкурсы" },
  { id: "thematic", label: "Тематические конкурсы ИЗО и ДПИ", icon: "Sparkles", heading: "Тематические конкурсы" },
  { id: "literary", label: "Конкурсы, посвященные литературным сюжетам и образам", icon: "BookOpen", heading: "Конкурсы по литературным сюжетам и образам" },
  { id: "preschool", label: "Конкурсы для детей дошкольного возраста", icon: "Baby", heading: "Конкурсы для дошкольников" },
  { id: "artists-masters", label: "Конкурсы ИЗО и ДПИ, посвященные творчеству выдающихся художников", icon: "Brush", heading: "Конкурсы, посвященные творчеству выдающихся художников" },
];

export const getCategoryIcon = (categoryId: string) => {
  const category = contestCategories.find(cat => cat.id === categoryId);
  return category?.icon || "Trophy";
};
