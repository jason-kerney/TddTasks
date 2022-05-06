import { IContainer } from "./container";
import { Activity, IStateChange, ITask, none, Size, StateChangeConstructor, TaskConstructor, Unsized } from "./generalTypes";

class Task extends ITask {
  name: string;
  size: Size | Unsized;
  states: IStateChange;
  currentState: IStateChange;
  private stateBuilder: StateChangeConstructor;

  constructor(name: string, size: Size | Unsized, stateBuilder: StateChangeConstructor) {
    super();
    this.name = name;
    this.size = size;
    this.stateBuilder = stateBuilder;
    this.states = stateBuilder('Created', 'Non-Active', none);
    this.currentState = this.states;
  }

  changeState(stateName: string, activity: Activity, activityDescriptor: string) : void {
    this.states = this.stateBuilder(stateName, activity, activityDescriptor, this.states);

    this.currentState = this.states.getLast();
  }
}

function builder(factory: IContainer): TaskConstructor {
  return function (name: string, size: Size | Unsized = 'No Size'): ITask {
    return new Task(name, size, factory.build<IStateChange>('IStateChange'));
  };
}

export function taskBuilder(factory: IContainer) {
  return builder(factory);
}
