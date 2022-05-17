import { IContainer } from "./container";

export abstract class INow {
  abstract now() : Date;
}

class Now extends INow {
  now(): Date {
    return new Date(Date.now());
  }
}

export type NowConstructor = () => INow;

export function nowBuilder(factory: IContainer): NowConstructor {
  return function (): INow {
    return new Now();
  };
}
