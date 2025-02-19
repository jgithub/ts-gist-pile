export interface CollectionWithMeta<T> {
  items: T[];

  // Optional Meta information like pagination details
  paginationInfo?: PaginationInfo;
}

interface PaginationInfo {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}