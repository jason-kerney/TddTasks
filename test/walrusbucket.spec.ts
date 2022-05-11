import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { DateHelper } from "./helpers";

describe('Walrus Bucket should', () => {
  let container: IContainer;
  let walrusBucketConstructor: WalrusBucketConstructor;
  let sut: IWalrusBucket;
  let dateHelper: DateHelper;

  beforeEach(() => {
    container = getContainer();

    dateHelper = new DateHelper();
    dateHelper.registerWith(container);

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
