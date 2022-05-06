import { IContainer } from "./container";
import { Activity, none, Size, Unsized } from "./generalTypes";
import { IStateChange, StateChangeConstructor } from "./stateChange";

export abstract class ITask {
  abstract name: string;
  abstract size: Size | Unsized;
  abstract states: IStateChange;
  abstract changeState(stateName: string, activity: Activity, activityDescriptor: string) : void
}

export type TaskConstructor = (name: string, size?: Size) => ITask;

class Task extends ITask {
  name: string;
  size: Size | Unsized;
  states: IStateChange;
  private stateBuilder: StateChangeConstructor;

  constructor(name: string, size: Size | Unsized, stateBuilder: StateChangeConstructor) {
    super();
    this.name = name;
    this.size = size;
    this.stateBuilder = stateBuilder;
    this.states = stateBuilder('Created', 'Non-Active', none);
  }

  changeState(stateName: string, activity: Activity, activityDescriptor: string) : void {
    this.states = this.stateBuilder(stateName, activity, activityDescriptor, this.states);
  }
}

function builder(factory: IContainer): TaskConstructor {
  return function (name: string, size: Size | Unsized = 'No Size'): ITask {
    return new Task(name, size, factory.build<IStateChange>(IStateChange));
  };
}

export function taskBuilder(factory: IContainer) {
  return builder(factory);
}
