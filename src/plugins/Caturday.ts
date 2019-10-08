import { Plugin } from "../interfaces/Plugin"
import { GitClient } from "../interfaces/GitClient";
import { NoteEvent } from "../interfaces/NoteEvent";

export class Caturday implements Plugin<any, Promise<any>> {

    private client: GitClient

    constructor(client: GitClient) {
        this.client = client
    }

    handle(rx: NoteEvent): Promise<any> {
        if (rx.object_kind !== "note")
            return 

        if (rx.object_attributes.note && rx.object_attributes.note.includes("/meow"))
        return this.client.MergeRequestNotes
            .create(rx.project_id, rx.merge_request.iid, "![cat](https://cataas.com/cat)");
    }
    
}