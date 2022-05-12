import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { addNRandomTasks, DateHelper } from "./helpers";
import { ITaskFilter, ITaskFilterCriteria, TaskFilterConstructor } from "@/taskFilter";
import { ITask, TaskConstructor } from "@/task";

class FakeFilter implements ITaskFilter {
  private callback: () => ITask[];

  constructor(callback: () => ITask[]) {
    this.callback = callback;
  }

  getResults(): ITask[] {
    return this.callback();
  }
}

function fakeFilterBuilder(callback: (tasks: ITask[], filter?: ITaskFilterCriteria) => ITask[]): TaskFilterConstructor {
  return function (tasks: ITask[], filter?: ITaskFilterCriteria): ITaskFilter {
    return new FakeFilter(() => {
      return callback(tasks, filter);
    });
  }
}

describe('Walrus Bucket should', () => {
  let container: IContainer;
  let walrusBucketConstructor: WalrusBucketConstructor;
  let sut: IWalrusBucket;
  let filterCriteria: ITaskFilterCriteria | undefined;
  let expectedTasks: ITask[];
  let receivedTasks: ITask[];

  beforeEach(() => {
    expectedTasks = [];
    container = getContainer();
    container.register(ITaskFilter, (_f) => fakeFilterBuilder((tasks, filter) => {
      filterCriteria = filter;
      receivedTasks = tasks;
      return expectedTasks;
    }));

    let dateHelper = new DateHelper();
    dateHelper.registerWith(container);


    let taskBuilder: TaskConstructor = container.build(ITask);
    addNRandomTasks(expectedTasks, taskBuilder, 20);

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
    sut.getAllTasks();
    expect(receivedTasks).to.have.lengthOf(0);
  });

  it('getAllTasks filtered tasks with empty criteria', () => {
    sut.getAllTasks();

    expect(filterCriteria).to.not.be.undefined;
  });

  it('getAllTasks filtered by specified criteria', () => {
    const expected: ITaskFilterCriteria = { activity: 'Active' };

    let r = sut.getAllTasks(expected);

    expect(filterCriteria).to.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getCompleteTasks', () => {
    const expected: ITaskFilterCriteria = { activity: 'Closed' };
    let r = sut.getCompleteTasks();

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getCompleteTasks with criteria', () => {
    const expected: ITaskFilterCriteria = { activity: 'Closed', dateGraterThen: new Date('01-JAN-2021') };
    let r = sut.getCompleteTasks({ dateGraterThen: new Date('01-JAN-2021') });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getCompleteTasks with wrong activity', () => {
    const expected: ITaskFilterCriteria = { activity: 'Closed' };
    let r = sut.getCompleteTasks({ activity: 'Active' });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });
});
