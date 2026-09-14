export const STUDY_YEAR_NONE = "—";

export const STUDY_YEAR_OPTIONS = [
  STUDY_YEAR_NONE,
  ...Array.from({ length: 9 }, (_, i) => `${i + 1} г.о.`),
];