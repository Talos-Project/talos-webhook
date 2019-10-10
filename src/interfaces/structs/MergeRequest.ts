import { User } from "./User";

export interface MergeRequest {
    assignee: User;
    lgtmers: User[];
    reviewers: User[];
    labels: string[]
    changes_count: string
}

export type MergeRequestId = number | string