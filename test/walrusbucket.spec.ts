import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { ITask, TaskConstructor } from "@/task";
import { TimeHelper } from "./helpers";
import { IStateChange, StateChangeConstructor } from "@/stateChange";

describe('Walrus Bucket should', () => {
  let container: IContainer;
  let walrusBucketConstructor: WalrusBucketConstructor;
  let taskConstructor: TaskConstructor;
  let stateConstructor: StateChangeConstructor;
  let sut: IWalrusBucket;
  let dateHelper: TimeHelper;

  beforeEach(() => {
    container = getContainer();

    dateHelper = new TimeHelper();
    dateHelper.registerWith(container);

    taskConstructor = container.build(ITask);
    stateConstructor = container.build(IStateChange)
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

  it('allow for an existing task to be added', () => {
    let task = taskConstructor('A task');

    sut.add(task);
    let r = sut.getAllTasks();

    expect(r).to.have.lengthOf(1);
    expect(r[0]).to.deep.equal(task);
  });

  it('allow for a new task to be added', () => {
    dateHelper.resetAfter(() =>
      sut.addNew('A new task', 'Small')
    );

    const task = taskConstructor('A new task', 'Small');

    let r = sut.getAllTasks();

    expect(r).to.have.lengthOf(1);
    expect(r[0].name).to.equal(task.name);
    expect(r[0].size).to.equal(task.size);
  });

  it('allow for a new task to be added without size', () => {
    dateHelper.resetAfter(() =>
      sut.addNew('A new task')
    );

    const task = taskConstructor('A new task');

    let r = sut.getAllTasks();

    expect(r).to.have.lengthOf(1);
    expect(r[0].name).to.equal(task.name);
    expect(r[0].size).to.equal(task.size);
  });

  it('allow for the adding of two existing tasks', () => {
    const task1 = taskConstructor('first task');
    const task2 = taskConstructor('second task');

    sut.add(task1);
    sut.add(task2);

    const r = sut.getAllTasks();

    expect(r).to.have.lengthOf(2);

    expect(r[0].name).to.equal(task1.name);
    expect(r[1].name).to.equal(task2.name);
    expect(task1.name).to.not.equal(task2.name);
  });
});
