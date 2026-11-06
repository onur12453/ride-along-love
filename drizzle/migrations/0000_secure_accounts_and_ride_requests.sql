create type public.app_role as enum ('yolcu', 'gonullu', 'yonetici', 'belge_denetci');
create type public.ride_status as enum ('olusturuldu', 'gonullu_bulundu', 'onaylandi', 'tamamlandi', 'iptal_edildi');
create type public.document_kind as enum ('kimlik_on', 'kimlik_arka', 'ehliyet', 'ruhsat', 'adli_sicil');
create type public.review_status as enum ('beklemede', 'onaylandi', 'reddedildi');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,40}$'),
  full_name text not null,
  display_name text,
  phone text,
  city text,
  district text,
  accessibility_needs text,
  avatar_path text,
  has_vehicle boolean not null default false,
  volunteer_status public.review_status not null default 'beklemede',
  training_passed boolean not null default false,
  average_rating numeric(3,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;
revoke all on function public.has_role(uuid, public.app_role) from public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated, service_role;

create policy "profiles_own_or_admin_read" on public.profiles for select to authenticated
using (id = auth.uid() or public.has_role(auth.uid(), 'yonetici'));
create policy "roles_own_or_admin_read" on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(), 'yonetici'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data ->> 'role', 'yolcu');
  safe_username text;
