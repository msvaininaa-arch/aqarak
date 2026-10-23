-- =====================================================================
-- عقارك — قاعدة البيانات (Supabase / PostgreSQL)
-- انسخ هذا الملف كاملًا والصقه في: Supabase > SQL Editor > New query > Run
-- يمكن تشغيله أكثر من مرة دون ضرر.
-- =====================================================================

-- ---------- المدراء ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- العقارات ----------
create table if not exists public.listings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('rent','daily','land','home_sale')),      -- إيجار شهري/سنوي، يومي، أرض للبيع، بيت للبيع
  ptype text not null default 'شقة',                                             -- شقة، دار، غرفة، محل، مكتب، أرض
  country text not null default 'موريتانيا',
  city text not null,
  area text,                                                                     -- الحي
  title text not null check (char_length(title) between 3 and 140),
  description text check (char_length(description) <= 2000),
  price numeric not null check (price >= 0),                                     -- بالأوقية الجديدة MRU
  rooms int check (rooms between 0 and 30),
  size_m2 numeric check (size_m2 >= 0),
  furnished boolean not null default false,
  solar boolean not null default false,                                          -- بلا انقطاع كهرباء
  title_doc text,                                                                -- للأراضي: سند عقاري / ترخيص
  advance_months smallint check (advance_months between 1 and 12),               -- المقدم المطلوب بالأشهر
  features text[] not null default '{}' check (cardinality(features) <= 16),     -- زاوية، على الكودرون، ماء، حوش، قابل للتفاوض…
  lat double precision,
  lng double precision,
  photos text[] not null default '{}' check (cardinality(photos) <= 6),          -- روابط الصور في التخزين (6 كحد أقصى)
  contact_name text,
  contact_whatsapp text not null check (char_length(contact_whatsapp) between 6 and 20),
  featured boolean not null default false,
  views int not null default 0,
  status text not null default 'pending' check (status in ('pending','approved','rejected','rented'))
);
alter table public.listings add column if not exists views int not null default 0;
create index if not exists listings_status_idx on public.listings(status, kind, city);

alter table public.listings enable row level security;

drop policy if exists "public reads approved listings" on public.listings;
create policy "public reads approved listings" on public.listings
  for select using (status = 'approved' or public.is_admin());

drop policy if exists "anyone submits a pending listing" on public.listings;
create policy "anyone submits a pending listing" on public.listings
  for insert with check (status = 'pending' and featured = false and views = 0);

drop policy if exists "admins manage listings" on public.listings;
create policy "admins manage listings" on public.listings
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- طلبات الباحثين ----------
create table if not exists public.requests (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('rent','daily','buy','invest')),
  ptype text not null default 'شقة',
  duration text check (duration in ('شهري','سنوي','يومي')),
  country text not null default 'موريتانيا',
  city text not null,
  area text,
  rooms int check (rooms between 0 and 30),
  budget numeric check (budget >= 0),
  move_in date,
  furnished boolean not null default false,
  solar boolean not null default false,
  advance_max smallint check (advance_max between 1 and 12),                     -- أقصى مقدم يستطيع دفعه
  residence text not null default 'موريتانيا',                                   -- أين يقيم صاحب الطلب الآن
  notes text check (char_length(notes) <= 1000),
  name text,
  whatsapp text not null check (char_length(whatsapp) between 6 and 20),
  owner_token uuid not null default gen_random_uuid(),                          -- مفتاح سري يرى به صاحب الطلب العروض
  status text not null default 'open' check (status in ('open','matched','closed'))
);
alter table public.requests add column if not exists owner_token uuid not null default gen_random_uuid();
create index if not exists requests_status_idx on public.requests(status, city);

alter table public.requests enable row level security;

drop policy if exists "anyone submits a request" on public.requests;
create policy "anyone submits a request" on public.requests
  for insert with check (status = 'open');
-- ملاحظة: owner_token يولّده المتصفح ويحتفظ به صاحب الطلب، ولا يظهر في اللوحة العامة

