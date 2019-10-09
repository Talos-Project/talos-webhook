import { ObjectKind } from "./GenericEvent";
import { Project } from "../structs/Project";
import { Job } from "../structs/Job";

export type Status = 'running' | 'passed' | 'failed'

export interface PipelineEvent {
    builds: Job[]
    object_kind: ObjectKind
    object_attributes: PipelineObjectAttributes
    project: Project

}

export interface PipelineObjectAttributes {
    detailed_status: Status
    variables: PipelineVariable[]
}
export interface PipelineVariable {
    key: string
    value: string
}