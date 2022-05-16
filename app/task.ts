import { IContainer } from "./container";
import { Activity, none, Size, Unsized } from "./generalTypes";
import { IStateChange, StateChangeConstructor } from "./stateChange";

export abstract class ITask {
  abstract get name(): string;
  abstract get size(): Size | Unsized;
  abstract get states(): IStateChange;
  abstract get activity(): Activity;
  abstract changeState(stateName: string, activity: Activity, activityDescriptor?: string) : void
}

export type TaskConstructor = (name: string, size?: Size, callback?: (task: ITask) => void) => ITask;

class Task extends ITask {
  private stateBuilder: StateChangeConstructor;

  private readonly iName: string;
  get name(): string {
    return this.iName;
  }

  private readonly iSize: Size | Unsized;
  get size(): Size | Unsized {
    return this.iSize;
  }

  private iStates: IStateChange;
  get states(): IStateChange{
    return this.iStates;
  }

  get activity(): Activity {
    return this.states.activity;
  }

  constructor(name: string, size: Size | Unsized, stateBuilder: StateChangeConstructor, callback?: (task: ITask) => void) {
    super();
    this.iName = name;
    this.iSize = size;
    this.stateBuilder = stateBuilder;
    this.iStates = stateBuilder('Created', 'Non-Active', none);
    if (callback === undefined) return;
    callback(this);
  }

  changeState(stateName: string, activity: Activity, activityDescriptor: string = none) : void {
    this.iStates = this.stateBuilder(stateName, activity, activityDescriptor, this.states);
  }
}

function builder(factory: IContainer): TaskConstructor {
  return function (name: string, size: Size | Unsized = 'No Size', callback?: (task: ITask) => void): ITask {
    return new Task(name, size, factory.build(IStateChange), callback);
  };
}

export function taskBuilder(factory: IContainer) {
  return builder(factory);
}