drop policy if exists "admins manage requests" on public.requests;
create policy "admins manage requests" on public.requests
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- عروض على الطلبات (فكرة «ديل»: أي شخص يرى الطلب ويقدّم عرضًا) ----------
create table if not exists public.offers (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  request_id bigint not null references public.requests(id) on delete cascade,
  price numeric check (price >= 0),
  message text not null check (char_length(message) between 3 and 1000),
  name text check (char_length(name) <= 80),
  whatsapp text not null check (char_length(whatsapp) between 6 and 20),
  listing_id bigint references public.listings(id) on delete set null,
  status text not null default 'new' check (status in ('new','seen','hidden'))
);
create index if not exists offers_request_idx on public.offers(request_id);
alter table public.offers enable row level security;

-- دالة تتحقق أن الطلب مفتوح (تتجاوز حماية جدول الطلبات لأن الزائر لا يقرؤه مباشرة)
create or replace function public.request_is_open(p_id bigint)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.requests where id = p_id and status = 'open');
$$;
grant execute on function public.request_is_open(bigint) to anon, authenticated;

drop policy if exists "anyone offers on an open request" on public.offers;
create policy "anyone offers on an open request" on public.offers
  for insert with check (status = 'new' and public.request_is_open(request_id));

drop policy if exists "admins manage offers" on public.offers;
create policy "admins manage offers" on public.offers
  for all using (public.is_admin()) with check (public.is_admin());

-- ترقية قاعدة موجودة (آمن إعادة تشغيله)
alter table public.listings add column if not exists advance_months smallint check (advance_months between 1 and 12);
alter table public.listings add column if not exists features text[] not null default '{}' check (cardinality(features) <= 16);
alter table public.requests add column if not exists advance_max smallint check (advance_max between 1 and 12);

-- لوحة الطلبات العامة: بلا رقم صاحب الطلب ولا اسمه، مع عدد العروض
drop view if exists public.requests_public;
create view public.requests_public as
  select r.id, r.created_at, r.kind, r.ptype, r.duration, r.country, r.city, r.area, r.rooms, r.budget,
         r.move_in, r.furnished, r.solar, r.advance_max, r.residence, r.notes,
         (select count(*) from public.offers o where o.request_id = r.id and o.status <> 'hidden')::int as offers_count
  from public.requests r where r.status = 'open' and r.created_at > now() - interval '60 days';   -- الطلبات الأقدم من 60 يومًا تختفي تلقائيًا
revoke all on public.requests_public from anon, authenticated, public;
grant select on public.requests_public to anon, authenticated;

-- صاحب الطلب يرى طلبه والعروض التي وصلته بمفتاحه السري فقط
create or replace function public.my_request(p_token uuid)
returns table (id bigint, created_at timestamptz, kind text, ptype text, city text, area text, budget numeric, status text)
language sql stable security definer set search_path = public as $$
  select id, created_at, kind, ptype, city, area, budget, status from public.requests where owner_token = p_token;
$$;
drop function if exists public.my_offers(uuid);
create or replace function public.my_offers(p_token uuid)
returns table (id bigint, created_at timestamptz, price numeric, message text, name text, whatsapp text, listing_id bigint)
language sql stable security definer set search_path = public as $$
  select o.id, o.created_at, o.price, o.message, o.name, o.whatsapp, o.listing_id
  from public.offers o join public.requests r on r.id = o.request_id
  where r.owner_token = p_token and o.status <> 'hidden' order by o.created_at desc;
$$;
grant execute on function public.my_request(uuid) to anon, authenticated;
grant execute on function public.my_offers(uuid) to anon, authenticated;

-- عدّاد المشاهدات
create or replace function public.add_view(p_id bigint)
returns void language sql security definer set search_path = public as $$
  update public.listings set views = views + 1 where id = p_id and status = 'approved';
$$;
grant execute on function public.add_view(bigint) to anon, authenticated;

