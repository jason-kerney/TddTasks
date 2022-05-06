import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";

describe('Walrus Bucket should', () => {
    let container: IContainer;
    let walrusBucketConstructor: WalrusBucketConstructor;

    beforeEach(() => {
        container = getContainer();
        walrusBucketConstructor = container.build<IWalrusBucket>('IWalrusBucket');
    });

    it('be registered with the container', () => {
        let r = walrusBucketConstructor();

        expect(r).to.have.property('getTasks');
        expect(r).to.have.property('getCompleteTasks');
        expect(r).to.have.property('getActiveTasks');
        expect(r).to.have.property('getNonActiveTasks');
    });
});