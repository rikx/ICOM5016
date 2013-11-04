-- Table: payment_options

-- DROP TABLE payment_options;

CREATE TABLE payment_options
(
  payment_id bigserial NOT NULL,
  CONSTRAINT "primary key payment_id" PRIMARY KEY (payment_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE payment_options
  OWNER TO rjnadmin;
