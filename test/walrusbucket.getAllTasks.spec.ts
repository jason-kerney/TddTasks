import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { ITask, TaskConstructor } from "@/task";
import { addNRandomTasks, DateRange, getRandomBetween, setupRandomEnvironment, DateHelper } from "./helpers";
import { IStateChange, StateChangeConstructor } from "@/stateChange";
import { Activity, none } from "@/generalTypes";

describe('Walrus Bucket getAllTasks filtered by', () => {
  let container: IContainer;
  let walrusBucketConstructor: WalrusBucketConstructor;
  let taskConstructor: TaskConstructor;
  let stateConstructor: StateChangeConstructor;
  let numberOfActive: number;
  let numberOfInactive: number;
  let sut: IWalrusBucket;
  let dateHelper: DateHelper;
  let startDate: Date;
  let endDate: Date;

  beforeEach(() => {
    numberOfActive = getRandomBetween(0, 100);
    numberOfInactive = getRandomBetween(0, 100);
    container = getContainer();

    dateHelper = setupRandomEnvironment(container, new DateRange(new Date("1-JAN-2020"), new Date("31-JAN-2020")));
    startDate = dateHelper.peekDate();

    taskConstructor = container.build(ITask);
    stateConstructor = container.build(IStateChange)
    walrusBucketConstructor = container.build(IWalrusBucket);
    sut = walrusBucketConstructor("team A's queue");

    addNRandomTasks(sut, numberOfActive, 'Active');
    addNRandomTasks(sut, numberOfInactive);
    endDate = dateHelper.peekDate();
  });

  describe('activity should', () => {
    it('have correct length for active', () => {
      let r = sut.getAllTasks({ activity: 'Active' });

      expect(r).to.have.lengthOf(numberOfActive);
    });

    it('return the tasks for active', () => {
      let r = sut.getAllTasks({ activity: 'Active' });

      for (let index = 0; index < numberOfActive; index++) {
        expect(r[index], `r[${index}]`).to.be.instanceOf(ITask);
      }
    });

    it('have correct length for non-active', () => {
      let r = sut.getAllTasks({ activity: 'Non-Active' });

      expect(r).to.have.lengthOf(numberOfInactive);
    });

    it('return the tasks for non-active', () => {
      let r = sut.getAllTasks({ activity: 'Non-Active' });

      r.forEach((item, index) => {
        expect(item, `r[${index}]`).to.be.instanceOf(ITask);
      });
    });
  });

  describe('by current dateLessThen should', () => {
    let workingRange: DateRange;
    let dt: Date;
    let expected: ITask[];

    beforeEach(() => {
      workingRange = new DateRange(startDate, endDate);

      dt = workingRange.getRandom();
      expected = getTasksLessThen(dt);
      while (expected.length === 0) {
        dt = workingRange.getRandom();
        expected = getTasksLessThen(dt);
      }
    });

    function getTasksLessThen(date: Date): ITask[] {
      let r: ITask[] = [];

      sut.getAllTasks().forEach(task => {
        if (task.states.date < date) {
          return;
        }

        r.push(task);
      });

      return r;
    }

    it('return the correct number of items', () => {
      let r = sut.getAllTasks({ dateLessThen: dt });

      expect(r).to.have.lengthOf(expected.length);
    });

    it('return the items that are correct', () => {
      let r = sut.getAllTasks({ dateLessThen: dt });

      expected.forEach((task, index) => {
        expect(r, `expected[${index}]`).to.contain(task);
      });
    });
  });
});
