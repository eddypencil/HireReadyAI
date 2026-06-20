# Job Embeddings Plan

## Goal

Create and store vector embeddings for job postings so we can do semantic search / similarity matching (e.g., find similar jobs, match candidates to jobs by meaning rather than keyword overlap).

## How It Works

1. When a job is created (or edited), call HuggingFace's embedding API to generate a vector embedding of the job's `title`, `description`, `skills`, and `requirements`.
2. Store the embedding vector in the `job_postings` table (new `embedding` column) or a separate `job_embeddings` table.
3. Use pgvector in Supabase for efficient nearest-neighbor queries.

## Changes Needed

### 1. Database: Add `embedding` column to `job_postings`

```sql
ALTER TABLE job_postings ADD COLUMN embedding vector(384);
```

384 dimensions matches `sentence-transformers/all-MiniLM-L6-v2`.

Or create a separate table if preferred:
```sql
CREATE TABLE job_embeddings (
  job_id uuid PRIMARY KEY REFERENCES job_postings(id) ON DELETE CASCADE,
  embedding vector(384),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Edge Function: `embed-job.ts`

Triggered when a job is created or updated. Accepts `jobId`, fetches the job details, calls HuggingFace embedding API, stores the result.

```ts
// Input: { jobId }
// 1. Fetch job: title, description, skills, requirements
// 2. Build text: combine title + description + skills + requirements
// 3. Call POST https://router.huggingface.co/v1/embeddings
//    model: sentence-transformers/all-MiniLM-L6-v2
//    input: [combinedText]
// 4. Store embedding in job_postings.embedding
//    UPSERT job_embeddings SET embedding = $1 WHERE job_id = $2
```

### 3. Service: Trigger on create/update

In `useJobs` hook or `createJob` / `updateJob` services, fire-and-forget call to the edge function after a successful job save.

```js
// After successful job creation
supabase.functions.invoke("embed-job", { body: { jobId: newJob.id } });
```

### 4. Edge Function: `search-jobs.ts` (optional, for future use)

Accept a query text, embed it, then pgvector search to find most similar jobs.

```ts
// Input: { query, limit? }
// 1. Embed query text via HuggingFace
// 2. SELECT *, embedding <=> $queryEmbedding AS distance
//    FROM job_postings
//    WHERE embedding IS NOT NULL
//    ORDER BY distance ASC
//    LIMIT limit
// 3. Return results
```

### 5. Verify pgvector extension is enabled in Supabase

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Check in Supabase SQL editor. Likely already available.

## How It Connects to Existing Features

| Feature | How embeddings help |
|---------|-------------------|
| Auto-generate criteria | Could find similar past jobs and reuse/adjust their criteria |
| CV Review | Compare candidate CV embedding to job embedding for semantic match score |
| Candidate search | Find candidates whose profiles semantically match a job |
| Job recommendations | Show applicants similar jobs they might want |

## Implementation Order

1. Enable pgvector extension (if not already)
2. Add `embedding` column to `job_postings`
3. Create `embed-job.ts` edge function
4. Wire it into `createJob()` in JDGeneratorPage
5. Test: create a job, verify embedding is stored

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/shared/edge/embed-job.ts` | **Create** — new edge function |
| `schema.md` | **Update** — add embedding column docs |
| `src/features/companies/pages/JDGeneratorPage.jsx` | **Modify** — call embed-job after publish |
| `src/features/jobs/hooks/useJobs.js` | **Modify** — call embed-job on create/update (if used elsewhere) |