-- ---------- السماسرة ----------
create table if not exists public.brokers (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  whatsapp text not null check (char_length(whatsapp) between 6 and 20),
  cities text[] not null default '{}',
  areas text,
  verified boolean not null default false,
  rating numeric not null default 0 check (rating between 0 and 5),
  deals int not null default 0
);

alter table public.brokers enable row level security;

drop policy if exists "public reads verified brokers" on public.brokers;
create policy "public reads verified brokers" on public.brokers
  for select using (verified or public.is_admin());

drop policy if exists "anyone registers as broker" on public.brokers;
create policy "anyone registers as broker" on public.brokers
  for insert with check (verified = false and rating = 0 and deals = 0);

drop policy if exists "admins manage brokers" on public.brokers;
create policy "admins manage brokers" on public.brokers
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- تخزين الصور ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos','photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "anyone uploads listing photos" on storage.objects;
create policy "anyone uploads listing photos" on storage.objects
  for insert with check (bucket_id = 'photos' and (storage.foldername(name))[1] = 'listings');

drop policy if exists "admins delete photos" on storage.objects;
create policy "admins delete photos" on storage.objects
  for delete using (bucket_id = 'photos' and public.is_admin());

-- =====================================================================
-- بعد إنشاء حسابك في Supabase > Authentication > Users، اجعل نفسك مديرًا:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'بريدك@example.com';
-- =====================================================================


-- =====================================================================
-- حماية من الإغراق (تعمل في الخادم حتى لو تجاوز أحدٌ الصفحة)
-- =====================================================================
create or replace function public.aq_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare phone text; n int; burst int;
begin
  if public.is_admin() then return new; end if;
  if tg_table_name = 'listings' then
    phone := new.contact_whatsapp;
    select count(*) into n from public.listings where contact_whatsapp = phone and created_at > now() - interval '1 day';
    if n >= 10 then raise exception 'too_many: حد الإعلانات اليومي لهذا الرقم'; end if;
    if exists (select 1 from unnest(new.features) f where char_length(f) > 40) then raise exception 'bad_feature'; end if;
    select count(*) into burst from public.listings where created_at > now() - interval '1 minute';
  elsif tg_table_name = 'requests' then
    phone := new.whatsapp;
    select count(*) into n from public.requests where whatsapp = phone and created_at > now() - interval '1 hour';
    if n >= 5 then raise exception 'too_many: حد الطلبات لهذا الرقم في الساعة'; end if;
    select count(*) into burst from public.requests where created_at > now() - interval '1 minute';
  elsif tg_table_name = 'offers' then
    phone := new.whatsapp;
    select count(*) into n from public.offers where whatsapp = phone and created_at > now() - interval '1 hour';
    if n >= 20 then raise exception 'too_many: حد العروض لهذا الرقم في الساعة'; end if;
    select count(*) into burst from public.offers where created_at > now() - interval '1 minute';
  else
    return new;
  end if;
  if burst >= 60 then raise exception 'too_many: ضغط كبير، حاول بعد دقيقة'; end if;
  return new;
end $$;

drop trigger if exists aq_guard_listings on public.listings;
create trigger aq_guard_listings before insert on public.listings for each row execute function public.aq_guard();
drop trigger if exists aq_guard_requests on public.requests;
create trigger aq_guard_requests before insert on public.requests for each row execute function public.aq_guard();
drop trigger if exists aq_guard_offers on public.offers;
create trigger aq_guard_offers before insert on public.offers for each row execute function public.aq_guard();

-- فهارس تسرّع العدّ والعرض
create index if not exists listings_phone_time on public.listings (contact_whatsapp, created_at);
create index if not exists listings_status_time on public.listings (status, created_at desc);
create index if not exists requests_phone_time on public.requests (whatsapp, created_at);
create index if not exists requests_status_time on public.requests (status, created_at desc);
create index if not exists offers_phone_time on public.offers (whatsapp, created_at);
create index if not exists offers_request on public.offers (request_id);


