import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { ITask } from "@/task";
import { addNRandomTasks, DateRange, getRandomBetween, setupRandomEnvironment, DateHelper } from "./helpers";
import { Activity } from "@/generalTypes";

describe('Walrus Bucket getAllTasks filtered by', () => {
  let container: IContainer;
  let walrusBucketConstructor: WalrusBucketConstructor;
  let numberOfActive: number;
  let numberOfInactive: number;
  let sut: IWalrusBucket;
  let dateHelper: DateHelper;
  let startDate: Date;
  let endDate: Date;
  let workingRange: DateRange;

  function getTasksBy(tasks: ITask[], predicate: (task: ITask) => boolean): ITask[] {
    let r: ITask[] = [];

    tasks.forEach(task => {
      if (!predicate(task)) {
        return;
      }

      r.push(task);
    });

    return r;
  }

  function getValidDate(predicate: (task: ITask, date: Date) => boolean): Date {
    let d: Date = workingRange.getRandom();
    let tasks = getTasksBy(sut.getAllTasks(), task => predicate(task, d));
    let cnt = 0;
    while (tasks.length === 0) {
      if (100 < cnt) throw new Error('Search timed out');
      d = workingRange.getRandom();
      tasks = getTasksBy(sut.getAllTasks(), task => predicate(task, d));;
      cnt++;
    }

    return d;
  }

  function getValid(tasks: ITask[], predicate: (task: ITask, date: Date) => boolean): [ITask[], Date] {
    const dt = getValidDate(predicate);
    return [getTasksBy(tasks, task => predicate(task, dt)), dt]
  }

  beforeEach(() => {
    numberOfActive = getRandomBetween(0, 100);
    numberOfInactive = getRandomBetween(0, 100);
    container = getContainer();

    dateHelper = setupRandomEnvironment(container, new DateRange(new Date("1-JAN-2020"), new Date("31-JAN-2020")));
    startDate = dateHelper.peekDate();

    walrusBucketConstructor = container.build(IWalrusBucket);
    sut = walrusBucketConstructor("team A's queue");

    addNRandomTasks(sut, numberOfActive, 'Active');
    addNRandomTasks(sut, numberOfInactive);
    endDate = dateHelper.peekDate();
    workingRange = new DateRange(startDate, endDate);
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

  describe('current dateLessThenOrEqual should', () => {
    let dt: Date;
    let expected: ITask[];

    beforeEach(() => {
      dt = getValidDate((task, d) => task.states.date <= d);
      expected = getTasksBy(sut.getAllTasks(), (task) => task.states.date <= dt);
    });

    it('return the correct number of items', () => {
      let r = sut.getAllTasks({ dateLessThenOrEqual: dt });

      expect(r).to.have.lengthOf(expected.length);
    });

    it('return the items that are correct', () => {
      let r = sut.getAllTasks({ dateLessThenOrEqual: dt });

      expected.forEach((task, index) => {
        expect(r, `expected[${index}]`).to.contain(task);
      });
    });
  });

  describe('both activity and dateLessThenOrEqual should', () => {
    beforeEach(() => {
      workingRange = new DateRange(startDate, endDate);
    });

    it('return active before date', () => {
      let [expectedTasks, searchDate] = getValid(
        sut.getAllTasks(),
        (task, dt) => task.activity === 'Active'
          && task.states.date <= dt
      );

      let r = sut.getAllTasks({ activity: 'Active', dateLessThenOrEqual: searchDate });

      expect(r).to.have.lengthOf(expectedTasks.length);

      expectedTasks.forEach((task: ITask) => {
        expect(r).to.contain(task);
      });
    });
  });

  describe('current dateLessThenOr should', () => {
    let dt: Date;
    let expected: ITask[];

    beforeEach(() => {
      [expected, dt] = getValid(sut.getAllTasks(), (task, dt) => task.states.date < dt);
    });

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

    // it('return the results of dateLessThen if dateLessThen has an earlier date then dateLessThenOrEqualTo', () => {
    //   // let d1: Date = workingRange.getRandom();
    //   // let d2: Date = workingRange.getRandom();
    //   // let cnt = 0;
    //   // while(d1 == d2) {
    //   //   if(100 <= 100) throw Error("timed out");
    //   //   d1 = workingRange.getRandom();
    //   //   d2 = workingRange.getRandom();
    //   // }

    //   let r = sut.getAllTasks({ dateLessThen: dt });

    //   expected.forEach((task, index) => {
    //     expect(r, `expected[${index}]`).to.contain(task);
    //   });
    // });
  });
});
