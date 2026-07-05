WITH ranked_active_sessions AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId"
      ORDER BY "startTime" DESC, "createdAt" DESC
    ) AS row_number
  FROM "time_sessions"
  WHERE "endTime" IS NULL
)
UPDATE "time_sessions"
SET
  "endTime" = CURRENT_TIMESTAMP,
  "durationMinutes" = GREATEST(0, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "startTime")) / 60),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" IN (
  SELECT "id"
  FROM ranked_active_sessions
  WHERE row_number > 1
);

CREATE UNIQUE INDEX "time_sessions_one_active_per_user_idx"
ON "time_sessions"("userId")
WHERE "endTime" IS NULL;
