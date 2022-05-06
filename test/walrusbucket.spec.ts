import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { ITask, TaskConstructor } from "@/task";
import { TimeHelper } from "./helpers";

describe('Walrus Bucket should', () => {
  let container: IContainer;
  let walrusBucketConstructor: WalrusBucketConstructor;
  let taskConstructor: TaskConstructor;
  let sut: IWalrusBucket;
  let dateHelper: TimeHelper;

  beforeEach(() => {
    container = getContainer();

    dateHelper = new TimeHelper();
    dateHelper.registerWith(container);

    taskConstructor = container.build(ITask);
    walrusBucketConstructor = container.build(IWalrusBucket);
    sut = walrusBucketConstructor();
  });

  it('be registered with the container', () => {
    expect(sut).to.be.instanceOf(IWalrusBucket);
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
    expect(r[0].name).to.deep.equal(task.name);
    expect(r[0].size).to.deep.equal(task.size);
    expect(r[0].states).to.deep.equal(task.states);
  });

  it('allow for a new task to be added without size', () => {
    dateHelper.resetAfter(() =>
      sut.addNew('A new task')
    );

    const task = taskConstructor('A new task');

    let r = sut.getAllTasks();

    expect(r).to.have.lengthOf(1);
    expect(r[0].name).to.deep.equal(task.name);
    expect(r[0].size).to.deep.equal(task.size);
    expect(r[0].states).to.deep.equal(task.states);
  });
});
