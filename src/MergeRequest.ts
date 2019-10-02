export interface MergeRequest {
    labels: string[]
    changes_count: string
}

export type MergeRequestId = number | string