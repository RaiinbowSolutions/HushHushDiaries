export type Pagination<T> = {
    page: number,
    length: number,
    data: T[],
    next: string,
    previus: string,
}