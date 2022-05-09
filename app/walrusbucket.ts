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
  abstract add(task: ITask): ITask;
  abstract addNew(name: string, size?: Size): ITask;

  // abstract getCompleteTasks();

  // abstract getActiveTasks();

  // abstract getNonActiveTasks();
}

export type WalrusBucketConstructor = (name: string) => IWalrusBucket;

class WalrusBucket extends IWalrusBucket {
  private tasks: ITask[] = [];
  private taskBuilder: TaskConstructor;
  public name: string;

  constructor(name: string, taskBuilder: TaskConstructor) {
    super();
    this.taskBuilder = taskBuilder;
    this.name = name;
  }

  getAllTasks(filter?: ITaskFilter): ITask[] {
    if (filter === undefined) {
      return this.tasks;
    }

    let cnt = 0;
    let r : ITask[] = [];

    for (let index = 0; index < this.tasks.length; index++) {
      const task = this.tasks[index];
      if (task.states.activity === 'Active') {
        r.push(task);
      }
    }

    return r;
  }

  add(task: ITask): ITask {
    this.tasks.push(task);
    task.changeState('Queued', 'Non-Active', this.name);
    return task;
  }

  addNew(name: string, size?: Size): ITask {
    return this.add(this.taskBuilder(name, size));
  }
}

export function walrusBucketBuilder(factory: IContainer): WalrusBucketConstructor {
  return function (name: string): IWalrusBucket {
    return new WalrusBucket(name, factory.build(ITask));
  };
}
