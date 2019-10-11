export interface Plugin<Rx,Tx> {
    handle(rx: Rx): Promise<Tx>
}