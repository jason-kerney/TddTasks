import { IStateChange } from "./stateChange"

export type Activity =
    | 'Non-Active'
    | 'Active'
    | 'Closed'

export type Size =
    | 'Tiny'
    | 'Extra Small'
    | 'Small'
    | 'Medium'
    | 'Large'
    | 'Extra Large'

export type Unsized = 'No Size'

export type None = 'none'
export const none : None = 'none'

export abstract class ITask {
    abstract name: string;
    abstract size: Size | Unsized;
    abstract states: IStateChange;
    abstract currentState: IStateChange;
    abstract changeState(stateName: string, activity: Activity, activityDescriptor: string) : void
}

export type TaskConstructor = (name: string, size?: Size) => ITask;
