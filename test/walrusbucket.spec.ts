import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { ITask, TaskConstructor } from "@/task";

describe('Walrus Bucket should', () => {
    let container: IContainer;
    let walrusBucketConstructor: WalrusBucketConstructor;
    let taskConstructor: TaskConstructor;

    beforeEach(() => {
        container = getContainer();
        taskConstructor = container.build(ITask);
        walrusBucketConstructor = container.build(IWalrusBucket);
    });

    it('be registered with the container', () => {
        let r = walrusBucketConstructor();

        expect(r).to.be.instanceOf(IWalrusBucket);
    });

    it('have no tasks when created', () =>{
      let r = walrusBucketConstructor();

      expect(r.getAllTasks()).to.have.lengthOf(0);
    });
});
