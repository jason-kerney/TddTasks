import { IStateChange, stateChangeBuilder } from "./stateChange";
import { ITask, taskBuilder } from "./task";
import { none, None } from "./generalTypes";
import { MapType } from "./map";
import { IWalrusBucket, walrusBucketBuilder } from "./walrusbucket";

export type Builder<T> = (...parameters: any) => T;
export type Factory<T> = (factory: IContainer) => Builder<T>

export abstract class IContainer {
  abstract register<T>(typeName: string, factory: Factory<T>) : any;
  abstract build<T>(typeName: string) : Builder<T>;
  abstract buildA<T>(type: abstract new(...parameters: any) => T) : Builder<T>;
  abstract deregister(typeName: string) : void;
}

function handle<T>(container: IContainer, value: Factory<T> | undefined) : Builder<T> | None {
  if(Boolean(value)) {
    return (value as Factory<T>)(container);
  }

  return none;
}

class Container extends IContainer {
  private map : MapType<Factory<any>> = {};
  private alt : MapType<Factory<any>> = {};

  constructor() {
    super();
    this.map[Date.name] = (_factory) => () => { return new Date(Date.now()) };
    this.map[IStateChange.name] = stateChangeBuilder;
    this.map[ITask.name] = taskBuilder;
    this.map[IWalrusBucket.name] = walrusBucketBuilder;
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
      throw new Error(`No "${typeName}" provider registered`);
    }

    return tmp;
  }

  buildA<T>(type: abstract new(...parameters: any) => T) : Builder<T> {
    const typeName = type.name;
    let tmp = handle(this, this.alt[typeName])
    if (tmp !== none) {
      return tmp;
    }

    tmp = handle(this, this.map[typeName]);
    if (tmp === none) {
      throw new Error(`No "${typeName}" provider registered`);
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
