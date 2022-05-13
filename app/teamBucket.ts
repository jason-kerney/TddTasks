import { IContainer } from "@/container";
import { Size } from "./generalTypes";
import { ITask, TaskConstructor } from "./task";
import { ITaskFilter, ITaskFilterCriteria, TaskFilterConstructor } from "./taskFilter";

export abstract class ITeamBucket {
  abstract get name(): string;
  abstract getAllTasks(filter?: ITaskFilterCriteria): ITask[];
  abstract add(task: ITask): ITask;
  abstract addNew(name: string, size?: Size): ITask;
  abstract getCompleteTasks(filter?: ITaskFilterCriteria) : ITask[];
  abstract getActiveTasks(filter?: ITaskFilterCriteria): ITask[];
  abstract getNonActiveTasks(filter?: ITaskFilterCriteria): ITask[];
}

export type TeamBucketConstructor = (name: string) => ITeamBucket;

class TeamBucket extends ITeamBucket {
  private tasks: ITask[] = [];
  private taskBuilder: TaskConstructor;
  private readonly taskFilterBuilder: TaskFilterConstructor;

  private readonly iName: string;
  get name(): string {
    return this.iName;
  }

  constructor(name: string, taskBuilder: TaskConstructor, taskFilterBuilder) {
    super();
    this.taskBuilder = taskBuilder;
    this.iName = name;
    this.taskFilterBuilder = taskFilterBuilder;
  }

  getAllTasks(filter: ITaskFilterCriteria = {}): ITask[] {
    return this.taskFilterBuilder(this.tasks, filter).getResults();
  }

  add(task: ITask): ITask {
    this.tasks.push(task);
    task.changeState('Queued', 'Non-Active', this.name);
    return task;
  }

  addNew(name: string, size?: Size): ITask {
    return this.add(this.taskBuilder(name, size));
  }

  getCompleteTasks(filter: ITaskFilterCriteria = {}): ITask[] {
    filter.activity = 'Closed';
    return this.getAllTasks(filter);
  }

  getActiveTasks(filter: ITaskFilterCriteria = {}): ITask[] {
    filter.activity = 'Active';
    return this.getAllTasks(filter);
  }

  getNonActiveTasks(filter: ITaskFilterCriteria = {}): ITask[] {
    filter.activity = 'Non-Active';
    return this.getAllTasks(filter);
  }
}

export function teamBucketBuilder(factory: IContainer): TeamBucketConstructor {
  return function (name: string): ITeamBucket {
    return new TeamBucket(name, factory.build(ITask), factory.build(ITaskFilter));
  };
}
