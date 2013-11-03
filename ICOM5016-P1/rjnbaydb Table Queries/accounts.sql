-- Table: accounts

-- DROP TABLE accounts;

CREATE TABLE accounts
(
  account_id bigint NOT NULL DEFAULT nextval('accounts_aid_seq'::regclass),
  first_name character varying(20) NOT NULL,
  middle_initial character(1),
  last_name character varying(20) NOT NULL,
  photo_filename text,
  email character varying(30),
  rating numeric(1,1),
  permission boolean NOT NULL,
  creation_date date,
  primary_address bigint,
  primary_payment bigint,
  username character varying(12) NOT NULL,
  password character varying(30) NOT NULL,
  CONSTRAINT "primary key aid" PRIMARY KEY (account_id),
  CONSTRAINT address_id FOREIGN KEY (primary_address)
      REFERENCES addresses (address_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT payment_id FOREIGN KEY (primary_payment)
      REFERENCES payment_options (payment_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE accounts
  OWNER TO rjnadmin;
