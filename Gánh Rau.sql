CREATE TABLE "Users" (
  "id" uuid PRIMARY KEY,
  "email" varchar UNIQUE,
  "full_name" varchar,
  "phone" varchar UNIQUE,
  "address" text,
  "role" varchar DEFAULT 'customer',
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "Categories" (
  "id" serial PRIMARY KEY,
  "name" varchar,
  "image_url" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "Products" (
  "id" serial PRIMARY KEY,
  "category_id" integer,
  "name" varchar,
  "description" text,
  "price" decimal,
  "stock" integer,
  "image_url" text,
  "unit" varchar,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "Coupons" (
  "id" serial PRIMARY KEY,
  "code" varchar UNIQUE,
  "discount_type" varchar,
  "discount_value" decimal,
  "min_order_value" decimal,
  "max_discount_amount" decimal,
  "usage_limit" integer,
  "valid_until" timestamp,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "Orders" (
  "id" serial PRIMARY KEY,
  "user_id" uuid,
  "coupon_id" integer,
  "total_amount" decimal,
  "final_amount" decimal,
  "status" varchar DEFAULT 'pending',
  "shipping_address" text,
  "receiver_phone" varchar,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

CREATE TABLE "Order_Items" (
  "id" serial PRIMARY KEY,
  "order_id" integer,
  "product_id" integer,
  "quantity" integer,
  "price_at_purchase" decimal,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

CREATE TABLE "Payments" (
  "id" serial PRIMARY KEY,
  "order_id" integer,
  "payment_method" varchar,
  "payment_status" varchar DEFAULT 'unpaid',
  "transaction_id" varchar,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  "paid_at" timestamp
);

CREATE TABLE "Reviews" (
  "id" serial PRIMARY KEY,
  "user_id" uuid,
  "product_id" integer,
  "rating" integer,
  "comment" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "Chat_History" (
  "id" serial PRIMARY KEY,
  "user_id" uuid,
  "role" varchar,
  "message" text,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE "Cart_Items" (
  "id" serial PRIMARY KEY,
  "user_id" uuid,
  "product_id" integer,
  "quantity" integer,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

ALTER TABLE "Products" ADD FOREIGN KEY ("category_id") REFERENCES "Categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Orders" ADD FOREIGN KEY ("user_id") REFERENCES "Users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Orders" ADD FOREIGN KEY ("coupon_id") REFERENCES "Coupons" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Order_Items" ADD FOREIGN KEY ("order_id") REFERENCES "Orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Order_Items" ADD FOREIGN KEY ("product_id") REFERENCES "Products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Payments" ADD FOREIGN KEY ("order_id") REFERENCES "Orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Reviews" ADD FOREIGN KEY ("user_id") REFERENCES "Users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Reviews" ADD FOREIGN KEY ("product_id") REFERENCES "Products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Chat_History" ADD FOREIGN KEY ("user_id") REFERENCES "Users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Cart_Items" ADD FOREIGN KEY ("user_id") REFERENCES "Users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Cart_Items" ADD FOREIGN KEY ("product_id") REFERENCES "Products" ("id") DEFERRABLE INITIALLY IMMEDIATE;
