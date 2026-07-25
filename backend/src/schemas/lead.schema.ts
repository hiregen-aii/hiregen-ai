// backend/src/schemas/lead.schema.ts
export const leadSchema = z.object({
  hiring_signal_id: z.string().uuid(),
  company_id: z.string().uuid(),
  hiring_type: z.enum(['INTERN', 'FULL_TIME', 'CONTRACT', 'BULK_HIRING', 'CAMPUS_DRIVE']),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  fit_score: z.number().min(0).max(100),
});