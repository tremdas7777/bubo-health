-- Add free shipping to coupons + store coupon usage on orders

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS coupon_discount_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_free_shipping BOOLEAN NOT NULL DEFAULT false;

