import { IContainer } from './container';

export abstract class IConsole {
  abstract log(message?: any, ...parameters: any[]) : void;
}

class Console extends IConsole {
  log(message?: any, ...parameters: any[]): void {
    console.log(message, ...parameters);
  }
}

export type ConsoleConstructor = () => IConsole;

export function consoleBuilder(_factory: IContainer): ConsoleConstructor {
  return function (): IConsole {
    return new Console();
  };
}
