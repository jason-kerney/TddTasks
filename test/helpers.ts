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
      this.start = start.getDate();
    }

    if (typeof end === 'number') {
      this.end = end;
    }
    else {
      this.end = end.getDate();
    }
  }

  getRandom() : Date {
    const msInDay = 24 * 60 * 60 * 1000
    let sDate = new Date(new Date(this.start).getUTCDate());
    let eDate = new Date(new Date(this.end).getUTCDate());

    let maxDays = Math.abs(eDate.getTime() - sDate.getTime()) / msInDay

    let days = Math.floor(Math.random() * maxDays);

    return new Date(sDate.setDate(sDate.getDate() + days));
  }
}

export class TimeHelper {
  private _date: Date;

  constructor(init: Date | string = '3/14/1592') {
    if (init instanceof Date) {
      this._date = init;
      return;
    }

    this._date = new Date(init);
  }

  getDate(): () => Date {
    let th = this;
    return function () {
      let r = th._date;
      th._date.setDate(th._date.getDate() + 1);
      return r;
    };
  }

  registerWith(container: IContainer) {
    let th = this;
    container.register(Date, () => th.getDate());
  }

  private holdDate() {
    let r = this._date;
    let th = this;
    return function reset() {
      th._date = r;
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
    return this._date;
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

export function setupRandomEnvironment(container: IContainer, range: DateRange) {
  let dateHelper = new TimeHelper(range.getRandom());

  dateHelper.registerWith(container);
}

export function addRandomTasks(bucket: IWalrusBucket, activity?: Activity) {
  bucket.addNew(fakeString(), fakeSize())

  if (activity !== undefined) {

  }
}

export function addNRandomTasks(bucket: IWalrusBucket, n : number, activity?: Activity) {
  for (let index = 0; index < n; index++) {
    addRandomTasks(bucket)
  }
}
