import { expect } from 'chai';
import { LlmQueryImpl } from '../../src/llm/LlmQueryImpl';
import { LlmQuery } from '../../src/llm/LlmQuery';
import { LlmQAndA } from '../../src/llm/LlmQAndA';

describe('LlmQueryImpl', () => {
  describe('constructor', () => {
    it('initializes with empty LlmQuery', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);

      expect(impl.prompt).to.be.undefined;
      expect(impl.additionalContext).to.be.undefined;
      expect(impl.qAndA).to.be.undefined;
    });

    it('initializes with provided LlmQuery', () => {
      const query: LlmQuery = {
        prompt: 'What is the weather?',
        additionalContext: { location: 'NYC' },
        qAndA: []
      };

      const impl = new LlmQueryImpl(query);

      expect(impl.prompt).to.equal('What is the weather?');
      expect(impl.additionalContext).to.deep.equal({ location: 'NYC' });
      expect(impl.qAndA).to.be.an('array').that.is.empty;
    });

    it('handles null input by creating empty object', () => {
      const impl = new LlmQueryImpl(null as any);

      expect(impl.prompt).to.be.undefined;
      expect(impl.additionalContext).to.be.undefined;
      expect(impl.qAndA).to.be.undefined;
    });
  });

  describe('prompt getter and setter', () => {
    it('sets and gets prompt', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);

      impl.prompt = 'Tell me a joke';

      expect(impl.prompt).to.equal('Tell me a joke');
    });

    it('updates existing prompt', () => {
      const query: LlmQuery = {
        prompt: 'Original prompt',
        additionalContext: {},
        qAndA: []
      };
      const impl = new LlmQueryImpl(query);

      impl.prompt = 'Updated prompt';

      expect(impl.prompt).to.equal('Updated prompt');
    });
  });

  describe('additionalContext getter and setter', () => {
    it('sets and gets additionalContext as object', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);
      const context = { userId: '123', role: 'admin' };

      impl.additionalContext = context;

      expect(impl.additionalContext).to.deep.equal(context);
    });

    it('sets and gets additionalContext as array', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);
      const context = [{ id: 'item1' }, { id: 'item2' }, { id: 'item3' }];

      impl.additionalContext = context;

      expect(impl.additionalContext).to.deep.equal(context);
    });

    it('updates existing additionalContext', () => {
      const query: LlmQuery = {
        prompt: 'Test',
        additionalContext: { old: 'value' },
        qAndA: []
      };
      const impl = new LlmQueryImpl(query);

      impl.additionalContext = { new: 'value' };

      expect(impl.additionalContext).to.deep.equal({ new: 'value' });
    });
  });

  describe('qAndA getter and setter', () => {
    it('sets and gets qAndA array', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);
      const qAndA: LlmQAndA[] = [
        { question: 'Q1', answer: 'A1', answerMeta: { score: 0.9 } },
        { question: 'Q2', answer: 'A2', answerMeta: { score: 0.8 } }
      ];

      impl.qAndA = qAndA;

      expect(impl.qAndA).to.deep.equal(qAndA);
    });

    it('replaces existing qAndA array', () => {
      const query: LlmQuery = {
        prompt: 'Test',
        additionalContext: {},
        qAndA: [{ question: 'Old Q', answer: '', answerMeta: { score: 0 } }]
      };
      const impl = new LlmQueryImpl(query);

      impl.qAndA = [{ question: 'New Q', answer: '', answerMeta: { score: 0 } }];

      expect(impl.qAndA).to.have.lengthOf(1);
      expect(impl.qAndA[0].question).to.equal('New Q');
    });
  });

  describe('addQuestion', () => {
    it('adds a question to empty qAndA', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);

      impl.addQuestion('What is your name?');

      expect(impl.qAndA).to.be.an('array');
      expect(impl.qAndA).to.have.lengthOf(1);
      expect(impl.qAndA[0].question).to.equal('What is your name?');
    });

    it('adds a question to existing qAndA', () => {
      const query: LlmQuery = {
        prompt: 'Test',
        additionalContext: {},
        qAndA: [{ question: 'First question', answer: '', answerMeta: { score: 0 } }]
      };
      const impl = new LlmQueryImpl(query);

      impl.addQuestion('Second question');

      expect(impl.qAndA).to.have.lengthOf(2);
      expect(impl.qAndA[0].question).to.equal('First question');
      expect(impl.qAndA[1].question).to.equal('Second question');
    });

    it('adds multiple questions sequentially', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);

      impl.addQuestion('Q1');
      impl.addQuestion('Q2');
      impl.addQuestion('Q3');

      expect(impl.qAndA).to.have.lengthOf(3);
      expect(impl.qAndA[0].question).to.equal('Q1');
      expect(impl.qAndA[1].question).to.equal('Q2');
      expect(impl.qAndA[2].question).to.equal('Q3');
    });

    it('initializes qAndA array if undefined', () => {
      const impl = new LlmQueryImpl({ prompt: 'Test' } as LlmQuery);

      expect(impl.qAndA).to.be.undefined;

      impl.addQuestion('First question');

      expect(impl.qAndA).to.be.an('array');
      expect(impl.qAndA).to.have.lengthOf(1);
    });

    it('handles empty string question', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);

      impl.addQuestion('');

      expect(impl.qAndA).to.have.lengthOf(1);
      expect(impl.qAndA[0].question).to.equal('');
    });

    it('handles long question text', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);
      const longQuestion = 'A'.repeat(1000);

      impl.addQuestion(longQuestion);

      expect(impl.qAndA[0].question).to.have.lengthOf(1000);
    });
  });

  describe('integration scenarios', () => {
    it('builds a complete query step by step', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);

      impl.prompt = 'Help me understand this topic';
      impl.additionalContext = { domain: 'science', level: 'beginner' };
      impl.addQuestion('What is quantum mechanics?');
      impl.addQuestion('Can you explain entanglement?');

      expect(impl.prompt).to.equal('Help me understand this topic');
      expect(impl.additionalContext).to.deep.equal({ domain: 'science', level: 'beginner' });
      expect(impl.qAndA).to.have.lengthOf(2);
      expect(impl.qAndA[0].question).to.equal('What is quantum mechanics?');
      expect(impl.qAndA[1].question).to.equal('Can you explain entanglement?');
    });

    it('modifies an existing query', () => {
      const query: LlmQuery = {
        prompt: 'Original prompt',
        additionalContext: { version: 1 },
        qAndA: [{ question: 'Q1', answer: '', answerMeta: { score: 0 } }]
      };
      const impl = new LlmQueryImpl(query);

      impl.prompt = 'Modified prompt';
      impl.additionalContext = { version: 2 };
      impl.addQuestion('Q2');

      expect(impl.prompt).to.equal('Modified prompt');
      expect(impl.additionalContext).to.deep.equal({ version: 2 });
      expect(impl.qAndA).to.have.lengthOf(2);
    });

    it('clears qAndA by setting empty array', () => {
      const query: LlmQuery = {
        prompt: 'Test',
        additionalContext: {},
        qAndA: [
          { question: 'Q1', answer: '', answerMeta: { score: 0 } },
          { question: 'Q2', answer: '', answerMeta: { score: 0 } }
        ]
      };
      const impl = new LlmQueryImpl(query);

      impl.qAndA = [];

      expect(impl.qAndA).to.be.an('array').that.is.empty;
    });
  });

  describe('edge cases', () => {
    it('handles undefined prompt gracefully', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);

      expect(impl.prompt).to.be.undefined;
      expect(() => impl.prompt).to.not.throw();
    });

    it('handles undefined additionalContext gracefully', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);

      expect(impl.additionalContext).to.be.undefined;
      expect(() => impl.additionalContext).to.not.throw();
    });

    it('handles undefined qAndA gracefully', () => {
      const impl = new LlmQueryImpl({} as LlmQuery);

      expect(impl.qAndA).to.be.undefined;
      expect(() => impl.qAndA).to.not.throw();
    });

    it('preserves reference to original query object', () => {
      const query: LlmQuery = {
        prompt: 'Test',
        additionalContext: {},
        qAndA: []
      };
      const impl = new LlmQueryImpl(query);

      impl.prompt = 'Modified';

      // The original query object should be modified (mutable behavior)
      expect(query.prompt).to.equal('Modified');
    });
  });
});
