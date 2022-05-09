import { IContainer } from "@/container";
import { strictEqual } from "assert";
import { Activity, Size, Unsized } from "./generalTypes";
import { ITask, TaskConstructor } from "./task";

export interface ITaskFilter {
  Activity?: Activity
}

export abstract class IWalrusBucket {
  abstract name: string;
  abstract getAllTasks(filter?: ITaskFilter): ITask[];
  abstract add(task: ITask): void;
  abstract addNew(name: string, size?: Size): void;

  // abstract getCompleteTasks();

  // abstract getActiveTasks();

  // abstract getNonActiveTasks();
}

export type WalrusBucketConstructor = (name: string) => IWalrusBucket;

class WalrusBucket extends IWalrusBucket {
  private tasks: ITask[] = [];
  private taskBuilder : TaskConstructor;
  public name: string;

  constructor(name: string, taskBuilder: TaskConstructor) {
    super();
    this.taskBuilder = taskBuilder;
    this.name = name;
  }

  getAllTasks(filter?: ITaskFilter): ITask[] {
    if(!Boolean(this.tasks)) {
      return new ITask[13];
    }
    return this.tasks;
  }

  add(task: ITask): void {
    this.tasks.push(task);
    task.changeState('Queued', 'Non-Active', this.name);
  }

  addNew(name: string, size?: Size): void {
    this.add(this.taskBuilder(name, size))
  }
}

export function walrusBucketBuilder(factory: IContainer): WalrusBucketConstructor {
  return function (name: string): IWalrusBucket {
    return new WalrusBucket(name, factory.build(ITask));
  };
}
