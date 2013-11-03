-- Table: has_payment_option

-- DROP TABLE has_payment_option;

CREATE TABLE has_payment_option
(
  account_id bigint NOT NULL,
  payment_id bigint NOT NULL,
  CONSTRAINT "primary key has_payment_option" PRIMARY KEY (account_id, payment_id),
  CONSTRAINT account_id FOREIGN KEY (account_id)
      REFERENCES accounts (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT payment_id FOREIGN KEY (payment_id)
      REFERENCES payment_options (payment_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE has_payment_option
  OWNER TO rjnadmin;
