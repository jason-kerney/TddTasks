import { v4 as uuidV4 } from 'uuid';
import { IContainer } from './container';

export abstract class IGuid {
  abstract get(): string;
}

class Guid extends IGuid {
  get(): string {
    return uuidV4();
  }
}

export type GuidConstructor = () => IGuid;

export function guidBuilder(_factory: IContainer): GuidConstructor {
  return function (): IGuid {
    return new Guid();
  };
}
