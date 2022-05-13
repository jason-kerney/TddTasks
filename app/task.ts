import { IContainer } from "./container";
import { Activity, none, Size, Unsized } from "./generalTypes";
import { IStateChange, StateChangeConstructor } from "./stateChange";

export abstract class ITask {
  abstract readonly name: string;
  abstract readonly size: Size | Unsized;
  abstract get states(): IStateChange;
  abstract get activity(): Activity;
  abstract changeState(stateName: string, activity: Activity, activityDescriptor?: string) : void
}

export type TaskConstructor = (name: string, size?: Size) => ITask;

class Task extends ITask {
  private stateBuilder: StateChangeConstructor;

  private readonly iName: string;
  get name(): string {
    return this.iName;
  }

  private iSize: Size | Unsized;
  get size(): Size | Unsized {
    return this.iSize;
  }

  private iStates: IStateChange;
  get states(): IStateChange{
    return this.iStates;
  }

  private iActivity: Activity;
  get activity(): Activity {
    return this.iActivity;
  }

  constructor(name: string, size: Size | Unsized, stateBuilder: StateChangeConstructor) {
    super();
    this.iName = name;
    this.iSize = size;
    this.stateBuilder = stateBuilder;
    this.iStates = stateBuilder('Created', 'Non-Active', none);
    this.iActivity = this.states.activity;
  }

  changeState(stateName: string, activity: Activity, activityDescriptor: string = none) : void {
    this.iStates = this.stateBuilder(stateName, activity, activityDescriptor, this.states);
    this.iActivity = this.states.activity;
  }
}

function builder(factory: IContainer): TaskConstructor {
  return function (name: string, size: Size | Unsized = 'No Size'): ITask {
    return new Task(name, size, factory.build(IStateChange));
  };
}

export function taskBuilder(factory: IContainer) {
  return builder(factory);
}
