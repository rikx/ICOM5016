-- Table: ratings

-- DROP TABLE ratings;

CREATE TABLE ratings
(
  rating_id bigserial NOT NULL,
  order_id bigint NOT NULL,
  rating smallint,
  CONSTRAINT "primary key rating_id" PRIMARY KEY (rating_id),
  CONSTRAINT "foreign key order_id" FOREIGN KEY (order_id)
      REFERENCES orders (order_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE ratings
  OWNER TO rjnadmin;

-- Index: "fki_foreign key order_id"

-- DROP INDEX "fki_foreign key order_id";

CREATE INDEX "fki_foreign key order_id"
  ON ratings
  USING btree
  (order_id);

