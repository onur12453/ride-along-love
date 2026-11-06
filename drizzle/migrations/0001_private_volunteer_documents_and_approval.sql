create table public.volunteer_documents (
  id uuid primary key default gen_random_uuid(),
  volunteer_id uuid not null references public.profiles(id) on delete cascade,
  document_type public.document_kind not null,
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','application/pdf')),
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 5242880),
  status public.review_status not null default 'beklemede',
  rejection_reason text,
  consent_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(volunteer_id, document_type)
);
grant select, insert, delete on public.volunteer_documents to authenticated;
grant all on public.volunteer_documents to service_role;
alter table public.volunteer_documents enable row level security;
create policy "documents_owner_or_reviewer_read" on public.volunteer_documents for select to authenticated
using (volunteer_id = auth.uid() or public.has_role(auth.uid(), 'belge_denetci'));
create policy "documents_owner_insert" on public.volunteer_documents for insert to authenticated
with check (volunteer_id = auth.uid() and public.has_role(auth.uid(), 'gonullu') and storage_path like auth.uid()::text || '/%' and status = 'beklemede' and (document_type <> 'adli_sicil' or consent_at is not null));
create policy "documents_owner_pending_delete" on public.volunteer_documents for delete to authenticated
using (volunteer_id = auth.uid() and status = 'beklemede');
create index volunteer_documents_volunteer_idx on public.volunteer_documents(volunteer_id, document_type);

