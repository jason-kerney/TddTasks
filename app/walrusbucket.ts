import { IContainer } from "@/container";

export interface IWalrusBucket {
}

export type WalrusBucketConstructor = () => IWalrusBucket;

class WalrusBucket implements IWalrusBucket{
    getTasks() {}
    getCompleteTasks() {}
    getActiveTasks() {}
    getNonActiveTasks() {}
}

export function walrusBucketBuilder(factory: IContainer): WalrusBucketConstructor {
    return function (): IWalrusBucket {
        return new WalrusBucket();
    };
}