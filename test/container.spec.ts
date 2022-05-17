import { getContainer, IContainer } from "@/container";
import { INow } from "@/now";
import { expect } from "chai";

class ItemType {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class ItemType2 {
  description: string;

  constructor(description: string) {
    this.description = description;
  }
}

class YesThing {
  yes: boolean;

  constructor(yes: boolean) {
    this.yes = yes;
  }
}

describe('The Container should', () => {
  var container: IContainer;

  beforeEach(() => {
    container = getContainer();
  });

  it('give back the function to construct an item registered under a name', () => {
    let item = new ItemType('test thing');
    let factory = () => () => item;

    container.register(ItemType, factory);
    const expectedResult = container.build(ItemType)();

    expect(expectedResult).equal(item);
  });

  it('give back the first function to construct an item when two are registered', () => {
    let item1 = new ItemType('test thing');
    container.register(ItemType, () => () => item1);

    let item2 = new ItemType2('test description');
    container.register(ItemType2, () => () => item2);

    const expectedResult = container.build(ItemType)();

    expect(expectedResult).to.deep.equal(item1);
  });

  it('give back the second function to construct an item when two are registered', () => {
    let item1 = new ItemType('test thing');
    container.register(ItemType, () => () => item1);

    let item2 = new ItemType2('test description');
    container.register(ItemType2, () => () => item2);

    const expectedResult = container.build(ItemType2)();

    expect(expectedResult).to.deep.equal(item2);
  });

  it('give back a function that returns none when none are registered', () => {
    expect(() => container.build(ItemType)).throws('No "ItemType" provider registered');
  });

  it('give back a function that returns none when calling something that is not registered registered', () => {
    container.register(YesThing, () => () => new YesThing(true));

    expect(() => container.build(ItemType)).throws('No "ItemType" provider registered');
  });

  it('contain a builder for getting the date', () => {
    const expectedResult = container.build(INow)();

    expect(expectedResult).to.be.an.instanceOf(INow);
  });

  it('allow registration of Date to return specific date', () => {
    container.register(INow, () => () => { return { now: () => new Date('3/14/1592') } });
    const expectedResult = container.build(INow)().now();

    expect(expectedResult).to.be.deep.equal(new Date('3/14/1592'));
  });

  it('allow de-registration of alternate Date to return current date', () => {
    container.register(INow, () => () => { return { now: () => new Date('3/14/1592') } });
    container.deregister(INow);

    const expectedResult = container.build(INow)();

    expect(expectedResult.now()).to.not.deep.equal(new Date('3/14/1592'));
    expect(expectedResult).to.be.instanceOf(INow);
  });

  it('allow de-registration of Date when a new date was not registered', () => {
    container.deregister(Date);

    const expectedResult = container.build(INow)();

    expect(expectedResult.now()).to.not.deep.equal(new Date('3/14/1592'));
    expect(expectedResult).to.be.instanceOf(INow);
  });

  it('throw on building of new type when a new new type was deregistered', () => {
    let item = new ItemType('test thing');
    container.register(ItemType, () => () => item);
    container.deregister(ItemType);

    expect(() => container.build(ItemType)).throws('No "ItemType" provider registered')
  });

  it('not throw on de-registration Now when Now was not registered', () => {
    container.deregister(INow);
  });

  it('passes itself to the factory method', () => {
    let called = false;
    container.register(YesThing, (factory) => {
      expect(factory).to.be.equal(container);
      called = true;

      return () => new YesThing(false)
    });

    container.build(YesThing);

    expect(called).to.be.true;
  });
});
