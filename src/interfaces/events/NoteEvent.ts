import { User } from '../structs/User';
import { ObjectKind } from './GenericEvent';
import { MergeRequestEventAttributes } from './MergeRequestEvent';

export interface NoteEvent {
  object_kind: ObjectKind;
  user: User;
  object_attributes: NoteEventAttributes;
  project_id: number | string;
  merge_request: MergeRequestEventAttributes;
}

export interface NoteEventAttributes {
    note: string;
    author_id: number;
}
