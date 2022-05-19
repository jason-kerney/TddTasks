import { getContainer, IContainer } from "@/container";
import { IWriter, WriterConstructor } from "@/outputWritter";
import { expect } from "chai";

describe('OutputWriter', () => {
  let container: IContainer;

  beforeEach(() => {
    container = getContainer();
  });

  describe('should', () => {
    it('be registered with container', () => {
      let builder : WriterConstructor = container.build(IWriter);
      expect(builder()).to.be.instanceOf(IWriter);
    });
  });
});

