import { Activity, none, None } from "./generalTypes";
import { Factory, IContainer } from "./container"

export type StateChangeConstructor = (stateName: string, activity: Activity, activityDescriptor: string | None, previous?: IStateChange) => IStateChange

export abstract class IStateChange {
  abstract get stateName(): string;
  abstract get date(): Date;
  abstract get activity(): Activity;
  abstract get activityDescriptor(): string | None;
  abstract get previous(): IStateChange | None;

  getFirst(): IStateChange {
    let r = this as IStateChange
    while (r.previous !== none) {
      r = r.previous;
    }

    return r;
  }

  getFirstUpdateDate(): Date {
    return new Date(this.getFirst().date);
  }

  count(): number {
    let r = 1;
    let p = this.previous;
    if (p !== none) {
      r += p.count();
    }

    return r;
  }
}

class StateChange extends IStateChange {
  private readonly iStateName: string;
  get stateName(): string {
    return this.iStateName;
  }

  private readonly iDate: Date;
  get date(): Date {
    return this.iDate;
  }

  private readonly iActivity: Activity;
  get activity(): Activity {
    return this.iActivity;
  }

  private readonly iActivityDescriptor: string | None;
  get activityDescriptor(): string {
    return this.iActivityDescriptor;
  }

  private readonly iPrevious: IStateChange | "none";
  get previous(): IStateChange | "none" {
    return this.iPrevious;
  }

  constructor(stateName: string, activity: Activity, activityDescriptor: string | None, date: Date, previous: IStateChange | None) {
    super();
    this.iStateName = stateName;
    this.iDate = new Date(date);
    this.iActivity = activity;
    this.iActivityDescriptor = activityDescriptor;
    this.iPrevious = previous;
  }
}

export const stateChangeBuilder =
  function (factory: IContainer) {
    const ctor: StateChangeConstructor = (name: string, activity: Activity, activityDescriptor: string | None, previous: IStateChange | None = none) => {
      const date = factory.build(Date)();

      return new StateChange(name, activity, activityDescriptor, date, previous);
    };

    return ctor;
  };
