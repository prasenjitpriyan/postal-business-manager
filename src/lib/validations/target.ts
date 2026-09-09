import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const fyRegex = /^\d{4}-\d{4}$/;

export const targetSchema = z.object({
  title: z.string().trim().max(150).optional().or(z.literal('')),
  financialYear: z.string().trim().regex(fyRegex, 'Financial year must be in format YYYY-YYYY (e.g. 2026-2027)'),
  month: z.coerce.number().int().min(1).max(12).nullable().optional(),
  division: z.string().trim().default('Kolkata South Division'),
  subDivision: z.string().trim().optional().or(z.literal('')),
  office: z.string().trim().optional().or(z.literal('')),
  officialId: z
    .string()
    .trim()
    .refine((val) => !val || objectIdRegex.test(val), {
      message: 'Invalid official identifier',
    })
    .nullable()
    .optional(),
  category: z.enum(['PLI', 'RPLI', 'POSB'], {
    message: 'Category must be PLI, RPLI, or POSB',
  }),
  metricType: z.enum(
    ['POLICIES_COUNT', 'SUM_ASSURED', 'INITIAL_PREMIUM', 'ACCOUNTS_COUNT'],
    {
      message: 'Invalid metric type',
    }
  ),
  schemeType: z.string().trim().max(100).optional().or(z.literal('')),
  targetValue: z.coerce
    .number()
    .positive('Target value must be a positive number greater than 0'),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

export const updateTargetSchema = targetSchema.partial();
