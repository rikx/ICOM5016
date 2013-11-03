-- Table: has_address

-- DROP TABLE has_address;

CREATE TABLE has_address
(
  account_id bigint NOT NULL,
  address_id bigint NOT NULL,
  CONSTRAINT "primary key" PRIMARY KEY (account_id, address_id),
  CONSTRAINT account_id FOREIGN KEY (account_id)
      REFERENCES accounts (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT address_id FOREIGN KEY (address_id)
      REFERENCES addresses (address_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE has_address
  OWNER TO postgres;
