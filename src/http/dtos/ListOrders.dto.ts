export interface ListOrdersDTO {
  status?: string;
  clientCpf?: string;
  startDate?: Date;
  endDate?: Date;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
