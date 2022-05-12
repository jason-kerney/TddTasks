import { IContainer } from "@/container";
import { Activity, Size } from "./generalTypes";
import { ITask, TaskConstructor } from "./task";

export interface ITaskFilter {
  activity?: Activity;
  dateLessThenOrEqual?: Date;
  dateLessThen?: Date;
}

function getTaskValue(task: ITask, filterKey: string): any {
  switch (filterKey) {
    case 'activity':
      return task.activity;
    case 'dateLessThenOrEqual':
    case 'dateLessThen':
      return task.states.date;
    default:
      throw new Error(`"${filterKey}" is not part of ITaskFilter`);
  }
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

function filterBy<T>(key: string, predicate: (filter: T, value: T) => Boolean): (filter: ITaskFilter, tasks: ITask[]) => ITask[] {
  return function (filter: ITaskFilter, tasks: ITask[]): ITask[] {
    let filterValue = filter[key];
    if(filterValue === undefined) {
      return tasks;
    }

    let r: ITask[] = [];
    tasks.forEach(task => {
      if(!predicate(filterValue, getTaskValue(task, key))) return;
      r.push(task);
    });

    return r;
  };
}

class WalrusBucket extends IWalrusBucket {
  private tasks: ITask[] = [];
  private taskBuilder: TaskConstructor;
  public name: string;
  private readonly filterActivity = filterBy<Activity>('activity', (filter, value) => filter === value)
  private readonly filterDateLessThenOrEqual = filterBy<Date>('dateLessThenOrEqual', (filter, value) => value <= filter);

  constructor(name: string, taskBuilder: TaskConstructor) {
    super();
    this.taskBuilder = taskBuilder;
    this.name = name;
  }

  private filterDateLessThen(filter:ITaskFilter, from: ITask[]) : ITask[] {
    if(filter.dateLessThen === undefined) {
      return from;
    }

    let results: ITask[] = [];
    let dt = filter.dateLessThen;
    return collect<ITask>(item => {
      return item.states.date < dt;
    })(from, results);
  }

  getAllTasks(filter?: ITaskFilter): ITask[] {
    if (filter === undefined) {
      return this.tasks;
    }

    let r: ITask[] = this.filterActivity(filter, this.tasks);
    r = this.filterDateLessThenOrEqual(filter, r);
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
