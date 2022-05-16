import { getContainer, IContainer } from "@/container";
import { none } from "@/generalTypes";
import { IStateChange, StateChangeConstructor } from "@/stateChange";
import { ITask, TaskConstructor } from "@/task";
import { expect } from "chai";
import { clean, DateHelper } from "./helpers";

describe('Task should', () => {
  let container: IContainer;
  let dateHelper: DateHelper;
  let builder: TaskConstructor;
  let stateBuilder: StateChangeConstructor;
  let initialState: IStateChange;

  beforeEach(() => {
    container = getContainer();
    dateHelper = new DateHelper();
    dateHelper.registerWith(container);

    stateBuilder = container.build(IStateChange) as StateChangeConstructor;

    initialState =
      dateHelper.resetAfter(() =>
        stateBuilder('Created', 'Non-Active', none)
      );

    builder = container.build(ITask) as TaskConstructor;
  });

  it('be registered with the container', () => {
    const result = builder('test task');

    expect(result).to.be.instanceOf(ITask);
  });

  it('build a task with the given name', () => {
    const state =
      dateHelper.resetAfter(() =>
        stateBuilder('Created', 'Non-Active', none)
      );

    const result = builder('test task');

    expect(result.name).to.equal('test task');
    expect(result.size).to.equal('No Size')
    expect(result.states).to.not.equal(none);
    expect(result.states).to.deep.equal(state);
    expect(result.activity).to.equal(state.activity);
  });

  it('report its creation', () => {
    let createdTask : ITask | undefined;
    let callback : (task: ITask) => void = (task: ITask) => {
      createdTask = task;
    }

    builder('testing task callback', undefined, callback);

    expect(createdTask).to.not.be.undefined;
    expect(createdTask?.name).to.equal('testing task callback');
    expect(createdTask?.size).to.equal('No Size')
  });

  it('build a task with the different name', () => {
    const state =
      dateHelper.resetAfter(() =>
        stateBuilder('Created', 'Non-Active', none)
      );

    const result = builder('my item', 'Tiny');

    expect(result.name).to.equal('my item');
    expect(result.size).to.equal('Tiny')
    expect(result.states).to.not.equal(none);
    expect(result.states).to.deep.equal(state);
    expect(result.activity).to.equal(state.activity);
  });

  it('record a state change', () => {
    const task = builder('new Item');

    const state =
      dateHelper.resetAfter(() =>
        stateBuilder('ready', 'Active', 'ready is active because it means someone is working', initialState)
      );

    task.changeState('ready', 'Active', 'ready is active because it means someone is working');

    expect(task.states).to.deep.equal(state);
    expect(task.activity).to.equal(state.activity);
  });

  it('know its current state initially', () => {
    const task = builder('new Item');

    expect(task.states).to.deep.equal(task.states);
    expect(task.activity).to.equal(task.states.activity);
  });

  it('know its current state after a change', () => {
    const task = builder('new Item');

    task.changeState('ready', 'Active', 'ready is active because it means someone is working');

    expect(task.states.getFirst()).to.deep.equal(initialState);
  });

  it('know its current state after three changes', () => {
    const task =
      dateHelper.resetAfter(() =>
        builder('new Item')
      );

    dateHelper.resetAfter(() =>
      task.changeState('ready', 'Non-Active', 'ready and waiting')
    );

    const firstChange = stateBuilder('ready', 'Non-Active', 'ready and waiting', initialState);

    dateHelper.resetAfter(() =>
      task.changeState('started', 'Active', 'working to resolve')
    );

    const secondChange = stateBuilder('started', 'Active', 'working to resolve', firstChange);

    dateHelper.resetAfter(() =>
      task.changeState('finished', 'Closed', 'all done')
    );

    const thirdChange = stateBuilder('finished', 'Closed', 'all done', secondChange);

    expect(task.states, 'Third Change').to.deep.equal(thirdChange);
    expect(task.states.previous, 'Second Change').to.deep.equal(secondChange);

    const actualSecondChange = clean(task.states.previous);
    expect(actualSecondChange.previous, 'First Change').to.deep.equal(firstChange);

    const actualFirstChange = clean(actualSecondChange.previous);
    expect(actualFirstChange.previous, 'Initial State').to.deep.equal(initialState);
  });
});
