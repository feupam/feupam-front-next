export interface EventData {
  uuid: string;
  name: string;
  description?: string;
  image?: string;
  startDate: string;
  endDate: string;
  location?: string;
  price: number;
  maxClientMale: number;
  maxClientFemale: number;
  maxStaffMale: number;
  maxStaffFemale: number;
  cupons?: Array<{
    name: string;
    discount: number;
  }>;
  eventType?: string;
}
