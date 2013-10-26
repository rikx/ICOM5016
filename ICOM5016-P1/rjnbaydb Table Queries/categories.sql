-- Table: categories

-- DROP TABLE categories;

CREATE TABLE categories
(
  cid bigserial NOT NULL,
  cname character(20),
  cparent bigint,
  CONSTRAINT "category id" PRIMARY KEY (cid)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE categories
  OWNER TO rjnadmin;
