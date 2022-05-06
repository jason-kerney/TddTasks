import { IContainer } from "@/container";
import { strictEqual } from "assert";
import { Size, Unsized } from "./generalTypes";
import { ITask, TaskConstructor } from "./task";

export abstract class IWalrusBucket {
  abstract getAllTasks(): ITask[];
  abstract add(task: ITask): void;
  abstract addNew(name: string, size?: Size): void;

  // abstract getCompleteTasks();

  // abstract getActiveTasks();

  // abstract getNonActiveTasks();
}

export type WalrusBucketConstructor = () => IWalrusBucket;

class WalrusBucket extends IWalrusBucket {
  private tasks: ITask[] = [];
  private taskBuilder : TaskConstructor;

  constructor(taskBuilder: TaskConstructor) {
    super();
    this.taskBuilder = taskBuilder;
  }

  getAllTasks(): ITask[] {
    return this.tasks;
  }

  add(task: ITask): void {
    this.tasks.push(task);
  }

  addNew(name: string, size?: Size): void {
    this.add(this.taskBuilder(name, size))
  }
}

export function walrusBucketBuilder(factory: IContainer): WalrusBucketConstructor {
  return function (): IWalrusBucket {
    return new WalrusBucket(factory.build(ITask));
  };
}
