import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { ITeamBucket, TeamBucketConstructor } from "@/teamBucket";
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

describe('Team Bucket should', () => {
  let container: IContainer;
  let teamBucketConstructor: TeamBucketConstructor;
  let sut: ITeamBucket;
  let filterCriteria: ITaskFilterCriteria | undefined;
  let expectedTasks: ITask[];
  let receivedTasks: ITask[] | undefined;

  beforeEach(() => {
    expectedTasks = [];
    receivedTasks = undefined;
    filterCriteria = undefined;

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

    teamBucketConstructor = container.build(ITeamBucket);
    sut = teamBucketConstructor("team A's queue");
  });

  it('be registered with the container', () => {
    expect(sut).to.be.instanceOf(ITeamBucket);
  });

  it('have the name set', () => {
    expect(sut.name).to.equal("team A's queue");
  });

  it('have the name set even if it is different', () => {
    let bucket = teamBucketConstructor("Blue's clues")
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

  it('getActiveTasks', () => {
    const expected: ITaskFilterCriteria = { activity: 'Active' };
    let r = sut.getActiveTasks();

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getActiveTasks with criteria', () => {
    const expected: ITaskFilterCriteria = { activity: 'Active', dateGraterThen: new Date('01-JAN-2021') };
    let r = sut.getActiveTasks({ dateGraterThen: new Date('01-JAN-2021') });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getActiveTasks with wrong activity', () => {
    const expected: ITaskFilterCriteria = { activity: 'Active' };
    let r = sut.getActiveTasks({ activity: 'Non-Active' });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getNonActiveTasks', () => {
    const expected: ITaskFilterCriteria = { activity: 'Non-Active' };
    let r = sut.getNonActiveTasks();

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getNonActiveTasks with criteria', () => {
    const expected: ITaskFilterCriteria = { activity: 'Non-Active', dateGraterThen: new Date('01-JAN-2021') };
    let r = sut.getNonActiveTasks({ dateGraterThen: new Date('01-JAN-2021') });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getNonActiveTasks with wrong activity', () => {
    const expected: ITaskFilterCriteria = { activity: 'Non-Active' };
    let r = sut.getNonActiveTasks({ activity: 'Closed' });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });
});
