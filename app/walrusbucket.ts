import { IContainer } from "@/container";
import { ITask } from "./task";

export abstract class IWalrusBucket {
    abstract getAllTasks() : ITask[];

    // abstract getCompleteTasks();

    // abstract getActiveTasks();

    // abstract getNonActiveTasks();
}

export type WalrusBucketConstructor = () => IWalrusBucket;

class WalrusBucket extends IWalrusBucket{
    getAllTasks(): ITask[] {
      return [];
    }

    constructor() {
        super();
    }
}

export function walrusBucketBuilder(factory: IContainer): WalrusBucketConstructor {
    return function (): IWalrusBucket {
        return new WalrusBucket();
    };
}
