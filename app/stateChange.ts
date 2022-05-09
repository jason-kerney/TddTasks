import { Activity, none, None } from "./generalTypes";
import { Factory, IContainer } from "./container"

export type StateChangeConstructor = (stateName: string, activity: Activity, activityDescriptor: string | None, previous? : IStateChange) => IStateChange

export abstract class IStateChange {
  abstract readonly stateName: string;
  abstract readonly date: Date;
  abstract readonly activity: Activity;
  abstract readonly activityDescriptor: string | None;
  abstract readonly previous: IStateChange | None;

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

  count(): number {
    let r = 1;
    let p = this.previous;
    if(p !== none) {
      r += p.count();
    }

    return r;
  }
}

class StateChange extends IStateChange {
  readonly stateName: string;
  readonly date: Date;
  readonly activity: Activity;
  readonly activityDescriptor: string | None;
  readonly previous: IStateChange | "none";

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
      const date = factory.build(Date)();

      return new StateChange(name, activity, activityDescriptor, date, previous);
    };

    return ctor;
  };
