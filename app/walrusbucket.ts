import { IContainer } from "@/container";
import { strictEqual } from "assert";
import { Activity, Size, Unsized } from "./generalTypes";
import { ITask, TaskConstructor } from "./task";

export interface ITaskFilter {
  activity?: Activity
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

function collect<T>(predicate: (item: T) => Boolean) : (items: T[], collector: T[]) => void  {
  return function(items: T[], collector: T[]) {
    items.forEach(item => {
      if(!predicate(item)) {
        return;
      }

      collector.push(item);
    });
  }
}

function collectBasedOnFilter(key: string, filter: ITaskFilter): (items: ITask[], collector: ITask[]) => void {
  let c = collect<ITask>(item => {
    return filter[key] === item[key];
  });

  return function(items: ITask[], collector: ITask[]) {
    c(items, collector);
  }
}

class WalrusBucket extends IWalrusBucket {
  private tasks: ITask[] = [];
  private taskBuilder: TaskConstructor;
  public name: string;

  constructor(name: string, taskBuilder: TaskConstructor) {
    super();
    this.taskBuilder = taskBuilder;
    this.name = name;
  }

  private filterActivity(filter: ITaskFilter, results: ITask[]) {
    if (filter.activity === undefined) {
      return;
    }

    // for (let index = 0; index < this.tasks.length; index++) {
    //   const task = this.tasks[index];
    //   if (task.states.activity !== filter.Activity) {
    //     continue;
    //   }

    //   results.push(task);
    // }

    collectBasedOnFilter('activity', filter)(this.tasks, results);

  }

  getAllTasks(filter?: ITaskFilter): ITask[] {
    if (filter === undefined) {
      return this.tasks;
    }

    let cnt = 0;
    let r: ITask[] = [];

    this.filterActivity(filter, r);

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
