import { ProjectId } from "./Project";
import { User } from "./User";

export interface GenericEvent {
    event_type: EventType
    object_kind: ObjectKind
    object_attributes: object
    project_id: ProjectId
    user: User
}

// FIXME define all event types
export type EventType = string
export type ObjectKind = "note" | "pipeline" | "build" | "merge_request"