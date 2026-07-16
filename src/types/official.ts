export enum OfficialStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Official {
  _id: string;
  name: string;
  phone: string;
  designation: string;
  office: string;
  status: OfficialStatus;
  createdAt: string;
  updatedAt: string;
}
