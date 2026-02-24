export interface DndEndpoints<T> {
    count : number,
    results: T[];
}
export interface DndClass{
    index:string,
    name:string,
    url:string,
    level?: number
}
