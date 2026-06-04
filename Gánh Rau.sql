CREATE TABLE "users" (
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

CREATE TABLE "categories" (
  "id" serial PRIMARY KEY,
  "name" varchar,
  "image_url" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "products" (
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

CREATE TABLE "coupons" (
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

CREATE TABLE "orders" (
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

CREATE TABLE "order_items" (
  "id" serial PRIMARY KEY,
  "order_id" integer,
  "product_id" integer,
  "quantity" integer,
  "price_at_purchase" decimal,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

CREATE TABLE "payments" (
  "id" serial PRIMARY KEY,
  "order_id" integer,
  "payment_method" varchar,
  "payment_status" varchar DEFAULT 'unpaid',
  "transaction_id" varchar,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  "paid_at" timestamp
);

CREATE TABLE "reviews" (
  "id" serial PRIMARY KEY,
  "user_id" uuid,
  "product_id" integer,
  "rating" integer,
  "comment" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp,
  "deleted_at" timestamp
);

CREATE TABLE "chat_history" (
  "id" serial PRIMARY KEY,
  "user_id" uuid,
  "role" varchar,
  "message" text,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE "cart_items" (
  "id" serial PRIMARY KEY,
  "user_id" uuid,
  "product_id" integer,
  "quantity" integer,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp
);

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("coupon_id") REFERENCES "coupons" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_Items" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_Items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "payments" ADD FOREIGN KEY ("order_id") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "reviews" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "chat_History" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_Items" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "cart_Items" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id") DEFERRABLE INITIALLY IMMEDIATE;
