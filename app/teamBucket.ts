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

class TeamBucket extends ITeamBucket {
  private tasks: ITask[] = [];
  private taskBuilder: TaskConstructor;
  private readonly taskFilterBuilder: TaskFilterConstructor;
  private readonly active: ITask[] = [];
  private readonly nonActive: ITask[] = [];
  private readonly closed: ITask[] = [];
  private readonly currentQueue: MapType<ITask[]> = {};

  private readonly iName: string;
  get name(): string {
    return this.iName;
  }

  constructor(name: string, taskBuilder: TaskConstructor, taskFilterBuilder: TaskFilterConstructor) {
    super();
    this.taskBuilder = taskBuilder;
    this.iName = name;
    this.taskFilterBuilder = taskFilterBuilder;
  }

  private getQueue(task: ITask): ITask[] {
    if (this.currentQueue[task.key] !== undefined) {
      return this.currentQueue[task.key] as ITask[];
    }

    if (task.activity === 'Active') {
      this.active.push(task);
      this.currentQueue[task.key] = this.active;
      return this.active
    };

    if (task.activity === 'Non-Active') {
      this.nonActive.push(task);
      this.currentQueue[task.key] = this.nonActive;
      return this.nonActive;
    };

    this.closed.push(task);
    this.currentQueue[task.key] = this.closed;
    return this.closed;
  }

  private buildTaskCallback(th: TeamBucket): (task: ITask) => void {
    return function (task: ITask): void {
      let queue = th.getQueue(task);
      let index = queue.indexOf(task);

      delete th.currentQueue[task.key];
      queue.splice(index + 1, 1);

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
    filter.activity = 'Closed';
    return this.getFilteredTasks(this.closed, filter);
  }

  getActiveTasks(filter: ITaskFilterCriteria = {}): ITask[] {
    filter.activity = 'Active';
    return this.getFilteredTasks(this.active, filter);
  }

  getNonActiveTasks(filter: ITaskFilterCriteria = {}): ITask[] {
    filter.activity = 'Non-Active';
    return this.getFilteredTasks(this.nonActive, filter);
  }
}

export function teamBucketBuilder(factory: IContainer): TeamBucketConstructor {
  return function (name: string): ITeamBucket {
    return new TeamBucket(name, factory.build(ITask), factory.build(ITaskFilter));
  };
}
