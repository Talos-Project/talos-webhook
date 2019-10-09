import { User } from '../structs/User';
import { Project } from '../structs/Project';
import { ObjectKind } from './GenericEvent';

export interface MergeRequestEvent {
    object_kind: ObjectKind
    user: User;
    project: Project;
    object_attributes: MergeRequestEventAttributes;
}

export interface MergeRequestEventAttributes {
    iid: number;
    action: string;
    source_branch: string;
    target_branch: string;
    assignee_id: number | string;
    author_id: number | string;
    work_in_progress: boolean | string;
    title: string;
}