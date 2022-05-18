import { getContainer, IContainer } from "@/container";
import { ITask, TaskConstructor } from "@/task";
import { ITeamBucket, TeamBucketConstructor } from "@/teamBucket";
import { expect } from "chai";
import { fakeSize, fakeString, getRandomBetween } from "./helpers";

describe('Team Bucket', () => {
  let taskConstructor: TaskConstructor;
  let sut: ITeamBucket;
  let tasks: ITask[];

  beforeEach(() => {
    let container: IContainer = getContainer();
    let taskConstructor = container.build(ITask);
    let sutConstructor: TeamBucketConstructor = container.build(ITeamBucket);

    sut = sutConstructor(fakeString());

    tasks = [];
    for (let index = 0; index < getRandomBetween(10, 100); index++) {
      tasks.push(sut.addNew(fakeString(), fakeSize()));
    }
  });

  describe('get priority should', () => {
    it('get the priority for each item when all are non-active', () => {
      tasks.forEach((task, index) => {
        expect(sut.getPriority(task)).to.equal(index + 1);
      });
    });
  });
});
