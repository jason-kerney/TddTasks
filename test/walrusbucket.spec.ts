import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { ITask, TaskConstructor } from "@/task";
import { TimeHelper } from "./helpers";
import { IStateChange, StateChangeConstructor } from "@/stateChange";
import { none } from "@/generalTypes";

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
});
