import { getContainer, IContainer } from "@/container";
import { none, StateChangeConstructor } from "@/generalTypes";
import { IStateChange } from "@/stateChange";
import { expect } from "chai";
import { TimeHelper } from "./helpers";

describe('StateChange should', () => {
  let dateHandler: TimeHelper;

  let container : IContainer;
  let builder : StateChangeConstructor;

  beforeEach(()=>{
    container = getContainer();
    dateHandler = new TimeHelper()
    dateHandler.registerWith(container);

    builder = container.build<IStateChange>('IStateChange') as StateChangeConstructor;
  });

  it('be registered with the container', () =>{
    const result = builder('My new state', 'Non-Active', none);

    expect(result).to.be.instanceOf(IStateChange);
  });

  it('allow for a new state change to be created', () =>{
    const name = 'My new state';
    const expectedActivity = 'Non-Active';
    const activityDescriptor = none;
    const expectedDate = dateHandler.peekDate();

    const actual = builder(name, expectedActivity, activityDescriptor);

    expect(actual.stateName).to.equal(name);
    expect(actual.activity).to.equal(expectedActivity);
    expect(actual.activityDescriptor).to.equal(activityDescriptor);
    expect(actual.date).to.deep.equal(expectedDate);
    expect(actual.next).to.equal(none);
  });

  it('allow for a new state with activity and activity descriptor', () => {
    const name = 'My new state';
    const expectedActivity = 'Active';
    const activityDescriptor = 'blocked';
    const expectedDate = dateHandler.peekDate();

    const actual = builder(name, expectedActivity, activityDescriptor);

    expect(actual.stateName).to.equal(name);
    expect(actual.activity).to.equal(expectedActivity);
    expect(actual.activityDescriptor).to.equal(activityDescriptor);
    expect(actual.date).to.deep.equal(expectedDate);
    expect(actual.next).to.equal(none);
  });

  it('allow new state change to be attached to previous', () => {
    const actual1 = builder('first', 'Non-Active', 'fist thing');

    let reset = dateHandler.holdDate();
    builder('second', 'Non-Active', 'second thing', actual1);

    reset();
    let actual2 = builder('second', 'Non-Active', 'second thing');

    expect(actual1.next).to.deep.equal(actual2);
  });

  it('return previous value', () => {
    const actual1 = builder('first', 'Non-Active', 'fist thing');

    const actual2 = builder('second', 'Non-Active', 'second thing', actual1);

    expect(actual1).to.deep.equal(actual2);
  });

  it('attach to last open space', () => {
    const actual1 = builder('first', 'Non-Active', 'fist thing');

    let reset = dateHandler.holdDate();
    builder('second', 'Non-Active', 'second thing', actual1);

    reset();
    const actual2 = builder('second', 'Non-Active', 'second thing')

    reset = dateHandler.holdDate();
    builder('third', 'Non-Active', 'third thing', actual1);

    reset();
    const actual3 = builder('third', 'Non-Active', 'third thing');
    actual2.next = actual3;

    expect(actual1.next).to.deep.equal(actual2);
    expect((actual1.next as IStateChange).next).to.deep.equal(actual3);
  });

  it('be able to get the last change', () => {
    const actual1 = builder('first', 'Non-Active', 'fist thing');

    let reset = dateHandler.holdDate();
    builder('second', 'Non-Active', 'second thing', actual1);

    reset();
    const actual2 = builder('second', 'Non-Active', 'second thing')

    reset = dateHandler.holdDate();
    builder('third', 'Non-Active', 'third thing', actual1);

    reset();
    const actual3 = builder('third', 'Non-Active', 'third thing');
    actual2.next = actual3;

    expect(actual1.getLast()).to.deep.equal(actual3);
  });

  it('be able to get the date of the last change', () => {
    const actual1 = builder('first', 'Non-Active', 'fist thing');
    builder('second', 'Non-Active', 'second thing', actual1);
    let expectedDate = dateHandler.peekDate();

    builder('third', 'Non-Active', 'third thing', actual1);

    expect(actual1.getLastUpdateDate()).to.deep.equal(expectedDate);
  });
});
