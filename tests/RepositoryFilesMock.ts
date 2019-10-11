import { RepositoryFiles } from "../src/interfaces/GitClient";
import { ProjectId } from "../src/interfaces/structs/Project"
import { RepoBlob } from "../src/interfaces/structs/RepoBlob";

export class RepositoryFilesMock implements RepositoryFiles {
    
    show(project_id: ProjectId, filename: string, branch: string) {
        const approvers = ["approvers:", "- john", "- rick", "- bob", "- dick"];
        const reviewers = ["reviewers:", "- john", "- rick", "- bob", "- dick"];
        const rawFile = reviewers.concat(approvers).join("\n");
        const content = Buffer.from(rawFile).toString("base64");
        return new Promise(res => res(<RepoBlob>{ content }))
    }
    
}