import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { ITeamBucket, TeamBucketConstructor } from "@/teamBucket";
import { addNRandomTasks, cleanFakeSize, DateHelper, fakeSize, fakeString } from "./helpers";
import { ITaskFilter, ITaskFilterCriteria, TaskFilterConstructor } from "@/taskFilter";
import { ITask, TaskConstructor } from "@/task";
import { IWriter } from "@/outputWritter";

class FakeFilter implements ITaskFilter {
  private callback: () => ITask[];
  private iFilter: ITaskFilterCriteria;

  constructor(callback: () => ITask[], filter: ITaskFilterCriteria = {}) {
    this.callback = callback;
    this.iFilter = filter;
  }

  getResults(): ITask[] {
    return this.callback();
  }

  get filterCriteria(): ITaskFilterCriteria {
    return this.iFilter;
  }
}

function fakeFilterBuilder(callback: (tasks: ITask[], filter?: ITaskFilterCriteria) => ITask[]): TaskFilterConstructor {
  return function (tasks: ITask[], filter?: ITaskFilterCriteria): ITaskFilter {
    return new FakeFilter(() => {
      return callback(tasks, filter);
    }, filter);
  }
}

describe('Team Bucket should', () => {
  let container: IContainer;
  let teamBucketConstructor: TeamBucketConstructor;
  let sut: ITeamBucket;
  let filterCriteria: ITaskFilterCriteria | undefined;
  let expectedTasks: ITask[];
  let receivedTasks: ITask[] | undefined;
  let writer: IWriter;

  beforeEach(() => {
    expectedTasks = [];
    receivedTasks = undefined;
    filterCriteria = undefined;

    container = getContainer();
    writer = container.build(IWriter)();

    container.register(ITaskFilter, (_f) => fakeFilterBuilder((tasks, filter) => {
      filterCriteria = filter;
      receivedTasks = tasks;
      return expectedTasks;
    }));

    container.register(IWriter, () => () => writer);

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

  it('have no tasks when created and getAllTasks filtered tasks with empty criteria', () => {
    sut.getAllTasks();

    expect(filterCriteria).to.not.be.undefined;
  });

  it('getAllTasks filtered by specified criteria', () => {
    const expected: ITaskFilterCriteria = { activity: 'Active' };
    let name = fakeString();
    let size = fakeSize();
    sut.addNew(name, size);

    let r = sut.getAllTasks(expected);

    expect(filterCriteria).to.equal(expected);
    expect(r).to.equal(expectedTasks);
    expect(receivedTasks).to.have.lengthOf(1);
    expect(receivedTasks).to.not.be.undefined;
    if (receivedTasks === undefined) return;
    expect(receivedTasks[0].name).to.equal(name);
    expect(receivedTasks[0].size).to.equal(cleanFakeSize(size));
  });

  it('getCompleteTasks', () => {
    const expected: ITaskFilterCriteria = { activity: 'Closed' };
    let task = sut.addNew(fakeString(), fakeSize());
    task.changeState('changed', 'Closed');

    let r = sut.getCompleteTasks();

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
    expect(receivedTasks).to.not.be.undefined;
    if (receivedTasks === undefined) return;
    expect(receivedTasks).to.have.lengthOf(1);
    expect(receivedTasks[0]).to.deep.equal(task);
  });

  it('getCompleteTasks when some are not completed', () => {
    const expected: ITaskFilterCriteria = { activity: 'Closed' };

    let completedTask = sut.addNew(fakeString(), fakeSize());
    completedTask.changeState('changed', 'Closed');

    let otherTask = sut.addNew(fakeString(), fakeSize());

    let r = sut.getCompleteTasks();

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
    expect(receivedTasks).to.not.be.undefined;
    if (expectedTasks === undefined) return;
    expect(receivedTasks).to.have.lengthOf(1);
    expect(receivedTasks).to.contain(completedTask);
    expect(receivedTasks).to.not.contain(otherTask);
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
    const expected: ITaskFilterCriteria = { };

    let task = sut.addNew(fakeString(), fakeSize());
    task.changeState('becoming active', 'Active');
    let r = sut.getActiveTasks();

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
    expect(receivedTasks).to.not.be.undefined;
    if (receivedTasks === undefined) return;
    expect(receivedTasks).to.have.lengthOf(1);
    expect(receivedTasks[0]).to.deep.equal(task);
  });

  it('getActiveTasks when some tasks are non active', () => {
    const expected: ITaskFilterCriteria = { };

    let activeTask = sut.addNew(fakeString(), fakeSize());
    activeTask.changeState('becoming active', 'Active');

    let otherTask = sut.addNew(fakeString(), fakeSize());

    let r = sut.getActiveTasks();

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
    expect(receivedTasks).to.not.be.undefined;
    if (receivedTasks === undefined) return;
    expect(receivedTasks).to.have.lengthOf(1);
    expect(receivedTasks).to.contain(activeTask);
    expect(receivedTasks).to.not.contain(otherTask);
  });

  it('getActiveTasks with criteria', () => {
    const expected: ITaskFilterCriteria = { dateGraterThen: new Date('01-JAN-2021') };
    let r = sut.getActiveTasks({ dateGraterThen: new Date('01-JAN-2021') });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getActiveTasks with wrong activity', () => {
    const expected: ITaskFilterCriteria = { };
    let r = sut.getActiveTasks({ activity: 'Non-Active' });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getNonActiveTasks', () => {
    const expected: ITaskFilterCriteria = { };
    let task = sut.addNew(fakeString(), fakeSize());

    let r = sut.getNonActiveTasks();

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
    expect(receivedTasks).to.not.be.undefined;
    if (receivedTasks === undefined) return;
    expect(receivedTasks).to.have.lengthOf(1);
    expect(receivedTasks[0]).to.deep.equal(task);
  });

  it('getNonActiveTasks when there are active tasks', () => {
    const expected: ITaskFilterCriteria = { };

    let nonActiveTask = writer.increaseIndent(() => sut.addNew(fakeString(), fakeSize()));
    let activeTask = sut.addNew(fakeString(), fakeSize());
    activeTask.changeState('become active', 'Active');

    let r = sut.getNonActiveTasks();

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
    expect(receivedTasks).to.not.be.undefined;
    if (receivedTasks === undefined) return;
    expect(receivedTasks).to.have.lengthOf(1);
    expect(receivedTasks).to.contain(nonActiveTask);
    expect(receivedTasks).to.not.contain(activeTask);
  });

  it('getNonActiveTasks with criteria', () => {
    const expected: ITaskFilterCriteria = { dateGraterThen: new Date('01-JAN-2021') };
    let r = sut.getNonActiveTasks({ dateGraterThen: new Date('01-JAN-2021') });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });

  it('getNonActiveTasks with wrong activity', () => {
    const expected: ITaskFilterCriteria = { };
    let r = sut.getNonActiveTasks({ activity: 'Closed' });

    expect(filterCriteria).to.deep.equal(expected);
    expect(r).to.equal(expectedTasks);
  });
});
