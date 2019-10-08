import { User } from './User';
import { NoteEventAttributes } from './NoteEventAttributes';
import { MergeRequestEventAttributes } from './MergeRequestEventAttributes';
import { ObjectKind } from './GenericEvent';

export interface NoteEvent {
  object_kind: ObjectKind;
  user: User;
  object_attributes: NoteEventAttributes;
  project_id: number | string;
  merge_request: MergeRequestEventAttributes;
}

