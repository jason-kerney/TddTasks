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
    let workingRange: DateRange;
    let dt: Date;
    let expected: ITask[];

    beforeEach(() => {
      workingRange = new DateRange(startDate, endDate);

      dt = workingRange.getRandom();
      expected = getTasksLessThenEqualTo(dt);
      while (expected.length === 0) {
        dt = workingRange.getRandom();
        expected = getTasksLessThenEqualTo(dt);
      }
    });

    function getTasksLessThenEqualTo(date: Date): ITask[] {
      let r: ITask[] = [];

      sut.getAllTasks().forEach(task => {
        if (date < task.states.date) {
          return;
        }

        r.push(task);
      });

      return r;
    }

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
    let workingRange: DateRange;

    beforeEach(() => {
      workingRange = new DateRange(startDate, endDate);
    });

    function getAllByDate(tasks: ITask[], date: Date): ITask[] {
      const r: ITask[] = [];

      tasks.forEach(task => {
        if (date < task.states.date) {
          return;
        }

        r.push(task);
      });

      return r;
    }

    function getAllByActivity(tasks: ITask[], activity: Activity): ITask[] {
      const r: ITask[] = [];

      tasks.forEach(task => {
        if (task.activity === activity) {
          r.push(task);
        }
      });

      return r;
    }

    function getGoodFilterDate(tasks: ITask[], activity: Activity): [Date, ITask[]] {
      let dt: Date = workingRange.getRandom();
      let r = getAllByActivity(getAllByDate(sut.getAllTasks(), dt), activity);

      while (r.length === 0) {
        dt = workingRange.getRandom();
        r = getAllByActivity(getAllByDate(sut.getAllTasks(), dt), activity);
      }

      return [dt, r];
    }

    it('return active before date', () => {
      let [dt, expected] = getGoodFilterDate(sut.getAllTasks(), 'Active');

      let r = sut.getAllTasks({ activity: 'Active', dateLessThenOrEqual: dt });

      expect(r).to.have.lengthOf(expected.length);

      expected.forEach((task: ITask) => {
        expect(r).to.contain(task);
      });
    });
  });
});
