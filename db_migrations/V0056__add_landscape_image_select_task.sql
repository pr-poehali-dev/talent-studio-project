INSERT INTO olympiad_tasks (olympiad_type, task_type, title, question, description, options, correct_answer, study_years, sort_order, is_active)
VALUES (
  'palette',
  'image-select',
  'Выбери изображения, на которых изображён пейзаж',
  'Выбери изображения, на которых изображён пейзаж',
  'Можно выбрать несколько вариантов',
  '[
    "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/5336ff90-93b3-4f24-9daa-a28bf4ba79fc.jpg||Картина 1||1",
    "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/93f11484-1ff6-46d6-99cb-472a23a01083.jpg||Картина 2||1",
    "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/afa94915-eae6-4ab7-8079-5ac7bdb3e4ab.jpg||Картина 3||1",
    "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/25741ff6-7604-4d6a-a4b3-2a0422a41838.jpg||Картина 4||0",
    "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/993dc1c6-41ad-451d-8830-d0c3ea8ac23b.jpg||Картина 5||0",
    "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/1d0a5a41-af32-425f-9b3f-dc71e4d50540.jpg||Картина 6||0",
    "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/edf97bd9-2eb8-4c2b-9191-9b1ce21d2313.jpg||Картина 7||0",
    "https://cdn.poehali.dev/projects/117fa0d8-5c6b-45ca-a517-e66143c3f4b1/files/a82d91e3-19af-4e8a-8bfb-7ad6d1c14189.jpg||Картина 8||0"
  ]'::jsonb,
  '__image_select__',
  ARRAY['1-2'],
  105,
  true
);