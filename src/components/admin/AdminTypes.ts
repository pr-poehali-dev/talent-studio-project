export interface Contest {
  id?: number;
  title: string;
  description: string;
  categoryId: string;
  deadline: string;
  price: number;
  status: string;
  rulesLink: string;
  diplomaImage: string;
  image: string;
  isPopular?: boolean;
}

export interface Application {
  id: number;
  full_name: string;
  age: number;
  teacher: string | null;
  institution: string | null;
  work_title: string;
  email: string;
  contest_id: number | null;
  contest_name: string;
  work_file_url: string;
  extra_files: string[];
  status: 'new' | 'viewed' | 'sent';
  result: 'grand_prix' | 'first_degree' | 'second_degree' | 'third_degree' | 'laureate_1' | 'laureate_2' | 'laureate_3' | 'participant' | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  is_featured: boolean;
  is_collective: boolean;
  is_preferential: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Result {
  id: number;
  application_id: number | null;
  full_name: string;
  age: number | null;
  teacher: string | null;
  institution: string | null;
  work_title: string | null;
  email: string | null;
  contest_id: number | null;
  contest_name: string | null;
  work_file_url: string | null;
  result: string | null;
  place: number | null;
  score: number | null;
  diploma_url: string | null;
  notes: string | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  author_name: string;
  author_role: string | null;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export const API_URL = "https://functions.poehali.dev/616d5c66-54ec-4217-a20e-710cd89e2c87";
export const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
export const RESULTS_API_URL = "https://functions.poehali.dev/e1f9698c-ec8a-4b24-89c2-72bb579d7f9b";
export const APPLICATIONS_API_URL = "https://functions.poehali.dev/ff2c7334-750b-418e-8468-152fae1d68ef";
export const SUBMIT_APPLICATION_URL = "https://functions.poehali.dev/2d352955-9c6c-4bbb-ad1e-944c7ea04d84";
export const REVIEWS_API_URL = "https://functions.poehali.dev/3daafc39-174c-4669-8e8a-71172a246929";
export const SETTINGS_API_URL = "https://functions.poehali.dev/d316ce9a-d93a-4032-adc2-28e6d615a17b";
export const CERTIFICATES_LOG_URL = "https://functions.poehali.dev/15416f51-5386-4500-b770-4dea40b824e5";