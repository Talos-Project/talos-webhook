export interface MergeRequestEventAttributes {
    iid: number;
    action: string;
    source_branch: string;
    target_branch: string;
    assignee_id: number | string;
    author_id: number | string;
}