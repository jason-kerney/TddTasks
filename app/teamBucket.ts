import { IContainer } from "@/container";
import { Size } from "./generalTypes";
import { MapType } from "./map";
import { ITask, TaskConstructor } from "./task";
import { ITaskFilter, ITaskFilterCriteria, TaskFilterConstructor } from "./taskFilter";

export abstract class ITeamBucket {
  abstract get name(): string;
  abstract getAllTasks(filter?: ITaskFilterCriteria): ITask[];
  abstract add(task: ITask): ITask;
  abstract addNew(name: string, size?: Size): ITask;
  abstract getCompleteTasks(filter?: ITaskFilterCriteria): ITask[];
  abstract getActiveTasks(filter?: ITaskFilterCriteria): ITask[];
  abstract getNonActiveTasks(filter?: ITaskFilterCriteria): ITask[];
}

export type TeamBucketConstructor = (name: string) => ITeamBucket;

interface IQueue {
  get name(): string;
  tasks: ITask[];
}

class TeamBucket extends ITeamBucket {
  private tasks: ITask[] = [];
  private taskBuilder: TaskConstructor;
  private readonly taskFilterBuilder: TaskFilterConstructor;
  private readonly active: IQueue = { name: 'active', tasks: [] };
  private readonly nonActive: IQueue = { name: 'non-active', tasks: [] };
  private readonly closed: IQueue = { name: 'closed', tasks: [] };
  private readonly currentQueue: MapType<IQueue> = {};

  private readonly iName: string;
  get name(): string {
    return this.iName;
  }

  constructor(name: string, taskBuilder: TaskConstructor, factory: IContainer) {
    super();
    this.taskBuilder = taskBuilder;
    this.iName = name;
    this.taskFilterBuilder = factory.build(ITaskFilter);
  }

  private setToQueue(task: ITask, queue: IQueue): IQueue {
    let th: TeamBucket = this;
    if (!queue.tasks.includes(task)) {
      queue.tasks.push(task);
    }

    th.currentQueue[task.key] = queue;
    return queue;
  }

  private getQueue(task: ITask): IQueue {
    let queue = this.currentQueue[task.key];
    if (queue !== undefined) {
      return queue;
    }

    if (task.activity === 'Active') return this.setToQueue(task, this.active);

    if (task.activity === 'Non-Active') return this.setToQueue(task, this.nonActive);

    return this.setToQueue(task, this.closed);
  }

  private buildTaskCallback(th: TeamBucket): (task: ITask) => void {
    return function (task: ITask): void {
      let queue = th.getQueue(task);
      let index = queue.tasks.indexOf(task);

      delete th.currentQueue[task.key];
      queue.tasks.splice(index, 1);

      th.getQueue(task);
    }
  }

  private getFilteredTasks(tasks: ITask[], filter: ITaskFilterCriteria = {}): ITask[] {
    return this.taskFilterBuilder(tasks, filter).getResults()
  }

  getAllTasks(filter?: ITaskFilterCriteria): ITask[] {
    return this.getFilteredTasks(this.tasks, filter)
  }

  add(task: ITask): ITask {
    task.registerCallback(this.buildTaskCallback(this));
    this.tasks.push(task);
    task.changeState('Queued', 'Non-Active', this.name);
    return task;
  }

  addNew(name: string, size?: Size): ITask {
    return this.add(this.taskBuilder(name, size, this.buildTaskCallback(this)));
  }

  getCompleteTasks(filter: ITaskFilterCriteria = {}): ITask[] {
    delete filter.activity;
    return this.getFilteredTasks(this.closed.tasks, filter);
  }

  getActiveTasks(filter: ITaskFilterCriteria = {}): ITask[] {
    delete filter.activity;
    return this.getFilteredTasks(this.active.tasks, filter);
  }

  getNonActiveTasks(filter: ITaskFilterCriteria = {}): ITask[] {
    delete filter.activity;
    return this.getFilteredTasks(this.nonActive.tasks, filter);
  }
}

export function teamBucketBuilder(factory: IContainer): TeamBucketConstructor {
  return function (name: string): ITeamBucket {
    return new TeamBucket(name, factory.build(ITask), factory);
  };
}
