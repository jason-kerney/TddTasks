import { IConsole } from "@/consoleWrapper";
import { getContainer, IContainer } from "@/container";
import { IWriter, WriterConstructor } from "@/outputWritter";
import { expect } from "chai";
import { fakeString, getRandomNOfRandomThings } from "./helpers";

describe('OutputWriter', () => {
  let container: IContainer;
  let recMessages: any[];
  let recParameters: Array<any[] | undefined>;
  let sut: IWriter;

  beforeEach(() => {
    recMessages = []
    recParameters = [];

    container = getContainer();
    container.register(IConsole, () => () => {
      return {
        log: (message?: any, ...parameters: any[]) => {
          recMessages.push(message);
          recParameters.push(parameters);
        }
      }
    });

    sut = container.build(IWriter)();
  });

  describe('should', () => {
    it('be registered with container', () => {
      let builder: WriterConstructor = container.build(IWriter);
      expect(builder()).to.be.instanceOf(IWriter);
    });

    it('build only one instance', () => {
      let w2: IWriter = container.build(IWriter)();
      expect(w2).to.equal(sut);
    });

    it('write nothing to console', () => {
      sut.write();

      expect(recMessages).to.have.lengthOf(1);
      expect(recMessages[0], 'message').to.equal('');
      expect(recParameters).to.have.lengthOf(1);
      expect(recParameters[0], 'parameters').to.have.lengthOf(0);
    });

    it('writes a message to console', () => {
      let msg = fakeString();
      sut.write(msg);

      expect(recMessages).to.have.lengthOf(1);
      expect(recMessages[0], 'message').to.equal(msg);
    });

    it('writes parameters to console', () => {
      let msg = fakeString();
      let param = getRandomNOfRandomThings(container);
      sut.write(msg, ...param);

      expect(recParameters).to.have.lengthOf(1);
      expect(recParameters[0]).to.have.lengthOf(param.length);
      param.forEach((p, i) => {
        expect(recParameters[0], `param[${i}]`).to.contain(p);
      });
    });
  });

  describe('increase indent should', () => {
    it('indent message by one', () => {
      let msg = fakeString();
      sut.increaseIndent(() => {
        sut.write(msg);
      });

      expect(recMessages[0]).to.equal(`\t${msg}`);
    });

    it('indent multiple when nested', () => {
      let msg = fakeString();
      sut.increaseIndent(() => {
        sut.increaseIndent(() => {
          sut.write(msg);
        });
      });

      expect(recMessages[0]).to.equal(`\t\t${msg}`);
    });

    it('not indent outside of the increase indent block', () => {
      let msg = fakeString();

      sut.increaseIndent(() => {
        sut.write(fakeString());
      });

      sut.write(msg);

      expect(recMessages[1]).to.equal(msg);
    });

    it('be error tolerant', () => {
      let msg = fakeString();

      try {
        sut.increaseIndent(() => {
          throw new Error("Boom!");

        });
      }
      catch {}

      sut.write(msg);

      expect(recMessages[0]).to.equal(msg);
    });

    it('not de-indent after increasing', () => {
      let msg = `\t${fakeString()}`;

      // this is bad... never do this
      (sut as any).indent--;

      sut.increaseIndent(() => {});

      sut.write(msg);

      expect(recMessages[0]).to.equal(msg);
    });

    it('not de-indent', () => {
      let msg = `\t${fakeString()}`;

      // this is bad... never do this
      (sut as any).indent--;

      sut.write(msg);

      expect(recMessages[0]).to.equal(msg);
    });
  });
});

