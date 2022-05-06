import { IContainer } from "@/container";
import { ITask } from "./task";

export abstract class IWalrusBucket {
  abstract getAllTasks(): ITask[];
  abstract add(task: ITask): void;

  // abstract getCompleteTasks();

  // abstract getActiveTasks();

  // abstract getNonActiveTasks();
}

export type WalrusBucketConstructor = () => IWalrusBucket;

class WalrusBucket extends IWalrusBucket {
  private tasks: ITask[] = [];

  constructor() {
    super();
  }

  getAllTasks(): ITask[] {
    return this.tasks;
  }

  add(task: ITask): void {
    this.tasks.push(task);
  }
}

export function walrusBucketBuilder(factory: IContainer): WalrusBucketConstructor {
  return function (): IWalrusBucket {
    return new WalrusBucket();
  };
}
