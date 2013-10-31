-- Table: accounts

-- DROP TABLE accounts;

CREATE TABLE accounts
(
  aid bigserial NOT NULL,
  afirst_name character varying(20) NOT NULL,
  amiddle_initial character(1),
  alast_name character varying(20) NOT NULL,
  aphoto_filename text,
  aemail character varying(30),
  arating numeric(1,1),
  apermission boolean NOT NULL,
  acreation_date date,
  CONSTRAINT "primary key aid" PRIMARY KEY (aid)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE accounts
  OWNER TO rjnadmin;
