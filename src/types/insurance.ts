import { PopulatedOfficial } from './contribution';

export type InsuranceType = 'PLI' | 'RPLI';

export interface InsuranceContribution {
  _id: string;
  officialId: string | PopulatedOfficial;
  contributionDate: string;
  officeOfIndexing: string;
  insuranceType: InsuranceType;
  sumAssured: number;
  initialPremium: number;
  remarks?: string;
  createdBy: string | { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface GetInsuranceQuery {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  officialId?: string;
  insuranceType?: InsuranceType | 'ALL';
  sortArray?: { id: string; desc: boolean }[];
}
