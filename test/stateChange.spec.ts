import { getContainer, IContainer } from "@/container";
import { none } from "@/generalTypes";
import { IStateChange, StateChangeConstructor } from "@/stateChange";
import { expect } from "chai";
import { DateHelper } from "./helpers";

describe('StateChange should', () => {
  let dateHandler: DateHelper;

  let container : IContainer;
  let builder : StateChangeConstructor;

  beforeEach(()=>{
    container = getContainer();
    dateHandler = new DateHelper()
    dateHandler.registerWith(container);

    builder = container.build(IStateChange) as StateChangeConstructor;
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
    expect(actual.previous).to.equal(none);
    expect(actual.count()).to.equal(1);
  });

  it('allow for a new state with activity and activity descriptor', () => {
    const name = 'My new state';
    const expectedActivity = 'Active';
    const activityDescriptor = none;
    const expectedDate = dateHandler.peekDate();

    const actual = builder(name, expectedActivity, activityDescriptor);

    expect(actual.stateName).to.equal(name);
    expect(actual.activity).to.equal(expectedActivity);
    expect(actual.activityDescriptor).to.equal(activityDescriptor);
    expect(actual.date).to.deep.equal(expectedDate);
    expect(actual.previous).to.equal(none);
    expect(actual.count()).to.equal(1);
  });

  it('allow new state change to be attached to previous', () => {
    const actual1 = builder('first', 'Non-Active', 'fist thing');

    let actual2 = builder('second', 'Non-Active', 'second thing', actual1);


    expect(actual2.previous).to.deep.equal(actual1);
    expect(actual1.count()).to.equal(1);
    expect(actual2.count()).to.equal(2);
  });

  it('return previous value', () => {
    const firstState = builder('first', 'Non-Active', 'fist thing');
    const secondState = builder('second', 'Non-Active', 'second thing', firstState);

    expect(secondState.previous).to.deep.equal(firstState);
  });

  it('attach previous and return new head', () => {
    const firstState = builder('first', 'Non-Active', 'fist thing');
    const secondState = builder('second', 'Non-Active', 'second thing', firstState);
    const thirdState = builder('third', 'Non-Active', 'third thing', secondState);

    expect(thirdState.previous, 'Third State').to.equal(secondState);
    expect(secondState.previous, 'Second State').to.deep.equal(firstState);
    expect(firstState.previous, 'First State').to.equal(none);
  });

  it('be able to get the first change', () => {
    const actual1 = builder('first', 'Non-Active', 'fist thing');
    const actual2 = builder('second', 'Non-Active', 'second thing', actual1);
    const actual3 = builder('third', 'Non-Active', 'third thing', actual2);

    expect(actual3.getFirst()).to.deep.equal(actual1);
  });

  it('be able to get the date of the last change', () => {
    const actual1 = builder('first', 'Non-Active', 'fist thing');
    const actual2 = builder('second', 'Non-Active', 'second thing', actual1);
    const actual3 = builder('third', 'Non-Active', 'third thing', actual2);

    expect(actual1.getFirstUpdateDate()).to.deep.equal(actual1.date);
    expect(actual2.getFirstUpdateDate()).to.deep.equal(actual1.date);
    expect(actual3.getFirstUpdateDate()).to.deep.equal(actual1.date);
  });
});
