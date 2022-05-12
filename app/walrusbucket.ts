import { IContainer } from "@/container";
import { Size } from "./generalTypes";
import { ITask, TaskConstructor } from "./task";
import { ITaskFilter, ITaskFilterCriteria, TaskFilterConstructor } from "./taskFilter";

export abstract class IWalrusBucket {
  abstract readonly name: string;
  abstract getAllTasks(filter?: ITaskFilterCriteria): ITask[];
  abstract add(task: ITask): ITask;
  abstract addNew(name: string, size?: Size): ITask;
  abstract getCompleteTasks(filter?: ITaskFilterCriteria) : ITask[];
  abstract getActiveTasks(filter?: ITaskFilterCriteria): ITask[];

  // abstract getNonActiveTasks();
}

export type WalrusBucketConstructor = (name: string) => IWalrusBucket;


class WalrusBucket extends IWalrusBucket {
  private tasks: ITask[] = [];
  private taskBuilder: TaskConstructor;
  public readonly name: string;
  private readonly taskFilterBuilder: TaskFilterConstructor;

  constructor(name: string, taskBuilder: TaskConstructor, taskFilterBuilder) {
    super();
    this.taskBuilder = taskBuilder;
    this.name = name;
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
}

export function walrusBucketBuilder(factory: IContainer): WalrusBucketConstructor {
  return function (name: string): IWalrusBucket {
    return new WalrusBucket(name, factory.build(ITask), factory.build(ITaskFilter));
  };
}
