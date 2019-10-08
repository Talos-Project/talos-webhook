import { User } from './User';
import { MergeRequestEventAttributes } from './MergeRequestEventAttributes';
import { Project } from './Project';
import { ObjectKind } from './GenericEvent';

export interface MergeRequestEvent {
    object_kind: ObjectKind
    user: User;
    project: Project;
    object_attributes: MergeRequestEventAttributes;
}
