create or replace function public.place_order(
  p_items jsonb,
  p_customer jsonb,
  p_coupon text default null,
  p_payment_method text default 'mock_card'
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_number text;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_shipping numeric := 0;
  v_total numeric := 0;
  v_item jsonb;
  v_product public.products;
  v_qty int;
  v_coupon public.coupons;
begin
  if v_user is null then raise exception 'Not authenticated'; end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;
  if p_payment_method not in ('mock_card','cash_on_delivery','bank_transfer') then
    raise exception 'Unsupported payment method';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    if not found then raise exception 'Product not found'; end if;
    v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
    if v_product.stock < v_qty then raise exception 'Insufficient stock for %', v_product.name; end if;
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;

  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    select * into v_coupon from public.coupons
      where upper(code) = upper(trim(p_coupon)) and is_active
        and (starts_at is null or starts_at <= now())
        and (ends_at is null or ends_at >= now());
    if found and v_subtotal >= v_coupon.min_order_amount then
      if v_coupon.discount_type = 'percent' then
        v_discount := round(v_subtotal * v_coupon.discount_value / 100, 2);
      else
        v_discount := least(v_coupon.discount_value, v_subtotal);
      end if;
    end if;
  end if;

  v_shipping := case when (v_subtotal - v_discount) >= 1000 then 0 else 45 end;
  v_total := v_subtotal - v_discount + v_shipping;
  v_number := 'AUR-' || to_char(now(), 'YYMMDD') || '-' || lpad((floor(random() * 100000))::int::text, 5, '0');

  insert into public.orders (
    order_number, user_id, status, subtotal, discount, shipping, total, coupon_code,
    customer_name, customer_email, customer_phone, address, city, postal_code, country,
    payment_method, payment_status, payment_reference, notes
  ) values (
    v_number, v_user, 'pending', v_subtotal, v_discount, v_shipping, v_total,
    nullif(trim(coalesce(p_coupon, '')), ''),
    coalesce(p_customer->>'name', 'Guest'), coalesce(p_customer->>'email', ''), p_customer->>'phone',
    p_customer->>'address', p_customer->>'city', p_customer->>'postal_code', p_customer->>'country',
    p_payment_method, case when p_payment_method = 'cash_on_delivery' then 'pending' else 'paid' end,
    'MOCK-' || replace(gen_random_uuid()::text, '-', ''), p_customer->>'notes'
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products where id = (v_item->>'product_id')::uuid;
    v_qty := greatest(1, coalesce((v_item->>'quantity')::int, 1));
    insert into public.order_items (order_id, product_id, product_name, product_image, unit_price, quantity, variant)
    values (v_order_id, v_product.id, v_product.name, coalesce(v_product.images[1], ''), v_product.price, v_qty, v_item->>'variant');
    update public.products set stock = stock - v_qty where id = v_product.id;
    insert into public.inventory_logs (product_id, change, resulting_stock, reason, created_by)
    values (v_product.id, -v_qty, v_product.stock - v_qty, 'Order ' || v_number, v_user);
  end loop;

  insert into public.payment_transactions (order_id, provider, reference, amount, status)
  values (v_order_id, 'mock', 'MOCK-' || v_order_id, v_total, 'succeeded');

  return jsonb_build_object('id', v_order_id, 'order_number', v_number, 'total', v_total);
end; $$;

grant execute on function public.place_order(jsonb, jsonb, text, text) to authenticated;

create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
  on conflict do nothing;
  return true;
end; $$;

grant execute on function public.claim_first_admin() to authenticated;

create or replace function public.admin_sales_summary()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  return jsonb_build_object(
    'revenue', coalesce((select sum(total) from public.orders where status <> 'cancelled'), 0),
    'orders', (select count(*) from public.orders),
    'customers', (select count(*) from public.profiles),
    'products', (select count(*) from public.products),
    'low_stock', (select count(*) from public.products where stock > 0 and stock <= 5),
    'out_of_stock', (select count(*) from public.products where stock = 0),
    'daily', (select coalesce(jsonb_agg(d), '[]'::jsonb) from (
        select to_char(created_at::date, 'Mon DD') as day, sum(total) as revenue, count(*) as orders
        from public.orders where created_at > now() - interval '14 days'
        group by created_at::date order by created_at::date
      ) d),
    'top_products', (select coalesce(jsonb_agg(t), '[]'::jsonb) from (
        select product_name as name, sum(quantity) as units, sum(quantity * unit_price) as revenue
        from public.order_items group by product_name order by sum(quantity) desc limit 5
      ) t)
  );
end; $$;

grant execute on function public.admin_sales_summary() to authenticated;