create table public.document_access_logs (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.volunteer_documents(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);
grant select on public.document_access_logs to authenticated;
grant all on public.document_access_logs to service_role;
alter table public.document_access_logs enable row level security;
create policy "document_access_reviewer_read" on public.document_access_logs for select to authenticated
using (public.has_role(auth.uid(), 'belge_denetci'));

create or replace function public.log_document_access(p_document_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.volunteer_documents d where d.id = p_document_id and (d.volunteer_id = auth.uid() or public.has_role(auth.uid(), 'belge_denetci'))) then
    raise exception 'Belge bulunamadı veya erişim yetkiniz yok.';
  end if;
  insert into public.document_access_logs(document_id, actor_id) values(p_document_id, auth.uid());
end;
$$;
revoke all on function public.log_document_access(uuid) from public;
grant execute on function public.log_document_access(uuid) to authenticated;

create or replace function public.accept_ride(p_request_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v record;
begin
  if not public.has_role(auth.uid(), 'gonullu') then raise exception 'Bu işlem için yetkiniz yok.'; end if;
  select * into v from public.profiles where id = auth.uid();
  if v.volunteer_status <> 'onaylandi' or not v.training_passed then raise exception 'Talep kabul etmek için onaylı başvuru ve eğitim gereklidir.'; end if;
  if not exists(select 1 from public.volunteer_documents d where d.volunteer_id = auth.uid() and d.document_type = 'kimlik_on' and d.status = 'onaylandi')
     or not exists(select 1 from public.volunteer_documents d where d.volunteer_id = auth.uid() and d.document_type = 'kimlik_arka' and d.status = 'onaylandi') then
    raise exception 'Kimlik belgeleriniz henüz doğrulanmadı.';
  end if;
  if v.has_vehicle and (not exists(select 1 from public.volunteer_documents d where d.volunteer_id = auth.uid() and d.document_type = 'ehliyet' and d.status = 'onaylandi')
     or not exists(select 1 from public.volunteer_documents d where d.volunteer_id = auth.uid() and d.document_type = 'ruhsat' and d.status = 'onaylandi')) then
    raise exception 'Araç belgeleriniz henüz doğrulanmadı.';
  end if;
  update public.ride_requests r set volunteer_id = auth.uid(), status = 'gonullu_bulundu', updated_at = now()
  where r.id = p_request_id and r.status = 'olusturuldu'
    and exists(select 1 from public.volunteer_service_areas a where a.volunteer_id = auth.uid() and a.city = r.from_city and a.district = r.from_district);
  if not found then raise exception 'Talep bulunamadı, uygun değil veya başka bir gönüllü eşleşti.'; end if;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id) values(auth.uid(), 'ride_accepted', 'ride_request', p_request_id::text);
end;
$$;
revoke all on function public.accept_ride(uuid) from public;
grant execute on function public.accept_ride(uuid) to authenticated;

create or replace function public.review_document(p_document_id uuid, p_status public.review_status, p_reason text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(), 'yonetici') or not public.has_role(auth.uid(), 'belge_denetci') then raise exception 'Bu işlem için yetkiniz yok.'; end if;
  if p_status not in ('onaylandi','reddedildi') then raise exception 'Geçersiz belge durumu.'; end if;
  if p_status = 'reddedildi' and char_length(trim(coalesce(p_reason,''))) < 3 then raise exception 'Ret sebebi gereklidir.'; end if;
  update public.volunteer_documents set status = p_status, rejection_reason = case when p_status = 'reddedildi' then left(trim(p_reason),500) else null end,
    reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now() where id = p_document_id;
  if not found then raise exception 'Belge bulunamadı.'; end if;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
  values(auth.uid(), 'document_' || p_status, 'volunteer_document', p_document_id::text, jsonb_build_object('reason', case when p_status = 'reddedildi' then left(trim(p_reason),500) else null end));
end;
$$;
revoke all on function public.review_document(uuid,public.review_status,text) from public;
grant execute on function public.review_document(uuid,public.review_status,text) to authenticated;

create or replace function public.set_volunteer_status(p_volunteer_id uuid, p_status public.review_status)
returns void language plpgsql security definer set search_path = public as $$
declare v record;
begin
  if not public.has_role(auth.uid(), 'yonetici') then raise exception 'Bu işlem için yetkiniz yok.'; end if;
  if p_status not in ('onaylandi','reddedildi','beklemede') then raise exception 'Geçersiz başvuru durumu.'; end if;
  select * into v from public.profiles where id = p_volunteer_id and public.has_role(p_volunteer_id, 'gonullu');
  if v.id is null then raise exception 'Gönüllü bulunamadı.'; end if;
  if p_status = 'onaylandi' then
    if not v.training_passed then raise exception 'Eğitim tamamlanmadan gönüllü onaylanamaz.'; end if;
    if not exists(select 1 from public.volunteer_documents d where d.volunteer_id = p_volunteer_id and d.document_type = 'kimlik_on' and d.status = 'onaylandi')
       or not exists(select 1 from public.volunteer_documents d where d.volunteer_id = p_volunteer_id and d.document_type = 'kimlik_arka' and d.status = 'onaylandi') then
      raise exception 'Kimlik belgeleri onaylanmadan başvuru onaylanamaz.';
    end if;
    if v.has_vehicle and (not exists(select 1 from public.volunteer_documents d where d.volunteer_id = p_volunteer_id and d.document_type = 'ehliyet' and d.status = 'onaylandi')
       or not exists(select 1 from public.volunteer_documents d where d.volunteer_id = p_volunteer_id and d.document_type = 'ruhsat' and d.status = 'onaylandi')) then
      raise exception 'Araç belgeleri onaylanmadan başvuru onaylanamaz.';
    end if;
  end if;
  update public.profiles set volunteer_status = p_status, updated_at = now() where id = p_volunteer_id;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id) values(auth.uid(), 'volunteer_' || p_status, 'profile', p_volunteer_id::text);
end;
$$;
revoke all on function public.set_volunteer_status(uuid,public.review_status) from public;
grant execute on function public.set_volunteer_status(uuid,public.review_status) to authenticated;

create policy "volunteer_documents_owner_upload" on storage.objects for insert to authenticated
with check (bucket_id = 'volunteer-documents' and (storage.foldername(name))[1] = auth.uid()::text and public.has_role(auth.uid(), 'gonullu'));
create policy "volunteer_documents_owner_or_reviewer_read" on storage.objects for select to authenticated
using (bucket_id = 'volunteer-documents' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'belge_denetci')));
create policy "volunteer_documents_owner_update" on storage.objects for update to authenticated
using (bucket_id = 'volunteer-documents' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'volunteer-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "volunteer_documents_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'volunteer-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "profile_photos_owner_upload" on storage.objects for insert to authenticated
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "profile_photos_owner_or_admin_read" on storage.objects for select to authenticated
using (bucket_id = 'profile-photos' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'yonetici')));
create policy "profile_photos_owner_update" on storage.objects for update to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "profile_photos_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);