begin
  if requested_role not in ('yolcu', 'gonullu') then requested_role := 'yolcu'; end if;
  safe_username := lower(regexp_replace(coalesce(new.raw_user_meta_data ->> 'username', 'kullanici'), '[^a-zA-Z0-9_]', '', 'g'));
  if char_length(safe_username) < 3 then safe_username := 'kullanici'; end if;
  safe_username := left(safe_username, 20) || '_' || left(replace(new.id::text, '-', ''), 8);
  insert into public.profiles(id, username, full_name, display_name)
  values (new.id, safe_username, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'Yeni kullanıcı'), new.raw_user_meta_data ->> 'full_name');
  insert into public.user_roles(user_id, role) values (new.id, requested_role::public.app_role);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.update_own_profile(
  p_display_name text, p_phone text, p_city text, p_district text,
  p_accessibility_needs text, p_has_vehicle boolean, p_avatar_path text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Oturum açmanız gerekiyor.'; end if;
  update public.profiles set
    display_name = nullif(left(trim(p_display_name), 100), ''),
    phone = nullif(left(trim(p_phone), 30), ''),
    city = nullif(left(trim(p_city), 80), ''),
    district = nullif(left(trim(p_district), 80), ''),
    accessibility_needs = nullif(left(trim(p_accessibility_needs), 1000), ''),
    has_vehicle = coalesce(p_has_vehicle, false),
    avatar_path = coalesce(p_avatar_path, avatar_path),
    updated_at = now()
  where id = auth.uid();
end;
$$;
revoke all on function public.update_own_profile(text,text,text,text,text,boolean,text) from public;
grant execute on function public.update_own_profile(text,text,text,text,text,boolean,text) to authenticated;

create table public.volunteer_service_areas (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  city text not null,
  district text not null,
  created_at timestamptz not null default now(),
  unique(volunteer_id, city, district)
);
grant select, insert, delete on public.volunteer_service_areas to authenticated;
grant all on public.volunteer_service_areas to service_role;
alter table public.volunteer_service_areas enable row level security;
create policy "areas_own_or_admin_read" on public.volunteer_service_areas for select to authenticated
using (volunteer_id = auth.uid() or public.has_role(auth.uid(), 'yonetici'));
create policy "areas_own_insert" on public.volunteer_service_areas for insert to authenticated
with check (volunteer_id = auth.uid() and public.has_role(auth.uid(), 'gonullu'));
create policy "areas_own_delete" on public.volunteer_service_areas for delete to authenticated
using (volunteer_id = auth.uid());

create table public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  passenger_id uuid not null references public.profiles(id) on delete restrict,
  volunteer_id uuid references public.profiles(id) on delete restrict,
  from_city text not null,
  from_district text not null,
  to_city text not null,
  to_district text not null,
  ride_date date not null,
  ride_time time not null,
  wheelchair boolean not null default false,
  companion boolean not null default false,
  status public.ride_status not null default 'olusturuldu',
  passenger_ok boolean not null default false,
  volunteer_ok boolean not null default false,
  passenger_completed boolean not null default false,
  volunteer_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.ride_requests to authenticated;
grant all on public.ride_requests to service_role;
alter table public.ride_requests enable row level security;
create policy "rides_participant_or_admin_read" on public.ride_requests for select to authenticated
using (passenger_id = auth.uid() or volunteer_id = auth.uid() or public.has_role(auth.uid(), 'yonetici'));
create index ride_requests_open_idx on public.ride_requests(status, from_city, from_district) where status = 'olusturuldu';
create index ride_requests_passenger_idx on public.ride_requests(passenger_id, created_at desc);
create index ride_requests_volunteer_idx on public.ride_requests(volunteer_id, created_at desc);

create table public.ride_private_details (
  ride_id uuid primary key references public.ride_requests(id) on delete cascade,
  from_address text not null,
  to_address text not null,
  special_needs text,
  note text
);
grant select on public.ride_private_details to authenticated;
grant all on public.ride_private_details to service_role;
alter table public.ride_private_details enable row level security;
create policy "ride_details_consented_participant_or_admin_read" on public.ride_private_details for select to authenticated
using (exists(select 1 from public.ride_requests r where r.id = ride_id and (
  r.passenger_id = auth.uid() or public.has_role(auth.uid(), 'yonetici') or
  (r.volunteer_id = auth.uid() and r.passenger_ok and r.volunteer_ok)
)));

create or replace function public.create_ride_request(
  p_from_city text, p_from_district text, p_from_address text,
  p_to_city text, p_to_district text, p_to_address text,
  p_ride_date date, p_ride_time time, p_wheelchair boolean,
  p_special_needs text, p_companion boolean, p_note text
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if not public.has_role(auth.uid(), 'yolcu') then raise exception 'Bu işlem için yetkiniz yok.'; end if;
  if p_ride_date < current_date then raise exception 'Geçmiş bir tarih seçilemez.'; end if;
  if char_length(trim(p_from_address)) < 3 or char_length(trim(p_to_address)) < 3 then raise exception 'Başlangıç ve varış adreslerini girin.'; end if;
  insert into public.ride_requests(passenger_id, from_city, from_district, to_city, to_district, ride_date, ride_time, wheelchair, companion)
  values(auth.uid(), left(trim(p_from_city),80), left(trim(p_from_district),80), left(trim(p_to_city),80), left(trim(p_to_district),80), p_ride_date, p_ride_time, coalesce(p_wheelchair,false), coalesce(p_companion,false)) returning id into new_id;
  insert into public.ride_private_details(ride_id, from_address, to_address, special_needs, note)
  values(new_id, left(trim(p_from_address),500), left(trim(p_to_address),500), nullif(left(trim(p_special_needs),1000),''), nullif(left(trim(p_note),1000),''));
  return new_id;
end;
$$;
revoke all on function public.create_ride_request(text,text,text,text,text,text,date,time,boolean,text,boolean,text) from public;
grant execute on function public.create_ride_request(text,text,text,text,text,text,date,time,boolean,text,boolean,text) to authenticated;

create or replace function public.list_open_rides()
returns table(id uuid, from_city text, from_district text, to_city text, to_district text, ride_date date, ride_time time, wheelchair boolean, companion boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'gonullu') then raise exception 'Bu işlem için yetkiniz yok.'; end if;
  if not exists(select 1 from public.profiles where id = auth.uid() and volunteer_status = 'onaylandi' and training_passed) then
    raise exception 'Talepleri görmek için başvurunuzun ve eğitiminizin onaylanması gerekir.';
  end if;
  return query
    select r.id, r.from_city, r.from_district, r.to_city, r.to_district, r.ride_date, r.ride_time, r.wheelchair, r.companion, r.created_at
    from public.ride_requests r
    where r.status = 'olusturuldu'
      and exists(select 1 from public.volunteer_service_areas a where a.volunteer_id = auth.uid() and a.city = r.from_city and a.district = r.from_district)
    order by r.ride_date, r.ride_time;
end;
$$;
revoke all on function public.list_open_rides() from public;
grant execute on function public.list_open_rides() to authenticated;

create or replace function public.confirm_ride(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from public.ride_requests where id = p_request_id;
  if r.id is null or (r.passenger_id <> auth.uid() and r.volunteer_id <> auth.uid()) then raise exception 'Talep bulunamadı veya erişim yetkiniz yok.'; end if;
  if r.status not in ('gonullu_bulundu','onaylandi') then raise exception 'Bu talep için onay işlemi yapılamaz.'; end if;
  update public.ride_requests set
    passenger_ok = case when passenger_id = auth.uid() then true else passenger_ok end,
    volunteer_ok = case when volunteer_id = auth.uid() then true else volunteer_ok end,
    status = case when (passenger_id = auth.uid() and volunteer_ok) or (volunteer_id = auth.uid() and passenger_ok) then 'onaylandi'::public.ride_status else status end,
    updated_at = now()
  where id = p_request_id;
end;
$$;
revoke all on function public.confirm_ride(uuid) from public;
grant execute on function public.confirm_ride(uuid) to authenticated;

create or replace function public.complete_ride(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from public.ride_requests where id = p_request_id;
  if r.id is null or (r.passenger_id <> auth.uid() and r.volunteer_id <> auth.uid()) then raise exception 'Talep bulunamadı veya erişim yetkiniz yok.'; end if;
  if r.status <> 'onaylandi' then raise exception 'Yalnızca onaylanmış yolculuklar tamamlanabilir.'; end if;
  update public.ride_requests set
    passenger_completed = case when passenger_id = auth.uid() then true else passenger_completed end,
    volunteer_completed = case when volunteer_id = auth.uid() then true else volunteer_completed end,
    status = case when (passenger_id = auth.uid() and volunteer_completed) or (volunteer_id = auth.uid() and passenger_completed) then 'tamamlandi'::public.ride_status else status end,
    updated_at = now()
  where id = p_request_id;
end;
$$;
revoke all on function public.complete_ride(uuid) from public;
grant execute on function public.complete_ride(uuid) to authenticated;

create or replace function public.cancel_ride(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.ride_requests set status = 'iptal_edildi', updated_at = now()
  where id = p_request_id and status <> 'tamamlandi'
    and (passenger_id = auth.uid() or public.has_role(auth.uid(), 'yonetici'));
  if not found then raise exception 'Talep bulunamadı veya iptal yetkiniz yok.'; end if;
end;
$$;
revoke all on function public.cancel_ride(uuid) from public;
grant execute on function public.cancel_ride(uuid) to authenticated;

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  ride_id uuid references public.ride_requests(id) on delete set null,
  type text not null check (type in ('sikayet','geri_bildirim')),
  subject text not null,
  message text not null,
  status text not null default 'acik' check (status in ('acik','inceleniyor','cozuldu')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert on public.complaints to authenticated;
grant all on public.complaints to service_role;
alter table public.complaints enable row level security;
create policy "complaints_own_or_admin_read" on public.complaints for select to authenticated
using (author_id = auth.uid() or public.has_role(auth.uid(), 'yonetici'));
create policy "complaints_own_insert" on public.complaints for insert to authenticated
with check (author_id = auth.uid());

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "audit_admin_read" on public.audit_logs for select to authenticated
using (public.has_role(auth.uid(), 'yonetici'));

create or replace function public.set_complaint_status(p_complaint_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'yonetici') then raise exception 'Bu işlem için yetkiniz yok.'; end if;
  if p_status not in ('acik','inceleniyor','cozuldu') then raise exception 'Geçersiz durum.'; end if;
  update public.complaints set status = p_status, updated_at = now() where id = p_complaint_id;
  if not found then raise exception 'Kayıt bulunamadı.'; end if;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id) values(auth.uid(), 'complaint_' || p_status, 'complaint', p_complaint_id::text);
end;
$$;
revoke all on function public.set_complaint_status(uuid,text) from public;
grant execute on function public.set_complaint_status(uuid,text) to authenticated;