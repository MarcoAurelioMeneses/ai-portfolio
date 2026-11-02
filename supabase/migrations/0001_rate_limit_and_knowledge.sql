-- Rate limits and the future pgvector knowledge table.
-- Apply in the Supabase SQL editor when you are ready to leave the in-memory limiter
-- or to turn on KNOWLEDGE_PROVIDER=pgvector.
-- Until then the app does not require this database.

create table if not exists public.rate_limit_buckets (
  key text primary key,
  count integer not null,
  reset_at timestamptz not null
);

alter table public.rate_limit_buckets enable row level security;

create or replace function public.consume_rate_limit(
  bucket_key text,
  max_count integer,
  window_seconds integer
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  row_count integer;
  row_reset timestamptz;
  now_ts timestamptz := now();
begin
  select count, rate_limit_buckets.reset_at
    into row_count, row_reset
  from public.rate_limit_buckets
  where key = bucket_key
  for update;

  if not found or row_reset <= now_ts then
    insert into public.rate_limit_buckets as bucket (key, count, reset_at)
    values (bucket_key, 1, now_ts + make_interval(secs => window_seconds))
    on conflict (key) do update
      set count = 1,
          reset_at = now_ts + make_interval(secs => window_seconds)
    returning bucket.count, bucket.reset_at into row_count, row_reset;

    allowed := true;
    remaining := greatest(max_count - row_count, 0);
    reset_at := row_reset;
    return next;
    return;
  end if;

  if row_count >= max_count then
    allowed := false;
    remaining := 0;
    reset_at := row_reset;
    return next;
    return;
  end if;

  update public.rate_limit_buckets as bucket
    set count = bucket.count + 1
    where bucket.key = bucket_key
    returning bucket.count, bucket.reset_at into row_count, row_reset;

  allowed := true;
  remaining := greatest(max_count - row_count, 0);
  reset_at := row_reset;
  return next;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

-- Optional retrieval index. Requires the pgvector extension.
create extension if not exists vector;

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists knowledge_chunks_embedding_idx
  on public.knowledge_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 20);

create or replace function public.match_knowledge(
  query_embedding vector(1536),
  match_count integer default 6
)
returns table (
  id uuid,
  source text,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
as $$
  select
    chunk.id,
    chunk.source,
    chunk.content,
    chunk.metadata,
    1 - (chunk.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks as chunk
  where chunk.embedding is not null
  order by chunk.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
