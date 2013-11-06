-- Table: auctions

-- DROP TABLE auctions;

CREATE TABLE auctions
(
  auction_id bigserial NOT NULL,
  seller_id bigint NOT NULL,
  product_id bigint NOT NULL,
  current_bid numeric(11,2),
  start_date date,
  start_time time without time zone,
  duration time without time zone,
  CONSTRAINT "primary key auction_id" PRIMARY KEY (auction_id),
  CONSTRAINT "foreign key product_id" FOREIGN KEY (product_id)
      REFERENCES products (product_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "foreign key seller_id" FOREIGN KEY (seller_id)
      REFERENCES accounts (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE auctions
  OWNER TO rjnadmin;
