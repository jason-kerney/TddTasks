import { Activity, none, None } from "./generalTypes";
import { Factory, IContainer } from "./container"

export type StateChangeConstructor = (stateName: string, activity: Activity, activityDescriptor: string | None, previous? : IStateChange) => IStateChange

export abstract class IStateChange {
  abstract stateName: string;
  abstract date: Date;
  abstract activity: Activity;
  abstract activityDescriptor: string | None;
  abstract previous: IStateChange | None;

  getFirst() : IStateChange {
    let r = this as IStateChange
    while(r.previous !== none) {
      r = r.previous;
    }

    return r;
  }

  getFirstUpdateDate(): Date {
    return this.getFirst().date;
  }

  getLastUpdateDate(): Date {
    return this.date;
  }
}

class StateChange extends IStateChange {
  stateName: string;
  date: Date;
  activity: Activity;
  activityDescriptor: string | None;
  previous: IStateChange | "none";

  constructor(stateName: string, activity: Activity, activityDescriptor: string | None, date: Date, previous : IStateChange | None = none) {
    super();
    this.stateName = stateName;
    this.date = date;
    this.activity = activity;
    this.activityDescriptor = activityDescriptor;
    this.previous = previous;
  }
}

export const stateChangeBuilder =
  function(factory: IContainer){
    const ctor: StateChangeConstructor = (name: string, activity: Activity, activityDescriptor: string | None, previous : IStateChange | None = none) => {
      const date = factory.build<Date>('Now')();

      return new StateChange(name, activity, activityDescriptor, date, previous);
    };

    return ctor;
  };
