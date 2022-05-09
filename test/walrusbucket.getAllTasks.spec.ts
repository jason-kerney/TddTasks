import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { ITask, TaskConstructor } from "@/task";
import { addNRandomTasks, getRandomBetween, TimeHelper } from "./helpers";
import { IStateChange, StateChangeConstructor } from "@/stateChange";
import { Activity, none } from "@/generalTypes";

describe('Walrus Bucket should', () => {
  let container: IContainer;
  let walrusBucketConstructor: WalrusBucketConstructor;
  let taskConstructor: TaskConstructor;
  let stateConstructor: StateChangeConstructor;
  let numberOfActive : number;
  let sut: IWalrusBucket;
  let dateHelper: TimeHelper;

  describe('getAllTasks optionally', () => {
    beforeEach(() => {
      numberOfActive = getRandomBetween(5, 100);
      container = getContainer();

      dateHelper = new TimeHelper();
      dateHelper.registerWith(container);

      taskConstructor = container.build(ITask);
      stateConstructor = container.build(IStateChange)
      walrusBucketConstructor = container.build(IWalrusBucket);
      sut = walrusBucketConstructor("team A's queue");

      addNRandomTasks(sut, numberOfActive, 'Active');
      addNRandomTasks(sut, 5);
    });

    it('filter by Activity', () => {
      let r = sut.getAllTasks({ Activity: 'Active' });

      expect(r).to.have.lengthOf(numberOfActive);
    });

    it('filter by Activity and return real items', () => {
      let r = sut.getAllTasks({ Activity: 'Active' });

      for (let index = 0; index < numberOfActive; index++) {
        expect(r[index], `r[${index}]`).to.be.not.undefined;
      }
    });
  });
});
