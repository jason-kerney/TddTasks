import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { DateHelper } from "./helpers";
import { ITaskFilter, ITaskFilterCriteria, TaskFilterConstructor } from "@/taskFilter";
import { ITask } from "@/task";

class FakeFilter implements ITaskFilter {
  private callback: () => ITask[];

  constructor(callback: () => ITask[]) {
    this.callback = callback;
  }

  getResults(): ITask[] {
    return this.callback();
  }
}

function fakeFilterBuilder(callback: (tasks: ITask[], filter?: ITaskFilterCriteria) => void) : TaskFilterConstructor {
  return function(tasks: ITask[], filter?: ITaskFilterCriteria): ITaskFilter {
    return new FakeFilter(() =>{
      callback(tasks, filter);
      return tasks;
    });
  }
}

describe('Walrus Bucket should', () => {
  let container: IContainer;
  let walrusBucketConstructor: WalrusBucketConstructor;
  let sut: IWalrusBucket;
  let dateHelper: DateHelper;
  let filterCriteria: ITaskFilterCriteria | undefined;
  let filterTasks: ITask[];

  beforeEach(() => {
    container = getContainer();
    container.register(ITaskFilter, (_f) => fakeFilterBuilder((tasks, filter) => {
      filterTasks = tasks;
      filterCriteria = filter;
    }));

    dateHelper = new DateHelper();
    dateHelper.registerWith(container);

    walrusBucketConstructor = container.build(IWalrusBucket);
    sut = walrusBucketConstructor("team A's queue");
  });

  it('be registered with the container', () => {
    expect(sut).to.be.instanceOf(IWalrusBucket);
  });

  it('have the name set', () => {
    expect(sut.name).to.equal("team A's queue");
  });

  it('have the name set even if it is different', () => {
    let bucket = walrusBucketConstructor("Blue's clues")
    expect(bucket.name).to.equal("Blue's clues");
  });

  it('have no tasks when created', () => {
    expect(sut.getAllTasks()).to.have.lengthOf(0);
  });

  it('should filter tasks with empty criteria', () => {
    sut.getAllTasks();

    expect(filterCriteria).to.not.be.undefined;
  });
});
