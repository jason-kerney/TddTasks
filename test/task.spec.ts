import { getContainer, IContainer } from "@/container";
import { none } from "@/generalTypes";
import { IStateChange, StateChangeConstructor } from "@/stateChange";
import { ITask, TaskConstructor } from "@/task";
import { expect } from "chai";
import { clean, TimeHelper } from "./helpers";

describe('Task should', () => {
  let container: IContainer;
  let dateHelper: TimeHelper;
  let builder: TaskConstructor;
  let stateBuilder: StateChangeConstructor;
  let initialState : IStateChange;

  beforeEach(() => {
    container = getContainer();
    dateHelper = new TimeHelper();
    dateHelper.registerWith(container);

    stateBuilder = container.build<IStateChange>(IStateChange) as StateChangeConstructor;

    let reset = dateHelper.holdDate();
    initialState = stateBuilder('Created', 'Non-Active', none);
    reset();


    builder = container.build<ITask>(ITask) as TaskConstructor;
  });

  it('be registered with the container', () => {
    const result = builder('test task');

    expect(result).to.be.instanceOf(ITask);
  });

  it('build a task with the given name', () => {
    let reset = dateHelper.holdDate();
    const state = stateBuilder('Created', 'Non-Active', none);
    reset();

    const result = builder('test task');

    expect(result.name).to.equal('test task');
    expect(result.size).to.equal('No Size')
    expect(result.states).to.not.equal(none);
    expect(result.states).to.deep.equal(state);
  });

  it('build a task with the different name', () => {
    let reset = dateHelper.holdDate();
    const state = stateBuilder('Created', 'Non-Active', none);
    reset();

    const result = builder('my item', 'Tiny');

    expect(result.name).to.equal('my item');
    expect(result.size).to.equal('Tiny')
    expect(result.states).to.not.equal(none);
    expect(result.states).to.deep.equal(state);
  });

  it('record a state change', () => {
    const task = builder('new Item');

    let reset = dateHelper.holdDate();
    const state = stateBuilder('ready', 'Active', 'ready is active because it means someone is working', initialState);
    reset();

    task.changeState('ready', 'Active', 'ready is active because it means someone is working');

    expect(task.states).to.deep.equal(state);
  });

  it('know its current state initially', () => {
    const task = builder('new Item');

    expect(task.states).to.deep.equal(task.states);
  });

  it('know its current state after a change', () => {
    const task = builder('new Item');

    task.changeState('ready', 'Active', 'ready is active because it means someone is working');

    expect(task.states.getFirst()).to.deep.equal(initialState);
  });

  it('know its current state after three changes', () => {
    let reset = dateHelper.holdDate();
    const task = builder('new Item');
    reset();

    reset = dateHelper.holdDate();
    task.changeState('ready', 'Non-Active', 'ready and waiting');
    reset();

    const firstChange = stateBuilder('ready', 'Non-Active', 'ready and waiting', initialState);

    reset = dateHelper.holdDate();
    task.changeState('started', 'Active', 'working to resolve');
    reset()

    const secondChange = stateBuilder('started', 'Active', 'working to resolve', firstChange);

    reset = dateHelper.holdDate();
    task.changeState('finished', 'Closed', 'all done');
    reset();

    const thirdChange = stateBuilder('finished', 'Closed', 'all done', secondChange);

    expect(task.states, 'Third Change').to.deep.equal(thirdChange);
    expect(task.states.previous, 'Second Change').to.deep.equal(secondChange);

    const actualSecondChange = clean(task.states.previous);
    expect(actualSecondChange.previous, 'First Change').to.deep.equal(firstChange);

    const actualFirstChange = clean(actualSecondChange.previous);
    expect(actualFirstChange.previous, 'Initial State').to.deep.equal(initialState);
  });
});
