-- Table: placed_bids

-- DROP TABLE placed_bids;

CREATE TABLE placed_bids
(
  bidder_id bigint NOT NULL,
  auction_id bigint NOT NULL,
  bid_amount numeric(11,2),
  date_placed date,
  CONSTRAINT "primary key placed_bid" PRIMARY KEY (bidder_id, auction_id),
  CONSTRAINT bidder_id FOREIGN KEY (bidder_id)
      REFERENCES accounts (account_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE placed_bids
  OWNER TO rjnadmin;
