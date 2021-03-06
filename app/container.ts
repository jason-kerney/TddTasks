import { IStateChange, stateChangeBuilder } from "./stateChange";
import { ITask, taskBuilder } from "./task";
import { none, None } from "./generalTypes";
import { MapType } from "./map";
import { ITeamBucket, teamBucketBuilder } from "./teamBucket";
import { ITaskFilter, taskFilterBuilder } from "./taskFilter";
import { INow, nowBuilder } from "./now";
import { guidBuilder, IGuid } from "./guid";
import { consoleBuilder, IConsole } from "./consoleWrapper";
import { IWriter, writerBuilder } from "./outputWritter";

export type Builder<T> = (...parameters: any) => T;
export type Factory<T> = (factory: IContainer) => Builder<T>

export abstract class IContainer {
  abstract register<T>(type: abstract new(...parameters: any) => T, factory: Factory<T>) : any;
  abstract build<T>(type: abstract new(...parameters: any) => T) : Builder<T>;
  abstract deregister<T>(type: abstract new(...parameters: any) => T) : void;
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
    this.map[INow.name] = nowBuilder;
    this.map[IStateChange.name] = stateChangeBuilder;
    this.map[ITask.name] = taskBuilder;
    this.map[ITeamBucket.name] = teamBucketBuilder;
    this.map[ITaskFilter.name] = taskFilterBuilder;
    this.map[IGuid.name] = guidBuilder;
    this.map[IConsole.name] = consoleBuilder;
    this.map[IWriter.name] = writerBuilder;
  }

  register<T>(type: abstract new(...parameters: any) => T, factory: Factory<T>) {
    this.alt[type.name] = factory;
  }

  build<T>(type: abstract new(...parameters: any) => T) : Builder<T> {
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

  deregister<T>(type: abstract new(...parameters: any) => T) {
    this.alt[type.name] = undefined;
  }
}

export function getContainer() : IContainer {
  return new Container();
}
