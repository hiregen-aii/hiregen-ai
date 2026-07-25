// backend/src/schemas/hiring-signal.schema.ts
import { z } from 'zod';

export const hiringSignalSchema = z.object({
  company_id: z.string().uuid().optional(),
  source: z.string(),              // 'linkedin_jobs_api', 'career_page', etc.
  source_url: z.string().url(),
  role_title: z.string(),
  hiring_type: z.enum(['INTERN', 'FULL_TIME', 'CONTRACT', 'BULK_HIRING', 'CAMPUS_DRIVE']),
  raw_payload: z.record(z.unknown()),
});