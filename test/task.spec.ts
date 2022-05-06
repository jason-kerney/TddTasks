import { getContainer, IContainer } from "@/container";
import { Activity, IStateChange, ITask, none, StateChangeConstructor, TaskConstructor } from "@/taskInterfaces";
import { expect } from "chai";
import { TimeHelper } from "./helpers";

describe('Task should', () =>{
  let container: IContainer;
  let dateHelper : TimeHelper;
  let builder : TaskConstructor;

  beforeEach(() => {
    container = getContainer();
    dateHelper = new TimeHelper();
    dateHelper.registerWith(container);

    builder = container.build<ITask>('ITask') as TaskConstructor;
  });

  it('be registered with the container', () =>{
    const result = builder('test task');

    expect(result).to.have.property('name');
    expect(result).to.have.property('size');
    expect(result).to.have.property('states');
  });

  it('build a task with the given name', () => {
    let reset = dateHelper.holdDate();
    const state = (container.build<IStateChange>('IStateChange') as StateChangeConstructor)('Created', 'Non-Active', none);
    reset();

    const result = builder('test task');

    expect(result.name).to.equal('test task');
    expect(result.size).to.equal('No Size')
    expect(result.states).to.not.equal(none);
    expect(result.states).to.deep.equal(state);
  });

  it('build a task with the different name', () => {
    let reset = dateHelper.holdDate();
    const state = (container.build<IStateChange>('IStateChange') as StateChangeConstructor)('Created', 'Non-Active', none);
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
    const state = (container.build<IStateChange>('IStateChange') as StateChangeConstructor)('ready', 'Active', 'ready is active because it means someone is working');
    reset();

    task.changeState('ready', 'Active', 'ready is active because it means someone is working');

    expect(task.states.next).to.deep.equal(state);
  });

  it('know its current state initially', () => {
    const task = builder('new Item');

    expect(task.currentState).to.deep.equal(task.states);
  });

  it('know its current state after a change', () => {
    const task = builder('new Item');

    task.changeState('ready', 'Active', 'ready is active because it means someone is working');

    expect(task.currentState).to.deep.equal(task.states.next);
  });

  it('know its current state after three changes', () => {
    const task = builder('new Item');

    task.changeState('ready', 'Non-Active', 'ready and waiting');
    task.changeState('started', 'Active', 'working to resolve');
    task.changeState('finished', 'Closed', 'all done');

    const firstChange = task.states.next as IStateChange;
    const secondChange = firstChange.next as IStateChange;
    expect(task.currentState).to.deep.equal(secondChange.next);
  });
});
