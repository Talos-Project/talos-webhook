import { User } from './User';
import { MergeRequestEventAttributes } from './MergeRequestEventAttributes';
import { Project } from './Project';

export interface MergeRequestEvent {
    user: User;
    project: Project;
    object_attributes: MergeRequestEventAttributes;
}
