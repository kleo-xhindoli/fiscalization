export type NextFn = (err?: Error | string) => any;

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
  };
}

export interface PaginationInput {
  page: string;
  size: string;
  sort: string;
  sortDirection: 'asc' | 'desc';
}

export interface Client {
  name: string;
}

export interface Clients {
  [key: string]: Client;
}

