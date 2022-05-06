import { IContainer } from "@/container";

export abstract class IWalrusBucket {
    // abstract getTasks();

    // abstract getCompleteTasks();
    
    // abstract getActiveTasks();
    
    // abstract getNonActiveTasks();
}

export type WalrusBucketConstructor = () => IWalrusBucket;

class WalrusBucket extends IWalrusBucket{
    
    constructor() {
        super();
    }
}

export function walrusBucketBuilder(factory: IContainer): WalrusBucketConstructor {
    return function (): IWalrusBucket {
        return new WalrusBucket();
    };
}