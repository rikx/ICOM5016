-- Table: sales

-- DROP TABLE sales;

CREATE TABLE sales
(
  order_id bigint NOT NULL,
  product_id bigint NOT NULL,
  bought_quantity integer,
  rating_id bigint,
  CONSTRAINT "primary key sales" PRIMARY KEY (order_id, product_id),
  CONSTRAINT "foreign key order_id" FOREIGN KEY (order_id)
      REFERENCES orders (order_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "foreign key product_id" FOREIGN KEY (product_id)
      REFERENCES products (product_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "foreign key rating_id" FOREIGN KEY (rating_id)
      REFERENCES ratings (rating_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
WITH (
  OIDS=FALSE
);
ALTER TABLE sales
  OWNER TO rjnadmin;
