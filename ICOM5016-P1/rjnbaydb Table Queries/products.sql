-- Table: products

-- DROP TABLE products;

CREATE TABLE products
(
  pid bigserial NOT NULL,
  pname character varying(20) NOT NULL,
  pinstant_price numeric(11,2),
  pmodel character varying(20),
  pbrand character varying(15),
  pdescription text,
  pimage_filename text,
  pdimensions integer[],
  cid integer NOT NULL,
  CONSTRAINT "product id" PRIMARY KEY (pid),
  CONSTRAINT "foreign key cid" FOREIGN KEY (cid)
      REFERENCES categories (cid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE products
  OWNER TO rjnadmin;
