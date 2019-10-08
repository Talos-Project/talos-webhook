export interface Storage<RT,WT> {
    read(): RT
    write(content: WT)
}