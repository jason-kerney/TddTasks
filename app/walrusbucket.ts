import { IContainer } from "@/container";
import { isNotImplemented } from "@/interfaceHelper";

export class IWalrusBucket {
    getTasks() {
        isNotImplemented(this.getTasks.name);
    }

    getCompleteTasks() {
        isNotImplemented(this.getCompleteTasks.name);
    }
    
    getActiveTasks() {
        isNotImplemented(this.getActiveTasks.name);
    }
    
    getNonActiveTasks() {
        isNotImplemented(this.getNonActiveTasks.name);
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