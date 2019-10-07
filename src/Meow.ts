import { Plugin } from "./Plugin"
import { GitProvider } from "./GitProvider";
import { NoteEvent } from "./NoteEvent";

export class Meow implements Plugin<any, Promise<any>> {

    private client

    constructor(client: GitProvider) {
        this.client = client
    }

    handle(rx: NoteEvent): Promise<Promise<any>> {
        if (rx.object_attributes.note.includes("/meow"))
        return this.client.MergeRequestNotes
            .create(rx.project_id, rx.merge_request.iid, "![cat](https://cataas.com/cat)");
    }
    
}