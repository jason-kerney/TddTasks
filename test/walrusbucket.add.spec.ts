import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { ITask, TaskConstructor } from "@/task";
import { TimeHelper } from "./helpers";
import { IStateChange, StateChangeConstructor } from "@/stateChange";
import { none } from "@/generalTypes";

describe('walrus bucket should', () => {
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

  describe('add', () => {
    it('an existing task', () => {
      let task = taskConstructor('A task');

      sut.add(task);
      let r = sut.getAllTasks();

      expect(r).to.have.lengthOf(1);
    });

    it('state "queued" to existing task when added', () => {
      let task = taskConstructor('A task');

      sut.add(task);
      let r = sut.getAllTasks();

      const currentState = r[0].states;
      expect(currentState.count(), 'Count').to.equal(2);
      expect(currentState.stateName).to.equal('Queued');
      expect(currentState.activityDescriptor).to.equal("team A's queue");
      expect(currentState.activity).to.equal('Non-Active');

      const previousState = currentState.previous as IStateChange;

      expect(previousState).to.not.equal(none);
      expect(previousState.stateName).to.equal('Created');
    });

    it('state "queued" to existing task when added and correctly get bucket name', () => {
      let task = taskConstructor('A task');

      let sut = walrusBucketConstructor("Blue's Clues")
      sut.add(task);
      let r = sut.getAllTasks();

      const currentState = r[0].states;
      expect(currentState.count(), 'Count').to.equal(2);
      expect(currentState.stateName).to.equal('Queued');
      expect(currentState.activityDescriptor).to.equal("Blue's Clues");
      expect(currentState.activity).to.equal('Non-Active');

      const previousState = currentState.previous as IStateChange;

      expect(previousState).to.not.equal(none);
      expect(previousState.stateName).to.equal('Created');
    });

    it('a new task', () => {
      dateHelper.resetAfter(() =>
        sut.addNew('A new task', 'Small')
      );

      const task = taskConstructor('A new task', 'Small');

      let r = sut.getAllTasks();

      expect(r).to.have.lengthOf(1);
      expect(r[0].name).to.equal(task.name);
      expect(r[0].size).to.equal(task.size);
    });

    it('a new task with state of queued', () => {
      sut.addNew('A new task', 'Small');

      let r = sut.getAllTasks();

      const currentState = r[0].states;
      expect(currentState.count(), 'Count').to.equal(2);
      expect(currentState.stateName).to.equal('Queued');
      expect(currentState.activityDescriptor).to.equal("team A's queue");
      expect(currentState.activity).to.equal('Non-Active');

      const previousState = currentState.previous as IStateChange;

      expect(previousState).to.not.equal(none);
      expect(previousState.stateName).to.equal('Created');
    });

    it('a new task with state of queued and correct bucket name', () => {
      let sut = walrusBucketConstructor("Blue's Clues")
      sut.addNew('B a new task', 'Small')
      let r = sut.getAllTasks();

      const currentState = r[0].states;
      expect(currentState.count(), 'Count').to.equal(2);
      expect(currentState.stateName).to.equal('Queued');
      expect(currentState.activityDescriptor).to.equal("Blue's Clues");
      expect(currentState.activity).to.equal('Non-Active');

      const previousState = currentState.previous as IStateChange;

      expect(previousState).to.not.equal(none);
      expect(previousState.stateName).to.equal('Created');
    });

    it('a new task without size', () => {
      dateHelper.resetAfter(() =>
        sut.addNew('A new task')
      );

      const task = taskConstructor('A new task');

      let r = sut.getAllTasks();

      expect(r).to.have.lengthOf(1);
      expect(r[0].name).to.equal(task.name);
      expect(r[0].size).to.equal(task.size);
    });

    it('two existing tasks', () => {
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
});
