import { getContainer, IContainer } from "@/container";
import { expect } from "chai";
import { IWalrusBucket, WalrusBucketConstructor } from "@/walrusbucket";
import { ITask, TaskConstructor } from "@/task";
import { TimeHelper } from "./helpers";

describe('Walrus Bucket should', () => {
    let container: IContainer;
    let walrusBucketConstructor: WalrusBucketConstructor;
    let taskConstructor: TaskConstructor;
    let sut: IWalrusBucket;
    let dateHelper : TimeHelper;

    beforeEach(() => {
        container = getContainer();

        dateHelper = new TimeHelper();
        dateHelper.registerWith(container);

        taskConstructor = container.build(ITask);
        walrusBucketConstructor = container.build(IWalrusBucket);
        sut = walrusBucketConstructor();
    });

    it('be registered with the container', () => {
        expect(sut).to.be.instanceOf(IWalrusBucket);
    });

    it('have no tasks when created', () =>{
      expect(sut.getAllTasks()).to.have.lengthOf(0);
    });

    it('allow for an existing task to be added', () => {
      let task = taskConstructor('A task');

      sut.add(task);
      let r = sut.getAllTasks();

      expect(r).to.have.lengthOf(1);
      expect(r[0]).to.deep.equal(task);
    });
});