-- مصدر الزائر (رابط دعوة السمسار ?ref=) لمعرفة من يجلب الزبائن
alter table public.listings add column if not exists ref text check (ref ~ '^[A-Za-z0-9_-]{2,30}$');
alter table public.requests add column if not exists ref text check (ref ~ '^[A-Za-z0-9_-]{2,30}$');
alter table public.offers   add column if not exists ref text check (ref ~ '^[A-Za-z0-9_-]{2,30}$');


-- =====================================================================
-- السمسار الموثّق: الشارة لا تُمنح إلا بعد ثلاث تحققات يجريها المدير
-- =====================================================================
alter table public.brokers add column if not exists id_checked boolean not null default false;     -- بطاقة التعريف
alter table public.brokers add column if not exists phone_checked boolean not null default false;  -- الرقم يعود إليه
alter table public.brokers add column if not exists met boolean not null default false;            -- قابلناه شخصيًا
alter table public.brokers add column if not exists verified_at timestamptz;
alter table public.brokers add column if not exists about text check (char_length(about) <= 200);
alter table public.brokers drop constraint if exists brokers_verify_requires_checks;
alter table public.brokers add constraint brokers_verify_requires_checks check (not verified or (id_checked and phone_checked and met));
-- المسجّل الجديد لا يستطيع أن يضع لنفسه أي تحقق
drop policy if exists "anyone registers as broker" on public.brokers;
create policy "anyone registers as broker" on public.brokers
  for insert with check (verified = false and rating = 0 and deals = 0 and not id_checked and not phone_checked and not met and verified_at is null);
-- ما يراه الزوار من السمسار الموثّق فقط (بلا تفاصيل التحقق الداخلية)
drop view if exists public.brokers_public;
create view public.brokers_public as
  select id, name, whatsapp, cities, areas, about, deals, verified_at from public.brokers where verified;
grant select on public.brokers_public to anon, authenticated;

-- عروض صاحب الطلب مع إشارة «سمسار موثّق»
drop function if exists public.my_offers(uuid);
create or replace function public.my_offers(p_token uuid)
returns table (id bigint, created_at timestamptz, price numeric, message text, name text, whatsapp text, listing_id bigint, verified_broker boolean)
language sql stable security definer set search_path = public as $$
  select o.id, o.created_at, o.price, o.message, o.name, o.whatsapp, o.listing_id,
         exists (select 1 from public.brokers b where b.verified and b.whatsapp = o.whatsapp) as verified_broker
  from public.offers o join public.requests r on r.id = o.request_id
  where r.owner_token = p_token and o.status <> 'hidden' order by o.created_at desc;
$$;
grant execute on function public.my_offers(uuid) to anon, authenticated;


-- =====================================================================
-- ميزات جاهزة ومطفأة (تُشغَّل من FEATURES في config.js)
-- =====================================================================
-- العمولة المعلنة
alter table public.listings add column if not exists commission text check (char_length(commission) <= 40);
alter table public.offers   add column if not exists commission text check (char_length(commission) <= 40);
-- تأكيد التوفر
alter table public.listings add column if not exists confirmed_at timestamptz not null default now();
-- اشتراك السمسار
alter table public.brokers add column if not exists plan text not null default 'free' check (plan in ('free','pro'));
alter table public.brokers add column if not exists plan_until timestamptz;
drop policy if exists "anyone registers as broker" on public.brokers;
create policy "anyone registers as broker" on public.brokers
  for insert with check (verified = false and rating = 0 and deals = 0 and not id_checked and not phone_checked and not met
                         and verified_at is null and plan = 'free' and plan_until is null);

