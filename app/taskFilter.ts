import { IContainer } from "./container";
import { Activity } from "./generalTypes";
import { ITask } from "./task";

export interface ITaskFilterCriteria {
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
      throw new Error(`"${filterKey}" is not part of ITaskFilterCriteria`);
  }
}

function filterBy<T>(key: string, predicate: (filter: T, value: T) => Boolean): (filter: ITaskFilterCriteria, tasks: ITask[]) => ITask[] {
  return function (filter: ITaskFilterCriteria, tasks: ITask[]): ITask[] {
    let filterValue = filter[key];
    if (filterValue === undefined) {
      return tasks;
    }

    let r: ITask[] = [];
    tasks.forEach(task => {
      if (!predicate(filterValue, getTaskValue(task, key))) return;
      r.push(task);
    });

    return r;
  };
}

function chain(filter: ITaskFilterCriteria, ...funcs: ((filter: ITaskFilterCriteria, r: ITask[]) => ITask[])[]): (tasks: ITask[]) => ITask[] {
  return function (tasks: ITask[]): ITask[] {
    let last: ITask[] = tasks;
    funcs.forEach(func => {
      last = func(filter, last);
    });

    return last;
  }
}

export abstract class ITaskFilter {
  abstract getResults(): ITask[];
  abstract get filterCriteria(): ITaskFilterCriteria;
}

class TaskFilter extends ITaskFilter {
  private readonly tasks: ITask[];
  private results?: ITask[];
  private iFilter: ITaskFilterCriteria;
  private readonly filterAll: (tasks: ITask[]) => ITask[];

  private readonly filterActivity = filterBy<Activity>('activity', (filter, value) => filter === value)
  private readonly filterDateLessThenOrEqual = filterBy<Date>('dateLessThenOrEqual', (filter, value) => value <= filter);
  private readonly filterDateLessThen = filterBy<Date>('dateLessThen', (filter, value) => value < filter);
  private readonly filterDateGreaterThenOrEqual = filterBy<Date>('dateGraterThenOrEqual', (filter, value) => value >= filter);
  private readonly filterDateGreaterThen = filterBy<Date>('dateGraterThen', (filterValue, value) => value > filterValue);

  get filterCriteria(): ITaskFilterCriteria {
    let r : ITaskFilterCriteria = {}

    if(this.iFilter.activity) r.activity = this.iFilter.activity;
    if(this.iFilter.dateGraterThen) r.dateGraterThen = new Date(this.iFilter.dateGraterThen);
    if(this.iFilter.dateGraterThenOrEqual) r.dateGraterThenOrEqual = new Date(this.iFilter.dateGraterThenOrEqual);
    if(this.iFilter.dateLessThen) r.dateLessThen = new Date(this.iFilter.dateLessThen);
    if(this.iFilter.dateLessThenOrEqual) r.dateLessThenOrEqual = new Date(this.iFilter.dateLessThenOrEqual);

    return r;
  }

  constructor(tasks: ITask[], filter: ITaskFilterCriteria = {}) {
    super();
    this.tasks = tasks;
    this.iFilter = filter;

    this.filterAll = chain(
      filter,
      this.filterActivity,
      this.filterDateLessThenOrEqual,
      this.filterDateLessThen,
      this.filterDateGreaterThenOrEqual,
      this.filterDateGreaterThen,
    );
  }

  getResults(): ITask[] {
    if (this.results !== undefined) return this.results;

    this.results = this.filterAll(this.tasks);
    return this.results;
  }
}

export type TaskFilterConstructor = (tasks: ITask[], filter?: ITaskFilterCriteria) => ITaskFilter

export function taskFilterBuilder(_factory: IContainer): TaskFilterConstructor {
  return function (tasks: ITask[], filter?: ITaskFilterCriteria): ITaskFilter {
    return new TaskFilter(tasks, filter);
  };
}
