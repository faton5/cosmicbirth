create table if not exists apod_cache (
  date        date primary key,
  title       text not null,
  explanation text not null,
  url         text not null,
  hdurl       text,
  media_type  text not null check (media_type in ('image', 'video')),
  copyright   text,
  fetched_at  timestamptz default now()
);

create table if not exists date_stats (
  date     date primary key,
  views    integer default 0,
  shares   integer default 0
);

create or replace function increment_views(target_date date)
returns void as $$
begin
  insert into date_stats (date, views, shares)
  values (target_date, 1, 0)
  on conflict (date)
  do update set views = date_stats.views + 1;
end;
$$ language plpgsql;

create or replace function increment_shares(target_date date)
returns void as $$
begin
  insert into date_stats (date, views, shares)
  values (target_date, 0, 1)
  on conflict (date)
  do update set shares = date_stats.shares + 1;
end;
$$ language plpgsql;
