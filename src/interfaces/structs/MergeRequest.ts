import { User } from "./User";
import { ProjectId } from "./Project";

export interface MergeRequest {
    author: User
    assignee: User
    changes_count: string
    iid: MergeRequestId
    labels: string[]
    lgtmers: User[]
    reviewers: User[]
    project_id: ProjectId
}

export type MergeRequestId = number | string