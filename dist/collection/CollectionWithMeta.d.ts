export interface CollectionWithMeta<T> {
    items: T[];
    paginationInfo?: PaginationInfo;
}
interface PaginationInfo {
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
export {};
