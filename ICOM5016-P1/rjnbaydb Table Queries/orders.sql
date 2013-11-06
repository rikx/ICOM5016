-- Table: orders

-- DROP TABLE orders;

CREATE TABLE orders
(
  order_id bigserial NOT NULL,
  buyer_id bigint NOT NULL,
  purchase_date date,
  payment_option bigint,
  CONSTRAINT "primary key order_id" PRIMARY KEY (order_id),
  CONSTRAINT "foreign key buyer_id" FOREIGN KEY (buyer_id)
      REFERENCES accounts (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "foreign key payment_option" FOREIGN KEY (payment_option)
      REFERENCES payment_options (payment_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE orders
  OWNER TO postgres;
