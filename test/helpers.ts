//let expectedDate : Date;

import { IContainer } from "@/container";
import { none, None } from "@/generalTypes";

export function clean<T>(value: T | None) : T {
  if(value === none) {
    throw new Error("not a valid value");
  }

  return value;
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

  holdDate() {
    let r = this._date;
    let th = this;
    return function reset() {
      th._date = r;
    };
  }

  peekDate(): Date {
    return this._date;
  }
}
