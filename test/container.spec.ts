import { getContainer, IContainer } from "@/container";
import { expect } from "chai";

describe('The Container should', () => {
  var container : IContainer;

  beforeEach(() => {
    container = getContainer();
  });

  it('give back the function to construct an item registered under a name', () =>{
    let item = { Name: 'test thing' };
    type ItemType = typeof item;
    let factory = () => () => item;

    container.register<ItemType>('TestThing', factory);
    const expectedResult = container.build<ItemType>('TestThing')();

    expect(expectedResult).equal(item);
  });

  it('give back the first function to construct an item when two are registered', () =>{
    let item1 = { Name: 'test thing' };
    type ItemType1 = typeof item1;
    container.register<ItemType1>('TestThing1', () => () => item1);

    let item2 = { Description: 'test description' };
    type ItemType2 = typeof item2;
    container.register<ItemType2>('TestThing2', () => () => item2);

    const expectedResult = container.build<ItemType1>('TestThing1')();

    expect(expectedResult).to.deep.equal(item1);
  });

  it('give back the second function to construct an item when two are registered', () =>{
    let item1 = { Name: 'test thing' };
    type ItemType1 = typeof item1;
    container.register<ItemType1>('TestThing1', () => () => item1);

    let item2 = { Description: 'test description' };
    type ItemType2 = typeof item2;
    container.register<ItemType2>('TestThing2', () => () => item2);

    const expectedResult = container.build<ItemType2>('TestThing2')();

    expect(expectedResult).to.deep.equal(item2);
  });

  it('give back a function that returns none when none are registered', () =>{
    expect(() => container.build<any>('TestThing2')).throws('No "TestThing2" provider registered');
  });

  it('give back a function that returns none when calling something that is not registered registered', () =>{
    container.register('TestThing', () => () => { yes: true });

    expect(() => container.build<any>('TestThing2')).throws('No "TestThing2" provider registered');
  });

  it('contain a builder for getting the date', () => {
    const expectedResult = container.build<Date>('Now')();

    expect(expectedResult).to.be.an.instanceOf(Date);
  });

  it('allow registration of Date to return specific date', () => {
    container.register<Date>('Now', () => () => new Date('3/14/1592') );
    const expectedResult = container.build<Date>('Now')();

    expect(expectedResult).to.be.deep.equal(new Date('3/14/1592'));
  });

  it('allow de-registration of alternate Date to return current date', () => {
    container.register<Date>('Now', () => () => new Date('3/14/1592') );
    container.deregister('Now');

    const expectedResult = container.build<Date>('Now')();

    expect(expectedResult).to.not.deep.equal(new Date('3/14/1592'));
    expect(expectedResult).to.be.instanceOf(Date);
  });

  it('allow de-registration of Date when a new date was not registered', () => {
    container.deregister('Now');

    const expectedResult = container.build<Date>('Now')();

    expect(expectedResult).to.not.deep.equal(new Date('3/14/1592'));
    expect(expectedResult).to.be.instanceOf(Date);
  });

  it('throw on building of new type when a new new type was deregistered', () => {
    let item = { Name: 'test thing' };
    type ItemType = typeof item;
    container.register<ItemType>('TestThing', () => () => item);
    container.deregister('TestThing');

    expect(() => container.build<ItemType>('TestThing')).throws('No "TestThing" provider registered')
  });

  it('not throw on de-registration Now when Now was not registered', () => {
    container.deregister('Date');
  });

  it('passes itself to the factory method', () => {
    let called = false;
    container.register('thing', (factory) => {
      expect(factory).to.be.equal(container);
      called = true;

      return () => 'yes'
    });

    container.build<any>('thing');

    expect(called).to.be.true;
  });
});
