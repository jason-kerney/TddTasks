import { Activity, none, None } from "./generalTypes";
import { Factory, IContainer } from "./container"

export type StateChangeConstructor = (stateName: string, activity: Activity, activityDescriptor: string | None, previous? : IStateChange) => IStateChange

export abstract class IStateChange {
  abstract stateName: string;
  abstract date: Date;
  abstract activity: Activity;
  abstract activityDescriptor: string | None;
  abstract next: IStateChange | None;
  abstract getLast() : IStateChange;
  abstract getLastUpdateDate() : Date;
}

class StateChange extends IStateChange {
  stateName: string;
  date: Date;
  activity: Activity;
  activityDescriptor: string | None;
  next: IStateChange | None;

  constructor(stateName: string, activity: Activity, activityDescriptor: string | None, date: Date, previous : IStateChange | None = none) {
    super();
    this.stateName = stateName;
    this.date = date;
    this.activity = activity;
    this.activityDescriptor = activityDescriptor;
    this.next = none;

    if (previous === none) return;

    previous.getLast().next = this;
  }

  getLast(): IStateChange {
    let r = this as IStateChange;
    while(r.next !== none) {
      r = r.next;
    }

    return r;
  }

  getLastUpdateDate(): Date {
    return this.getLast().date;
  }
}

export const stateChangeBuilder =
  function(factory: IContainer){
    const ctor: StateChangeConstructor = (name: string, activity: Activity, activityDescriptor: string | None, previous : IStateChange | None = none) => {
      const date = factory.build<Date>('Now')();

      if(previous === none){
        return new StateChange(name, activity, activityDescriptor, date);
      }

      new StateChange(name, activity, activityDescriptor, date, previous);
      return previous;
    };

    return ctor;
  };
