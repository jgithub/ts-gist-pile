import { expect } from 'chai';
import { tryCatchTuplify, tryCatchTuplifyAsync } from '../../src/try/tryUtil';

describe('tryUtil', () => {
  describe('.tryCatchTuplify()', () => {
    describe('when function succeeds', () => {
      it('returns [result, null]', () => {
        const fn = () => 42;
        const [result, error] = tryCatchTuplify(fn);

        expect(result).to.equal(42);
        expect(error).to.be.null;
      });

      it('works with string return', () => {
        const fn = () => 'hello';
        const [result, error] = tryCatchTuplify(fn);

        expect(result).to.equal('hello');
        expect(error).to.be.null;
      });

      it('works with object return', () => {
        const fn = () => ({ id: 1, name: 'John' });
        const [result, error] = tryCatchTuplify(fn);

        expect(result).to.deep.equal({ id: 1, name: 'John' });
        expect(error).to.be.null;
      });

      it('works with array return', () => {
        const fn = () => [1, 2, 3];
        const [result, error] = tryCatchTuplify(fn);

        expect(result).to.deep.equal([1, 2, 3]);
        expect(error).to.be.null;
      });
    });

    describe('when function throws', () => {
      it('returns [null, error]', () => {
        const fn = () => {
          throw new Error('Something went wrong');
        };
        const [result, error] = tryCatchTuplify(fn);

        expect(result).to.be.null;
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Something went wrong');
      });

      it('captures string throw', () => {
        const fn = () => {
          throw 'string error';
        };
        const [result, error] = tryCatchTuplify(fn);

        expect(result).to.be.null;
        expect(error).to.equal('string error');
      });

      it('captures custom error type', () => {
        class CustomError extends Error {
          public code: number;
          constructor(code: number, message: string) {
            super(message);
            this.code = code;
            // Set the prototype explicitly for instanceof to work
            Object.setPrototypeOf(this, CustomError.prototype);
          }
        }

        const fn = () => {
          throw new CustomError(404, 'Not found');
        };
        const [result, error] = tryCatchTuplify<any, CustomError>(fn);

        expect(result).to.be.null;
        expect(error).to.be.instanceOf(CustomError);
        expect(error?.code).to.equal(404);
        expect(error?.message).to.equal('Not found');
      });

      it('captures object throw', () => {
        const fn = () => {
          throw { code: 500, message: 'Server error' };
        };
        const [result, error] = tryCatchTuplify(fn);

        expect(result).to.be.null;
        expect(error).to.deep.equal({ code: 500, message: 'Server error' });
      });
    });
  });

  describe('.tryCatchTuplifyAsync()', () => {
    describe('when promise resolves', () => {
      it('returns [result, null]', async () => {
        const promise = Promise.resolve(42);
        const [result, error] = await tryCatchTuplifyAsync(promise);

        expect(result).to.equal(42);
        expect(error).to.be.null;
      });

      it('works with string resolution', async () => {
        const promise = Promise.resolve('hello');
        const [result, error] = await tryCatchTuplifyAsync(promise);

        expect(result).to.equal('hello');
        expect(error).to.be.null;
      });

      it('works with object resolution', async () => {
        const promise = Promise.resolve({ id: 1, name: 'John' });
        const [result, error] = await tryCatchTuplifyAsync(promise);

        expect(result).to.deep.equal({ id: 1, name: 'John' });
        expect(error).to.be.null;
      });

      it('works with delayed resolution', async () => {
        const promise = new Promise<number>((resolve) => {
          setTimeout(() => resolve(42), 10);
        });
        const [result, error] = await tryCatchTuplifyAsync(promise);

        expect(result).to.equal(42);
        expect(error).to.be.null;
      });
    });

    describe('when promise rejects', () => {
      it('returns [null, error]', async () => {
        const promise = Promise.reject(new Error('Something went wrong'));
        const [result, error] = await tryCatchTuplifyAsync(promise);

        expect(result).to.be.null;
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Something went wrong');
      });

      it('captures string rejection', async () => {
        const promise = Promise.reject('string error');
        const [result, error] = await tryCatchTuplifyAsync(promise);

        expect(result).to.be.null;
        expect(error).to.equal('string error');
      });

      it('captures custom error type', async () => {
        class CustomError extends Error {
          public code: number;
          constructor(code: number, message: string) {
            super(message);
            this.code = code;
            // Set the prototype explicitly for instanceof to work
            Object.setPrototypeOf(this, CustomError.prototype);
          }
        }

        const promise = Promise.reject(new CustomError(404, 'Not found'));
        const [result, error] = await tryCatchTuplifyAsync<any, CustomError>(promise);

        expect(result).to.be.null;
        expect(error).to.be.instanceOf(CustomError);
        expect(error?.code).to.equal(404);
        expect(error?.message).to.equal('Not found');
      });

      it('captures object rejection', async () => {
        const promise = Promise.reject({ code: 500, message: 'Server error' });
        const [result, error] = await tryCatchTuplifyAsync(promise);

        expect(result).to.be.null;
        expect(error).to.deep.equal({ code: 500, message: 'Server error' });
      });

      it('works with delayed rejection', async () => {
        const promise = new Promise<number>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 10);
        });
        const [result, error] = await tryCatchTuplifyAsync(promise);

        expect(result).to.be.null;
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Timeout');
      });
    });

    describe('integration with async functions', () => {
      it('works with async function that succeeds', async () => {
        const asyncFn = async () => {
          return await Promise.resolve(42);
        };

        const [result, error] = await tryCatchTuplifyAsync(asyncFn());

        expect(result).to.equal(42);
        expect(error).to.be.null;
      });

      it('works with async function that throws', async () => {
        const asyncFn = async () => {
          throw new Error('Async error');
        };

        const [result, error] = await tryCatchTuplifyAsync(asyncFn());

        expect(result).to.be.null;
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Async error');
      });
    });
  });
});
