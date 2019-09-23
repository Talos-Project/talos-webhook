import { User } from './User';
import { NoteEventAttributes } from './NoteEventAttributes';
import { MergeRequestEventAttributes } from './MergeRequestEventAttributes';
export interface NoteEvent {
  user: User;
  object_attributes: NoteEventAttributes;
  project_id: number | string;
  merge_request: MergeRequestEventAttributes;
}

