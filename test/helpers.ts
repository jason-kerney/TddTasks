//let expectedDate : Date;

import { IContainer } from "@/container";
import { Activity, none, None, Size } from "@/generalTypes";
import { IWalrusBucket } from "@/walrusbucket";
import { v4 as uuidv4 } from 'uuid';

export class DateRange {
  private start: number;
  private end: number;
  constructor(start: Date | number, end: Date | number) {
    if(end < start) {
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

  getRandom() : Date {
    const msInDay = 24 * 60 * 60 * 1000
    let sDate = new Date(this.start);

    let maxDays = Math.abs(this.end - this.start) / msInDay

    let days = Math.floor(Math.random() * maxDays);

    return new Date(sDate.setDate(sDate.getDate() + days));
  }

  getStart() : Date {
    return new Date(this.start);
  }

  getEnd() : Date {
    return new Date(this.end);
  }
}

export class DateHelper {
  private date: Date;

  constructor(init: Date | string = '3/14/1592') {
    this.date = new Date(init);
  }

  setDate(date: Date) {
    this.date = date;
  }

  getDate(): () => Date {
    let th = this;
    return function () {
      let r = new Date(th.date);
      th.date.setDate(th.date.getDate() + 1);
      return r;
    };
  }

  registerWith(container: IContainer) {
    let th = this;
    container.register(Date, () => th.getDate());
  }

  private holdDate() {
    let r = new Date(this.date);
    let th = this;
    return function reset() {
      th.date = r;
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

export function clean<T>(value: T | None) : T {
  if(value === none) {
    throw new Error("not a valid value");
  }

  return value;
}

export function fakeString(baseValue: string = '') : string {
  let g = uuidv4();
  return `${baseValue}${g}`;
}

export function fakeActivity() : Activity {
  let r = (Math.random() * 100) % 3;

  if (-1 < r && r < 1) {
    return 'Active';
  }

  if(0 < r && r < 2) {
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

export function setupRandomEnvironment(container: IContainer, range: DateRange): DateHelper {
  let dateHelper = new DateHelper(range.getRandom());

  dateHelper.registerWith(container);
  return dateHelper;
}

export function addRandomTasks(bucket: IWalrusBucket, activity?: Activity) {
  let task = bucket.addNew(fakeString(), fakeSize())

  if (activity !== undefined) {
    task.changeState(fakeString('state'), activity);
  }
}

export function addNRandomTasks(bucket: IWalrusBucket, n : number, activity?: Activity) {
  for (let index = 0; index < n; index++) {
    addRandomTasks(bucket, activity)
  }
}

export function getRandomBetween(min: number, max: number = 10000) {
  min = Math.floor(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * max) + min;
}
