import { describe, it } from 'mocha';
import { expect } from 'chai';
import { Container } from '../../src/di/Container';
import { DateProviderService } from '../../src/date/DateProviderService';
import { DateProviderServiceImpl } from '../../src/date/DateProviderServiceImpl';

// Example service interfaces and implementations
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  public log(message: string): void {
    console.log(message);
  }
}

interface UserService {
  getUser(id: string): string;
  getCreatedAt(): Date;
}

class UserServiceImpl implements UserService {
  private readonly dateProvider: DateProviderService;

  constructor(dateProvider: DateProviderService) {
    this.dateProvider = dateProvider;
  }

  public getUser(id: string): string {
    return `User ${id}`;
  }

  public getCreatedAt(): Date {
    return this.dateProvider.getNow();
  }
}

// Service identifiers (like DI_TYPES in relito)
const TYPES = {
  Logger: 'Logger',
  DateProviderService: 'DateProviderService',
  UserService: 'UserService',
  SymbolTest: Symbol('SymbolTest'),
};

describe('Container', () => {
  describe('bind and get', () => {
    it('should bind and retrieve a service', () => {
      const container = new Container();
      const logger = new ConsoleLogger();

      container.bind<Logger>(TYPES.Logger).toConstantValue(logger);

      const retrieved = container.get<Logger>(TYPES.Logger);
      expect(retrieved).to.equal(logger);
    });

    it('should support dependency injection pattern', () => {
      const container = new Container();

      // Register dependencies in order (dependency first, then dependent service)
      const dateProvider = new DateProviderServiceImpl();
      container.bind<DateProviderService>(TYPES.DateProviderService).toConstantValue(dateProvider);

      const userService = new UserServiceImpl(dateProvider);
      container.bind<UserService>(TYPES.UserService).toConstantValue(userService);

      // Retrieve services
      const retrievedDateProvider = container.get<DateProviderService>(TYPES.DateProviderService);
      const retrievedUserService = container.get<UserService>(TYPES.UserService);

      expect(retrievedDateProvider).to.equal(dateProvider);
      expect(retrievedUserService).to.equal(userService);
      expect(retrievedUserService.getUser('123')).to.equal('User 123');
      expect(retrievedUserService.getCreatedAt()).to.be.instanceOf(Date);
    });

    it('should support Symbol as service identifier', () => {
      const container = new Container();
      const value = { test: 'value' };

      container.bind<typeof value>(TYPES.SymbolTest).toConstantValue(value);

      const retrieved = container.get<typeof value>(TYPES.SymbolTest);
      expect(retrieved).to.equal(value);
    });

    it('should throw error when retrieving unbound service', () => {
      const container = new Container();

      expect(() => container.get<Logger>('NonExistent')).to.throw(
        'No binding found for service identifier: NonExistent'
      );
    });

    it('should throw error with symbol identifier when retrieving unbound service', () => {
      const container = new Container();
      const symbolKey = Symbol('test');

      expect(() => container.get<Logger>(symbolKey)).to.throw(
        'No binding found for service identifier: Symbol(test)'
      );
    });
  });

  describe('isBound', () => {
    it('should return true for bound service', () => {
      const container = new Container();
      const logger = new ConsoleLogger();

      container.bind<Logger>(TYPES.Logger).toConstantValue(logger);

      expect(container.isBound(TYPES.Logger)).to.be.true;
    });

    it('should return false for unbound service', () => {
      const container = new Container();

      expect(container.isBound(TYPES.Logger)).to.be.false;
    });
  });

  describe('unbind', () => {
    it('should remove a binding', () => {
      const container = new Container();
      const logger = new ConsoleLogger();

      container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
      expect(container.isBound(TYPES.Logger)).to.be.true;

      const removed = container.unbind(TYPES.Logger);
      expect(removed).to.be.true;
      expect(container.isBound(TYPES.Logger)).to.be.false;
    });

    it('should return false when unbinding non-existent service', () => {
      const container = new Container();

      const removed = container.unbind('NonExistent');
      expect(removed).to.be.false;
    });
  });

  describe('rebind', () => {
    it('should replace an existing binding', () => {
      const container = new Container();
      const logger1 = new ConsoleLogger();
      const logger2 = new ConsoleLogger();

      container.bind<Logger>(TYPES.Logger).toConstantValue(logger1);
      expect(container.get<Logger>(TYPES.Logger)).to.equal(logger1);

      container.rebind<Logger>(TYPES.Logger).toConstantValue(logger2);
      expect(container.get<Logger>(TYPES.Logger)).to.equal(logger2);
    });

    it('should create a binding if one does not exist', () => {
      const container = new Container();
      const logger = new ConsoleLogger();

      expect(container.isBound(TYPES.Logger)).to.be.false;

      container.rebind<Logger>(TYPES.Logger).toConstantValue(logger);
      expect(container.isBound(TYPES.Logger)).to.be.true;
      expect(container.get<Logger>(TYPES.Logger)).to.equal(logger);
    });

    it('should be useful for mocking in tests', () => {
      const container = new Container();

      // Original binding
      const realLogger = new ConsoleLogger();
      container.bind<Logger>(TYPES.Logger).toConstantValue(realLogger);

      // Mock for testing
      const mockLogger: Logger = {
        log: (message: string) => {
          // Mock implementation
        },
      };

      container.rebind<Logger>(TYPES.Logger).toConstantValue(mockLogger);
      expect(container.get<Logger>(TYPES.Logger)).to.equal(mockLogger);
    });
  });

  describe('unbindAll', () => {
    it('should remove all bindings', () => {
      const container = new Container();
      const logger = new ConsoleLogger();
      const dateProvider = new DateProviderServiceImpl();
      const userService = new UserServiceImpl(dateProvider);

      container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
      container.bind<UserService>(TYPES.UserService).toConstantValue(userService);

      expect(container.size).to.equal(2);

      container.unbindAll();

      expect(container.size).to.equal(0);
      expect(container.isBound(TYPES.Logger)).to.be.false;
      expect(container.isBound(TYPES.UserService)).to.be.false;
    });
  });

  describe('size', () => {
    it('should return the number of bindings', () => {
      const container = new Container();

      expect(container.size).to.equal(0);

      const logger = new ConsoleLogger();
      container.bind<Logger>(TYPES.Logger).toConstantValue(logger);

      expect(container.size).to.equal(1);

      const dateProvider = new DateProviderServiceImpl();
      const userService = new UserServiceImpl(dateProvider);
      container.bind<UserService>(TYPES.UserService).toConstantValue(userService);

      expect(container.size).to.equal(2);
    });
  });

  describe('usage example matching relito pattern', () => {
    it('should work exactly like inversify pattern from relito', () => {
      // This mimics the pattern from relito/lito/src/inversify.config.ts
      const container = new Container();

      const DI_TYPES = {
        DateProviderService: 'DateProviderService',
        WhoAmIService: 'WhoAmIService',
      };

      interface DateProviderService {
        getNow(): Date;
      }

      interface WhoAmIService {
        getCurrentUserId(): string | null;
      }

      // Manual instantiation (like in relito)
      const dateProviderService: DateProviderService = {
        getNow: () => new Date(),
      };

      const whoAmIService: WhoAmIService = {
        getCurrentUserId: () => 'user-123',
      };

      // Bind services
      container.bind<DateProviderService>(DI_TYPES.DateProviderService).toConstantValue(dateProviderService);
      container.bind<WhoAmIService>(DI_TYPES.WhoAmIService).toConstantValue(whoAmIService);

      // Retrieve services (like in relito's AppRunner.ts)
      const retrievedDateService = container.get<DateProviderService>(DI_TYPES.DateProviderService);
      const retrievedWhoAmIService = container.get<WhoAmIService>(DI_TYPES.WhoAmIService);

      expect(retrievedDateService).to.equal(dateProviderService);
      expect(retrievedWhoAmIService).to.equal(whoAmIService);
      expect(retrievedWhoAmIService.getCurrentUserId()).to.equal('user-123');
    });
  });
});
