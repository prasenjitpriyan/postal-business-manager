export interface PopulatedOfficial {
  _id: string;
  name: string;
  designation: string;
}

export interface BusinessContribution {
  _id: string;
  officialId: string | PopulatedOfficial; // Could be populated with Official object
  contributionDate: string;
  contributeOffice: string;
  accountType: string;
  accountsOpened: number;
  remarks?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetContributionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  officialId?: string;
  sortArray?: { id: string; desc: boolean }[];
}
