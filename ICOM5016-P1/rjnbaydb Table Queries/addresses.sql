-- Table: addresses

-- DROP TABLE addresses;

CREATE TABLE addresses
(
  address_id bigserial NOT NULL,
  street_address character varying(40),
  city character varying(15),
  country character varying(30),
  state character(2),
  zipcode character(6),
  CONSTRAINT "primary key address_id" PRIMARY KEY (address_id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE addresses
  OWNER TO rjnadmin;
