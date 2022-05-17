import { IConsole } from "./consoleWrapper";
import { IContainer } from "./container";

export abstract class IWriter {
  abstract increaseIndent<T>(fn: () => T): T;
  abstract write(message?: any, ...parameters: any[]): void;
}

class Writer extends IWriter {
  private indent = 0;
  private logger: IConsole;

  constructor(log: IConsole) {
    super();
    this.logger = log;
  }

  increaseIndent<T>(fn: () => T): T {
    try {
      this.indent++;
      return fn();
    }
    finally {
      this.indent--;
      if (this.indent < 0) this.indent = 0;
    }
  }

  write(message?: any, ...parameters: any[]): void {
    message = message ?? '';
    for (let index = 0; index < this.indent; index++) {
      message = '\t' + message;
    }

    this.logger.log(message, ...parameters);
  }
}

export type WriterConstructor = () => IWriter;

export function writerBuilder(factory: IContainer): WriterConstructor {
  return function (): IWriter {
    return new Writer(factory.build(IConsole)());
  };
}
