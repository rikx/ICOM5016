-- Table: products

-- DROP TABLE products;

CREATE TABLE products
(
  product_id bigint NOT NULL DEFAULT nextval('products_pid_seq'::regclass),
  name character varying(60) NOT NULL,
  instant_price numeric(11,2),
  model character varying(20),
  brand character varying(15),
  description text,
  image_filename text,
  cid integer NOT NULL,
  dimensions character(3)[],
  seller_id bigint,
  quantity integer,
  CONSTRAINT "product id" PRIMARY KEY (product_id),
  CONSTRAINT "foreign key cid" FOREIGN KEY (cid)
      REFERENCES categories (cid) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "foreign key seller_id" FOREIGN KEY (seller_id)
      REFERENCES accounts (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE products
  OWNER TO rjnadmin;
