import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { ITask, TaskConstructor } from "@/task";
import { addNRandomTasks, DateRange, getRandomBetween, setupRandomEnvironment, DateHelper, buildDateRangeBy } from "./helpers";
import { ITaskFilter, ITaskFilterCriteria, taskFilterBuilder, TaskFilterConstructor } from "@/taskFilter";

describe('filter tasks by', () => {
  let container: IContainer;
  let tasksFilterBuilder: TaskFilterConstructor;
  let numberOfActive: number;
  let numberOfInactive: number;
  let baseTasks: ITask[];
  let dateHelper: DateHelper;
  let startDate: Date;
  let endDate: Date;
  let workingRange: DateRange;

  function getValid<T>(getter: () => T, predicate: (result: T) => boolean): T {
    let cnt = 0;
    let r = getter();

    while (!predicate(r)) {
      if (100 < cnt) throw new Error('Search timed out');
      r = getter();
      cnt++;
    }

    return r;
  }

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

  function getTasksAndDate(tasks: ITask[], predicate: (task: ITask, date: Date) => boolean): [ITask[], Date] {
    let [d, resultTasks] = getValid<[Date, ITask[]]>(
      () => {
        const date = workingRange.getRandom();
        return [
          date,
          getTasksBy(tasks, task => {
            return predicate(task, date);
          })
        ]
      },
      ([d, tasks]) => {
        return 0 < tasks.length
      }
    );

    return [resultTasks, d];
  }

  function filterTasks(tasks: ITask[], filter?: ITaskFilterCriteria): ITask[] {
    return tasksFilterBuilder(tasks, filter).getResults();
  }

  beforeEach(() => {
    baseTasks = [];
    numberOfActive = getRandomBetween(100, 500);
    numberOfInactive = getRandomBetween(100, 500);
    container = getContainer();

    dateHelper = setupRandomEnvironment(container, new DateRange(new Date("1-JAN-2020"), new Date("31-JAN-2020")));

    let taskBuilder: TaskConstructor = container.build(ITask);
    tasksFilterBuilder = container.build(ITaskFilter);

    workingRange = buildDateRangeBy(dateHelper, _ => {
      addNRandomTasks(baseTasks, taskBuilder, numberOfActive, 'Active');
      addNRandomTasks(baseTasks, taskBuilder, numberOfInactive, 'Non-Active');
    });

    startDate = workingRange.getStart();
    endDate = workingRange.getEnd();
  });

  describe('undefined filter should', () => {
    it('return all results', () => {
      let r = filterTasks(baseTasks);

      expect(r).to.have.lengthOf(baseTasks.length);

      baseTasks.forEach(task => {
        expect(r).to.contain(task);
      });
    });

    it('show the filter as empty object', () => {
      let sut = tasksFilterBuilder(baseTasks);

      expect(sut.filterCriteria).to.deep.equal({});
    });
  });

  describe('activity should', () => {
    it('have correct length for active', () => {
      let r = filterTasks(baseTasks, { activity: 'Active' });

      expect(r).to.have.lengthOf(numberOfActive);
    });

    it('return an active filter', () => {
      let sut = tasksFilterBuilder(baseTasks, { activity: 'Active' });

      expect(sut.filterCriteria).to.deep.equal({ activity: 'Active' });
    });

    it('return same results on second call', () => {
      let filter = tasksFilterBuilder(baseTasks, { activity: 'Active' })
      let expected = filter.getResults();
      let r = filter.getResults();

      expect(r).to.equal(expected);
    });

    it('return the tasks for active', () => {
      let r = filterTasks(baseTasks, { activity: 'Active' });

      for (let index = 0; index < numberOfActive; index++) {
        expect(r[index], `r[${index}]`).to.be.instanceOf(ITask);
      }
    });

    it('have correct length for non-active', () => {
      let r = filterTasks(baseTasks, { activity: 'Non-Active' });

      expect(r).to.have.lengthOf(numberOfInactive);
    });

    it('return non-active criteria', () => {
      let sut = tasksFilterBuilder(baseTasks, { activity: 'Non-Active' });

      expect(sut.filterCriteria).to.deep.equal({ activity: 'Non-Active' });
    });

    it('return the tasks for non-active', () => {
      let r = filterTasks(baseTasks, { activity: 'Non-Active' });

      r.forEach((item, index) => {
        expect(item, `r[${index}]`).to.be.instanceOf(ITask);
      });
    });
  });

  describe('current dateLessThenOrEqual should', () => {
    let dt: Date;
    let expected: ITask[];

    beforeEach(() => {
      [expected, dt] = getTasksAndDate(baseTasks, (task, d) => {
        return task.states.date <= d;
      });
    });

    it('return the correct number of items', () => {
      let r = filterTasks(baseTasks, { dateLessThenOrEqual: dt });

      expect(r).to.have.lengthOf(expected.length);
    });

    it('return criteria for dateLessThenOrEqual', () => {
      let sut = tasksFilterBuilder(baseTasks, { dateLessThenOrEqual: dt });

      expect(sut.filterCriteria).to.deep.equal({ dateLessThenOrEqual: dt });
    });

    it('return the items that are correct', () => {
      let r = filterTasks(baseTasks, { dateLessThenOrEqual: dt });

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
      let [expectedTasks, searchDate] = getTasksAndDate(
        baseTasks,
        (task, dt) => task.activity === 'Active'
          && task.states.date <= dt
      );

      let r = filterTasks(baseTasks, { activity: 'Active', dateLessThenOrEqual: searchDate });

      expect(r).to.have.lengthOf(expectedTasks.length);

      expectedTasks.forEach((task: ITask) => {
        expect(r).to.contain(task);
      });
    });

    it('return criteria for both activity and dateLessThenOrEqual', () => {
      let sut = tasksFilterBuilder(baseTasks, { activity: 'Active', dateLessThenOrEqual: dateHelper.peekDate() });

      expect(sut.filterCriteria).to.deep.equal({ activity: 'Active', dateLessThenOrEqual: dateHelper.peekDate() });
    });
  });

  describe('current dateLessThen should', () => {
    let dt: Date;
    let expected: ITask[];

    beforeEach(() => {
      [expected, dt] = getTasksAndDate(baseTasks, (task, dt) => task.states.date < dt);
    });

    it('return the correct number of items', () => {
      let r = filterTasks(baseTasks, { dateLessThen: dt });

      expect(r).to.have.lengthOf(expected.length);
    });

    it('return filter criteria for dateLessThen', () => {
      let sut = tasksFilterBuilder(baseTasks, { dateGraterThen: dateHelper.peekDate() });

      expect(sut.filterCriteria).to.deep.equal({ dateGraterThen: dateHelper.peekDate() });
    });

    it('return the items that are correct', () => {
      let r = filterTasks(baseTasks, { dateLessThen: dt });

      expected.forEach((task, index) => {
        expect(r, `expected[${index}]`).to.contain(task);
      });
    });

    it('return the results of dateLessThen if dateLessThen has an earlier date then dateLessThenOrEqualTo', () => {
      let [d1, d2, expectedTasks] = getValid<[Date, Date, ITask[]]>(
        () => {
          let date1 = workingRange.getRandom();
          let date2 = workingRange.getRandom();
          if (date2 < date1) {
            let t = date1;
            date1 = date2;
            date2 = t;
          }
          let tasks = getTasksBy(baseTasks, task => task.states.date < date1);

          return [date1, date2, tasks];
        },
        ([_date1, _date2, tasks]) => 0 < tasks.length
      );

      let result = filterTasks(baseTasks, { dateLessThen: d1, dateLessThenOrEqual: d2 });

      expect(result).to.have.lengthOf(expectedTasks.length);

      expectedTasks.forEach(task => {
        expect(result).to.contain(task);
      });
    });

    it('return criteria for search for both lessThen and lessThenOrEqual', () => {
      let sut = tasksFilterBuilder(baseTasks, { dateLessThen: new Date(dateHelper.peekDate().getDate() + 1), dateLessThenOrEqual: dateHelper.peekDate() });

      expect(sut.filterCriteria).to.deep.equal({ dateLessThen: new Date(dateHelper.peekDate().getDate() + 1), dateLessThenOrEqual: dateHelper.peekDate() });
    });

    it('return the results of dateLessThenOrEqual if dateLessThenOrEqualTo has an earlier date then dateLessThen', () => {
      let [d1, d2, expectedTasks] = getValid<[Date, Date, ITask[]]>(
        () => {
          let date1 = workingRange.getRandom();
          let date2 = workingRange.getRandom();
          if (date2 < date1) {
            let t = date1;
            date1 = date2;
            date2 = t;
          }
          let tasks = getTasksBy(baseTasks, task => task.states.date <= date1);

          return [date1, date2, tasks];
        },
        ([_date1, _date2, tasks]) => 0 < tasks.length
      );

      let result = filterTasks(baseTasks, { dateLessThen: d2, dateLessThenOrEqual: d1 });

      expect(result).to.have.lengthOf(expectedTasks.length);

      expectedTasks.forEach(task => {
        expect(result).to.contain(task);
      });
    });
  });

  describe('both activity and dateLessThen should', () => {
    beforeEach(() => {
      workingRange = new DateRange(startDate, endDate);
    });

    it('return active before date', () => {
      let [expectedTasks, searchDate] = getTasksAndDate(
        baseTasks,
        (task, dt) => task.activity === 'Active'
          && task.states.date < dt
      );

      let r = filterTasks(baseTasks, { activity: 'Active', dateLessThen: searchDate });

      expect(r).to.have.lengthOf(expectedTasks.length);

      expectedTasks.forEach((task: ITask) => {
        expect(r).to.contain(task);
      });
    });

    it('return criteria', () => {
      let sut = tasksFilterBuilder(baseTasks, { activity: 'Active', dateLessThen: dateHelper.peekDate() });

      expect(sut.filterCriteria).to.deep.equal({ activity: 'Active', dateLessThen: dateHelper.peekDate() });
    });
  });

  describe('current dateGraterThenOrEqual should', () => {
    let dt: Date;
    let expected: ITask[];

    beforeEach(() => {
      [expected, dt] = getTasksAndDate(baseTasks, (task, d) => {
        return task.states.date >= d;
      });
    });

    it('return the correct number of items', () => {
      let r = filterTasks(baseTasks, { dateGraterThenOrEqual: dt });

      expect(r).to.have.lengthOf(expected.length);
    });

    it('return criteria', () => {
      let sut = tasksFilterBuilder(baseTasks, { dateGraterThenOrEqual: dateHelper.peekDate() });

      expect(sut.filterCriteria).to.deep.equal({ dateGraterThenOrEqual: dateHelper.peekDate() });
    });

    it('return the items that are correct', () => {
      let r = filterTasks(baseTasks, { dateGraterThenOrEqual: dt });

      expected.forEach((task, index) => {
        expect(r, `expected[${index}]`).to.contain(task);
      });
    });
  });

  describe('both activity and dateGraterThenOrEqual should', () => {
    it('return active before date', () => {
      let [expectedTasks, searchDate] = getTasksAndDate(
        baseTasks,
        (task, dt) => task.activity === 'Active'
          && task.states.date >= dt
      );

      let r = filterTasks(baseTasks, { activity: 'Active', dateGraterThenOrEqual: searchDate });

      expect(r).to.have.lengthOf(expectedTasks.length);

      expectedTasks.forEach((task: ITask) => {
        expect(r).to.contain(task);
      });
    });

    it('return criteria', () => {
      let sut = tasksFilterBuilder(baseTasks, { activity: 'Closed', dateGraterThenOrEqual: dateHelper.peekDate() });

      expect(sut.filterCriteria).to.deep.equal({ activity: 'Closed', dateGraterThenOrEqual: dateHelper.peekDate() });
    });
  });

  describe('inclusively between dates should', () => {
    let dt1: Date;
    let dt2: Date;
    let expectedTasks: ITask[];

    beforeEach(() => {
      [dt1, dt2, expectedTasks] = getValid<[Date, Date, ITask[]]>(
        () => {
          let date1 = workingRange.getRandom();
          let date2 = workingRange.getRandom();

          if (date2 < date1) {
            let dt = date1;
            date1 = date2;
            date2 = dt;
          }

          let results = getTasksBy(baseTasks, task => date1 <= task.states.date && task.states.date <= date2);
          return [date1, date2, results];
        },
        ([date1, date2, results]) => 0 < results.length && date1 != date2
      );
    });

    it('have expected tasks', () => {
      let result = filterTasks(baseTasks, { dateLessThenOrEqual: dt2, dateGraterThenOrEqual: dt1 });

      expect(result).to.have.lengthOf(expectedTasks.length);

      expectedTasks.forEach(task => {
        expect(result).to.contain(task)
      });
    });

    it('return the criteria', () => {
      let sut = tasksFilterBuilder(baseTasks, { dateLessThenOrEqual: dt2, dateGraterThenOrEqual: dt1 });

      expect(sut.filterCriteria).to.deep.equal({ dateLessThenOrEqual: dt2, dateGraterThenOrEqual: dt1 });
    });
  });

  describe('current dateGraterThen should', () => {
    let dt: Date;
    let expected: ITask[];

    beforeEach(() => {
      [expected, dt] = getTasksAndDate(baseTasks, (task, d) => {
        return task.states.date > d;
      });
    });

    it('return the correct number of items', () => {
      let r = filterTasks(baseTasks, { dateGraterThen: dt });

      expect(r).to.have.lengthOf(expected.length);
    });

    it('return criteria', () => {
      let sut = tasksFilterBuilder(baseTasks, { dateGraterThen: dt });

      expect(sut.filterCriteria).to.deep.equal({ dateGraterThen: dt });
    });

    it('return the items that are correct', () => {
      let r = filterTasks(baseTasks, { dateGraterThen: dt });

      expected.forEach((task, index) => {
        expect(r, `expected[${index}]`).to.contain(task);
      });
    });
  });
});
