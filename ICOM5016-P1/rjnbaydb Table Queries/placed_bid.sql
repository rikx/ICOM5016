-- Table: placed_bid

-- DROP TABLE placed_bid;

CREATE TABLE placed_bid
(
  bidder_id bigint NOT NULL,
  auction_id bigint NOT NULL,
  bid_amount numeric(11,2),
  CONSTRAINT "primary key placed_bid" PRIMARY KEY (bidder_id, auction_id),
  CONSTRAINT bidder_id FOREIGN KEY (bidder_id)
      REFERENCES accounts (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE placed_bid
  OWNER TO rjnadmin;