-- تقييم السمسار: صاحب الطلب وحده يقيّم، مرة واحدة لكل عرض
create table if not exists public.offer_ratings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  offer_id bigint not null unique references public.offers(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  comment text check (char_length(comment) <= 200)
);
alter table public.offer_ratings enable row level security;
drop policy if exists "admins manage ratings" on public.offer_ratings;
create policy "admins manage ratings" on public.offer_ratings for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.rate_offer(p_token uuid, p_offer bigint, p_stars int, p_comment text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.offers o join public.requests r on r.id = o.request_id
                 where o.id = p_offer and r.owner_token = p_token and r.status <> 'open') then
    raise exception 'not_your_offer';  -- التقييم بعد أن يعلّم المدير الطلب «وُجد عرض» أو «مغلق»
  end if;
  insert into public.offer_ratings (offer_id, stars, comment) values (p_offer, p_stars, p_comment);
end $$;
grant execute on function public.rate_offer(uuid, bigint, int, text) to anon, authenticated;

-- ما يراه الزوار من السمسار الموثّق، مع متوسط تقييمه واشتراكه
drop view if exists public.brokers_public;
create view public.brokers_public as
  select b.id, b.name, b.whatsapp, b.cities, b.areas, b.about, b.deals, b.verified_at, b.plan, b.plan_until,
         (select round(avg(x.stars)::numeric, 1) from public.offer_ratings x join public.offers o on o.id = x.offer_id where o.whatsapp = b.whatsapp) as rating_avg,
         (select count(*) from public.offer_ratings x join public.offers o on o.id = x.offer_id where o.whatsapp = b.whatsapp)::int as rating_count
  from public.brokers b where b.verified;
revoke all on public.brokers_public from anon, authenticated, public;
grant select on public.brokers_public to anon, authenticated;


-- =====================================================================
-- الإعدادات: يغيّرها المدير من «⚙️ الإعدادات» فتظهر للزوار دون إعادة رفع
-- =====================================================================
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
drop policy if exists "public reads settings" on public.settings;
create policy "public reads settings" on public.settings for select using (true);
drop policy if exists "admins manage settings" on public.settings;
create policy "admins manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
insert into public.settings (key, value) values
  ('features', '{"COMMISSION":false,"RATINGS":false,"FRESHNESS":false,"SUBSCRIPTIONS":false,"PRICE_INDEX":false}'),
  ('services', '["doc"]'),
  ('focus_areas', '["تفرغ زينة","لكصر","تيارت"]'),
  ('plans', '{"pro_price":"","free_offers_per_day":5}')
on conflict (key) do nothing;

-- حدّ العروض اليومي للسمسار غير المشترك (يعمل فقط حين تُفعَّل SUBSCRIPTIONS)
create or replace function public.aq_plan_guard() returns trigger
language plpgsql security definer set search_path = public as $$
declare on_ boolean; lim int; n int;
begin
  if public.is_admin() then return new; end if;
  select coalesce((value->>'SUBSCRIPTIONS')::boolean,false) into on_ from public.settings where key='features';
  if not coalesce(on_,false) then return new; end if;
  if exists (select 1 from public.brokers b where b.whatsapp = new.whatsapp and b.plan='pro' and (b.plan_until is null or b.plan_until > now())) then return new; end if;
  select coalesce((value->>'free_offers_per_day')::int,5) into lim from public.settings where key='plans';
  select count(*) into n from public.offers where whatsapp = new.whatsapp and created_at > now() - interval '1 day';
  if n >= coalesce(lim,5) then raise exception 'plan_limit: حد العروض المجانية اليوم'; end if;
  return new;
end $$;
drop trigger if exists aq_plan_guard_offers on public.offers;
create trigger aq_plan_guard_offers before insert on public.offers for each row execute function public.aq_plan_guard();

-- تاريخ التأكيد يضعه الخادم عند الإضافة، فلا يزوّره أحد
create or replace function public.aq_confirm_now() returns trigger
language plpgsql as $$ begin if not public.is_admin() then new.confirmed_at := now(); end if; return new; end $$;
drop trigger if exists aq_confirm_now on public.listings;
create trigger aq_confirm_now before insert on public.listings for each row execute function public.aq_confirm_now();


