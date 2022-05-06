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

export interface IStateChange {
    stateName: string;
    date: Date;
    activity: Activity;
    activityDescriptor: string | None;
    next: IStateChange | None;
    getLast() : IStateChange;
    getLastUpdateDate() : Date;
}

export type StateChangeConstructor = (stateName: string, activity: Activity, activityDescriptor: string | None, previous? : IStateChange) => IStateChange

export interface ITask {
    name: string;
    size: Size | Unsized;
    states: IStateChange;
    currentState: IStateChange;
    changeState: (stateName: string, activity: Activity, activityDescriptor: string | None) => void;
}

export type TaskConstructor = (name: string, size?: Size) => ITask;
