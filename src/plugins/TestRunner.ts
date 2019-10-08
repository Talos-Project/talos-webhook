import { Plugin } from "../interfaces/Plugin"
import { GitClient } from "../interfaces/GitClient";
import { NoteEvent } from "../interfaces/NoteEvent";
import { RepositoryOwners } from "../interfaces/RepositoryOwners";

export class TestRunner implements Plugin<any, Promise<any>> {

    private client: GitClient

    constructor(client: GitClient) {
        this.client = client
    }

    async handle(rx: NoteEvent): Promise<any> {

        if (rx.object_kind !== "note")
            return 

        if ( !rx.object_attributes.note.includes("/test"))
            return
        
        return this.handlePipelineRequest(rx)

    }

    private async handlePipelineRequest(rx: NoteEvent) {
        
        const successMessage = `
            @${rx.user.username}, 
            your requst for tests has been submitted! 
            I will post test results once they are ready.
            `
        
        const failMessage = `
            Sorry @${rx.user.username} but you are not allowed to run tests
        `

        let message = successMessage
        
        const { approvers, reviewers } = <RepositoryOwners>await this.client
            .RepositoryOwners.show(rx.project_id)

        if (!approvers.map(u => u.id).includes(rx.object_attributes.author_id) ||
            !reviewers.map(u => u.id).includes(rx.object_attributes.author_id))
            message = failMessage
        
        if (message === successMessage)
            this.triggerPipeline(rx)

        return this.client.MergeRequestNotes.create(rx.project_id, rx.merge_request.iid, message)
    }

    private async triggerPipeline(rx: NoteEvent) {
        const variables = [
            { "key": "MR_ID", "value": rx.merge_request.iid.toString() },
            { "key": "MR_REF", "value": rx.merge_request.source_branch }
        ];

        return this.client.Pipelines
            .create(
                rx.project_id, 
                rx.merge_request.target_branch, 
                { variables }
            )
            .catch(err => console.log(err));
    }

}