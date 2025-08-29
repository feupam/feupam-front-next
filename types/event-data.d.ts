export interface EventData {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  image?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  price: number;
  maxClientMale: number;
  maxClientFemale: number;
  maxStaffMale: number;
  maxStaffFemale: number;
  eventType?: string;
  cupons?: Array<{
    id: string;
    name: string;
    code: string;
    discount: number;
    maxUses?: number;
    currentUses?: number;
  }>;
  status?: string;
  remainingSpots?: number;
}
