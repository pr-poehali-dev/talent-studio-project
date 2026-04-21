ALTER TABLE t_p93576920_talent_studio_projec.olympiad_applications
  ALTER COLUMN age TYPE character varying(100) USING age::character varying,
  ALTER COLUMN study_year TYPE character varying(100) USING study_year::character varying;