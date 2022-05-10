import { IContainer } from "@/container";
import { strictEqual } from "assert";
import { Activity, Size, Unsized } from "./generalTypes";
import { ITask, TaskConstructor } from "./task";

export interface ITaskFilter {
  activity?: Activity;
  dateLessThenOrEqual?: Date;
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

function collect<T>(predicate: (item: T) => Boolean) : (items: T[], collector: T[]) => T[]  {
  return function(items: T[], collector: T[]) {
    items.forEach(item => {
      if(!predicate(item)) {
        return;
      }

      collector.push(item);
    });

    return collector;
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

  private filterActivity(filter: ITaskFilter, from: ITask[]) : ITask[] {
    if(filter.activity === undefined) {
      return from;
    }

    let results: ITask[] = [];
    return collect<ITask>(item => item.activity === filter.activity)(from, results);
  }

  private filterDateLessThen(filter:ITaskFilter, from: ITask[]) : ITask[] {
    if(filter.dateLessThenOrEqual === undefined) {
      return from;
    }

    let results: ITask[] = [];
    let dt = filter.dateLessThenOrEqual;
    return collect<ITask>(item => item.states.date <= dt)(from, results);
  }

  getAllTasks(filter?: ITaskFilter): ITask[] {
    if (filter === undefined) {
      return this.tasks;
    }

    let r: ITask[] = this.filterActivity(filter, this.tasks);
    let rc = r.length;
    r = this.filterDateLessThen(filter, r);

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
