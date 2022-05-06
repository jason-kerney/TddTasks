import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";

describe('Walrus Bucket should', () => {
    let container: IContainer;
    let walrusBucketConstructor: WalrusBucketConstructor;

    beforeEach(() => {
        container = getContainer();
        walrusBucketConstructor = container.build(IWalrusBucket);
    });

    it('be registered with the container', () => {
        let r = walrusBucketConstructor();

        expect(r).to.be.instanceOf(IWalrusBucket);
    });
});
