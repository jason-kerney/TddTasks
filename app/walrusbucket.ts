import { IContainer } from "@/container";
import { Activity, Size } from "./generalTypes";
import { ITask, TaskConstructor } from "./task";

export interface ITaskFilter {
  activity?: Activity;
  dateLessThenOrEqual?: Date;
  dateLessThen?: Date;
  dateGraterThenOrEqual?: Date;
  dateGraterThen?: Date;
}

function getTaskValue(task: ITask, filterKey: string): any {
  switch (filterKey) {
    case 'activity':
      return task.activity;
    case 'dateLessThenOrEqual':
    case 'dateLessThen':
    case 'dateGraterThenOrEqual':
    case 'dateGraterThen':
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

function chain(filter: ITaskFilter, ...funcs: ((filter: ITaskFilter, r: ITask[]) => ITask[])[]): (tasks: ITask[]) => ITask[] {
  return function(tasks: ITask[]) : ITask[] {
    let last: ITask[] = tasks;
    funcs.forEach(func => {
      last = func(filter, last);
    });

    return last;
  }
}

class WalrusBucket extends IWalrusBucket {
  private tasks: ITask[] = [];
  private taskBuilder: TaskConstructor;
  public name: string;
  private readonly filterActivity = filterBy<Activity>('activity', (filter, value) => filter === value)
  private readonly filterDateLessThenOrEqual = filterBy<Date>('dateLessThenOrEqual', (filter, value) => value <= filter);
  private readonly filterDateLessThen = filterBy<Date>('dateLessThen', (filter, value) => value < filter);
  private readonly filterDateGreaterThenOrEqual = filterBy<Date>('dateGraterThenOrEqual', (filter, value) => value >= filter);
  private readonly filterDateGreaterThen = filterBy<Date>('dateGraterThen', (filterValue, value) => value > filterValue);

  constructor(name: string, taskBuilder: TaskConstructor) {
    super();
    this.taskBuilder = taskBuilder;
    this.name = name;
  }

  getAllTasks(filter?: ITaskFilter): ITask[] {
    if (filter === undefined) {
      return this.tasks;
    }

    let r = chain(
      filter,
      this.filterActivity,
      this.filterDateLessThenOrEqual,
      this.filterDateLessThen,
      this.filterDateGreaterThenOrEqual,
      this.filterDateGreaterThen,
    )(this.tasks);
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