-- =====================================================================
-- تقوية الحماية (بعد المراجعة المستقلة)
-- =====================================================================
-- 1) الوقت والعدّادات يضعها الخادم، لا المتصفح (تمنع تجاوز حدود الإغراق وتزوير «الأحدث»)
create or replace function public.aq_server_fields() returns trigger
language plpgsql as $$
begin
  if public.is_admin() then return new; end if;
  new.created_at := now();
  if tg_table_name = 'listings' then new.views := 0; new.confirmed_at := now(); end if;
  return new;
end $$;
drop trigger if exists aa_server_fields on public.listings;
create trigger aa_server_fields before insert on public.listings for each row execute function public.aq_server_fields();
drop trigger if exists aa_server_fields on public.requests;
create trigger aa_server_fields before insert on public.requests for each row execute function public.aq_server_fields();
drop trigger if exists aa_server_fields on public.offers;
create trigger aa_server_fields before insert on public.offers for each row execute function public.aq_server_fields();
drop trigger if exists aa_server_fields on public.brokers;
create trigger aa_server_fields before insert on public.brokers for each row execute function public.aq_server_fields();

-- 2) الزوار لا يقرؤون جدول العقارات مباشرة: يقرؤون عرضًا عامًا بلا أرقام المالكين
--    (رقم التواصل يظهر فقط إن كان لسمسار موثّق، فأرقامهم علنية أصلًا)
drop policy if exists "public reads approved listings" on public.listings;
drop view if exists public.listings_public;
create view public.listings_public as
  select l.id, l.created_at, l.kind, l.ptype, l.country, l.city, l.area, l.title, l.description, l.price, l.rooms, l.size_m2,
         l.furnished, l.solar, l.title_doc, l.advance_months, l.features, l.lat, l.lng, l.photos, l.featured, l.views, l.status,
         l.commission, l.confirmed_at,
         (select b.whatsapp from public.brokers b where b.verified and b.whatsapp = l.contact_whatsapp limit 1) as contact_whatsapp
  from public.listings l where l.status = 'approved';
revoke all on public.listings_public from anon, authenticated, public;
grant select on public.listings_public to anon, authenticated;

-- 3) الزوار لا يقرؤون جدول السماسرة مباشرة (يقرؤون brokers_public فقط)
drop policy if exists "public reads verified brokers" on public.brokers;

-- 4) عروض صاحب الطلب تعيد العمولة أيضًا
drop function if exists public.my_offers(uuid);
create or replace function public.my_offers(p_token uuid)
returns table (id bigint, created_at timestamptz, price numeric, message text, name text, whatsapp text, listing_id bigint, verified_broker boolean, commission text)
language sql stable security definer set search_path = public as $$
  select o.id, o.created_at, o.price, o.message, o.name, o.whatsapp, o.listing_id,
         exists (select 1 from public.brokers b where b.verified and b.whatsapp = o.whatsapp) as verified_broker, o.commission
  from public.offers o join public.requests r on r.id = o.request_id
  where r.owner_token = p_token and o.status <> 'hidden' order by o.created_at desc;
$$;
grant execute on function public.my_offers(uuid) to anon, authenticated;

-- 5) عدّاد المشاهدات للعقارات المنشورة فقط
create or replace function public.add_view(p_id bigint)
returns void language sql security definer set search_path = public as $$
  update public.listings set views = views + 1 where id = p_id and status = 'approved';
$$;
grant execute on function public.add_view(bigint) to anon, authenticated;

-- =====================================================================
-- صلاحيات صريحة (لا نعتمد على إعدادات Supabase الافتراضية؛ الحماية الفعلية في سياسات RLS أعلاه)
-- =====================================================================
grant usage on schema public to anon, authenticated;
grant usage on all sequences in schema public to anon, authenticated;
grant insert on public.listings, public.requests, public.offers, public.brokers to anon, authenticated;
grant select on public.settings to anon, authenticated;
grant select, insert, update, delete on public.listings, public.requests, public.offers, public.brokers,
      public.settings, public.offer_ratings, public.admins to authenticated;   -- المدير فقط تسمح له السياسات
