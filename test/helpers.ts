import { IContainer } from "@/container";
import { Activity, none, None, Size, Unsized } from "@/generalTypes";
import { IGuid } from "@/guid";
import { INow } from "@/now";
import { ITask, TaskConstructor } from "@/task";
import { v4 as uuidV4 } from 'uuid';

export function buildDateRangeBy(dateHelper: DateHelper, code: (helper: DateHelper) => void): DateRange {
  let startDate = dateHelper.peekDate();
  code(dateHelper);
  let endDate = dateHelper.peekDate();

  return new DateRange(startDate, endDate);
}

export class DateRange {
  private readonly start: number;
  private readonly end: number;
  constructor(start: Date | number, end: Date | number) {
    if (end < start) {
      throw new Error(`Expected "${start}" <= "${end}"`);
    }

    if (typeof start === 'number') {
      this.start = start;
    }
    else {
      this.start = start.getTime();
    }

    if (typeof end === 'number') {
      this.end = end;
    }
    else {
      this.end = end.getTime();
    }
  }

  getRandom(): Date {
    const msInDay = 24 * 60 * 60 * 1000
    let sDate = new Date(this.start);

    let maxDays = Math.abs(this.end - this.start) / msInDay

    let days = Math.floor(Math.random() * maxDays);

    sDate.setDate(sDate.getDate() + days);

    return sDate;
  }

  getStart(): Date {
    return new Date(this.start);
  }

  getEnd(): Date {
    return new Date(this.end);
  }
}

export class DateHelper {
  private date: Date;
  private readonly repeatDays: number;
  private repeatCnt = 0;

  constructor(init: Date | string = '3/14/1592') {
    this.date = new Date(init);
    this.repeatDays = Math.floor(Math.random() * 10);
  }

  setDate(date: Date) {
    this.date = new Date(date);
  }

  getDate(): (() => INow) {
    let th = this;
    return () => {
      return {
        now: () => {
          th.repeatCnt++;
          let r = new Date(th.date);
          if (th.repeatDays <= th.repeatCnt) {
            th.date.setDate(th.date.getDate() + 1);
          }
          return r;
        }
      };
    };
  }

  registerWith(container: IContainer) {
    let th = this;
    container.register(INow, () => th.getDate());
  }

  private holdDate() {
    let r = new Date(this.date);
    let cnt = this.repeatCnt;
    let th = this;
    return function reset() {
      th.date = r;
      th.repeatCnt = cnt;
    };
  }

  resetAfter<T>(doer: () => T) {
    let reset = this.holdDate();
    try {
      return doer();
    } finally {
      reset();
    }
  }

  peekDate(): Date {
    return new Date(this.date);
  }
}

export class GuidHelper implements IGuid {
  private callback: (() => string);

  get(): string {
    return this.callback();
  }

  constructor(callback: () => string) {
    this.callback = callback;
  }
}

export function clean<T>(value: T | None): T {
  if (value === none) {
    throw new Error("not a valid value");
  }

  return value;
}

export function fakeString(baseValue: string = ''): string {
  return `${baseValue}${uuidV4()}`;
}

export function fakeActivity(): Activity {
  let r = (Math.random() * 100) % 3;

  if (-1 < r && r < 1) {
    return 'Active';
  }

  if (0 < r && r < 2) {
    return 'Non-Active';
  }

  return 'Closed';
}

export function fakeSize(): Size | undefined {
  let r = Math.floor(Math.random() * 7);

  if (-1 < r && r < 1) {
    return 'Extra Large';
  }

  if (0 < r && r < 2) {
    return 'Extra Small';
  }

  if (1 < r && r < 3) {
    return 'Large';
  }

  if (2 < r && r < 4) {
    return 'Medium';
  }

  if (3 < r && r < 5) {
    return undefined;
  }

  if (4 < r && r < 6) {
    return 'Small';
  }

  return 'Tiny';
}

export function cleanFakeSize(size: Size | undefined): Size | Unsized {
  return size ?? 'No Size';
}

export function setupRandomEnvironment(container: IContainer, range: DateRange): DateHelper {
  let dateHelper = new DateHelper(range.getRandom());

  dateHelper.registerWith(container);
  return dateHelper;
}

export function getRandomTask(container: IContainer, activity?: Activity) {
  let taskBuilder: TaskConstructor = container.build(ITask);
  let task = taskBuilder(fakeString(), fakeSize())

  if (activity !== undefined) {
    task.changeState(fakeString('state'), activity);
  }

  return task;
}

export function addRandomTasks(tasks: ITask[], container: IContainer, activity?: Activity) {
  tasks.push(getRandomTask(container, activity));
}

export function addNRandomTasks(tasks: ITask[], container: IContainer, n: number, activity?: Activity) {
  for (let index = 0; index < n; index++) {
    addRandomTasks(tasks, container, activity)
  }
}

export function getRandomBetween(min: number, max: number = 10000) {
  min = Math.floor(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * max) + min;
}

export function getRandomThing(container: IContainer) : any {
  let choice = getRandomBetween(1, 5);
  switch (choice) {
    case 1:
      return fakeString();
    case 2:
      return fakeActivity();
    case 3:
      return fakeSize();
    case 4:
      return getRandomTask(container);
    default:
      return getRandomBetween(-1000, 1000);
  }
}

export function getNRandomThings(container: IContainer, n: number) : any[] {
  let r: any[] = [];

  for (let index = 0; index < n; index++) {
    r.push(getRandomThing(container));
  }

  return r;
}

export function getRandomNOfRandomThings(container: IContainer) : any[] {
  return getNRandomThings(container, getRandomBetween(1, 20));
}
