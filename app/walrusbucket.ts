import { IContainer } from "@/container";

export class IWalrusBucket {
    getTasks() {
        throw new Error('Method getTasks not implemented');
    }

    getCompleteTasks() {
        throw new Error('Method getTasks not implemented');
    }
    
    getActiveTasks() {
        throw new Error('Method getTasks not implemented');
    }
    
    getNonActiveTasks() {
        throw new Error('Method getTasks not implemented');
    }
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