import { User } from "./User";

export interface MergeRequest {
    lgtmers: User[];
    reviewers: User[];
    labels: string[]
    changes_count: string
}

export type MergeRequestId = number | string