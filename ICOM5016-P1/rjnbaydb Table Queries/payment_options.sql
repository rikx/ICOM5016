-- Table: payment_options

-- DROP TABLE payment_options;

CREATE TABLE payment_options
(
  payment_id bigserial NOT NULL,
  card_number character varying(19),
  billing_address bigserial NOT NULL,
  CONSTRAINT "primary key payment_id" PRIMARY KEY (payment_id),
  CONSTRAINT "foreign key billing_address" FOREIGN KEY (billing_address)
      REFERENCES addresses (address_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE payment_options
  OWNER TO rjnadmin;
