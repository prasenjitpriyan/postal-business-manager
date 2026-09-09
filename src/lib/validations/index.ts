import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const officialSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  designation: z.string().trim().min(2, 'Designation must be at least 2 characters').max(100),
  office: z.string().trim().min(2, 'Office must be at least 2 characters').max(150),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits').max(15),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  employeeId: z.string().trim().max(50).optional().or(z.literal('')),
  joiningDate: z.string().or(z.date()).refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Invalid joining date format',
  }),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateOfficialSchema = officialSchema.partial();

export const contributionSchema = z.object({
  officialId: z.string().regex(objectIdRegex, 'Invalid official identifier'),
  contributionDate: z.string().or(z.date()).refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Invalid contribution date format',
  }),
  contributeOffice: z.string().trim().min(2, 'Office must be at least 2 characters').max(150),
  accountType: z.string().trim().min(1, 'Account type is required').max(100),
  accountsOpened: z.coerce.number().int('Must be a whole number').positive('Accounts opened must be at least 1'),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const updateContributionSchema = contributionSchema.partial();

export const insuranceSchema = z.object({
  officialId: z.string().regex(objectIdRegex, 'Invalid official identifier'),
  contributionDate: z.string().or(z.date()).refine((val) => !isNaN(new Date(val).getTime()), {
    message: 'Invalid contribution date format',
  }),
  officeOfIndexing: z.string().trim().min(2, 'Office of indexing is required').max(150),
  insuranceType: z.enum(['PLI', 'RPLI'], {
    message: 'Insurance type must be either PLI or RPLI',
  }),
  sumAssured: z.coerce.number().nonnegative('Sum assured must be 0 or greater'),
  initialPremium: z.coerce.number().nonnegative('Initial premium must be 0 or greater'),
  remarks: z.string().trim().max(500).optional().or(z.literal('')),
});

export const updateInsuranceSchema = insuranceSchema.partial();

export function clampPagination(rawPage?: string | number | null, rawLimit?: string | number | null, maxLimit = 100) {
  const pageNumber = typeof rawPage === 'number' ? rawPage : parseInt(rawPage || '1', 10);
  const limitNumber = typeof rawLimit === 'number' ? rawLimit : parseInt(rawLimit || '10', 10);

  const safePage = isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber;
  const safeLimit = isNaN(limitNumber) || limitNumber < 1 ? 10 : Math.min(limitNumber, maxLimit);

  return { page: safePage, limit: safeLimit };
}

export * from './target';
