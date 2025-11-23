-- Migration to normalize category slugs to ASCII-friendly form and create redirects from old slugs
-- Requires: a table "categories" with columns (id uuid, name text, slug text unique)
-- Safe to run multiple times; existing redirects are upserted.

-- 1) Helper function to generate ASCII slug from a name (Polish diacritics mapping)
create or replace function public.slugify_pl(name text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(
    regexp_replace(
      regexp_replace(
        translate(lower($1), 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ', 'acelnoszzacelnoszz'),
        '\s+', '-', 'g'  -- spaces to hyphen
      ),
      '[^a-z0-9-]+', '', 'g' -- remove non ascii/digits/hyphen
    ),
    '-+', '-', 'g' -- collapse hyphens
  ));
$$;

-- 2) Redirects table to keep old -> new slug mapping
create table if not exists public.category_slug_redirects (
  old_slug text primary key,
  new_slug text not null,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3) Migration function: updates categories.slug and records redirects
create or replace function public.migrate_category_slugs()
returns integer language plpgsql as $$
declare
  rec record;
  base text;
  desired text;
  candidate text;
  i int;
  updated_count int := 0;
  existing_id uuid;
begin
  for rec in select id, name, slug from public.categories loop
    base := public.slugify_pl(rec.name);
    -- If already normalized and equal, skip
    if rec.slug = base then
      continue;
    end if;

    -- ensure uniqueness
    desired := base;
    i := 2;
    loop
      select id into existing_id from public.categories where slug = desired and id <> rec.id limit 1;
      exit when existing_id is null;
      desired := base || '-' || i::text;
      i := i + 1;
    end loop;

    -- upsert redirect if slug changed and old slug not null
    if rec.slug is not null and rec.slug <> desired then
      insert into public.category_slug_redirects(old_slug, new_slug, category_id)
      values (rec.slug, desired, rec.id)
      on conflict (old_slug) do update set new_slug = excluded.new_slug, category_id = excluded.category_id;
    end if;

    update public.categories set slug = desired where id = rec.id;
    updated_count := updated_count + 1;
  end loop;

  return updated_count;
end;
$$;
