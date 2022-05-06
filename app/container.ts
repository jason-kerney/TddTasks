import { stateChangeBuilder } from "./stateChange";
import { taskBuilder } from "./task";
import { none, None } from "./taskInterfaces";

export type Builder<T> = (...parameters: any) => T;
export type Factory<T> = (factory: IContainer) => Builder<T>

export interface IContainer {
  register<T>(typeName: string, factory: Factory<T>) : any;
  build<T>(typeName: string) : Builder<T>;
  deregister(typeName: string);
}

type MapType = {
  [id: string]: Factory<any> | undefined;
}

function handle<T>(container: IContainer, value: Factory<T> | undefined) : Builder<T> | None {
  if(Boolean(value)) {
    return (value as Factory<T>)(container);
  }

  return none;
}

class Container implements IContainer {
  private map : MapType = {};
  private alt : MapType = {};

  constructor() {
    this.map['Now'] = (_factory) => () => { return new Date(Date.now()) };
    this.map['IStateChange'] = stateChangeBuilder;
    this.map['ITask'] = taskBuilder;
  }

  register<T>(typeName: string, factory: Factory<T>) {
    this.alt[typeName] = factory;
  }

  build<T>(typeName: string) : Builder<T> {
    let tmp = handle(this, this.alt[typeName])
    if (tmp !== none) {
      return tmp;
    }

    tmp = handle(this, this.map[typeName]);
    if (tmp === none) {
      throw `No "${typeName}" provider registered`;
    }

    return tmp;
  }

  deregister(typeName: string) {
    this.alt[typeName] = undefined;
  }
}

export function getContainer() : IContainer {
  return new Container();
}
