export interface DndEndpoints {
    count : number,
    results: DndClass | DndSpells [] ;
}
export interface DndClass{
    index:string,
    name:string,
    url:string
}

export interface DndSpells extends DndClass{
    
    level: number
   
}