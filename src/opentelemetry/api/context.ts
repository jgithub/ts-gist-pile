import { getLogger } from '../../log/getLogger'

const LOG = getLogger('opentelemetry.context')

export interface Context {
  getValue(key: symbol): unknown
  setValue(key: symbol, value: unknown): Context
  deleteValue(key: symbol): Context
}

export interface ContextAPI {
  active(): Context
  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F>
  bind<T>(context: Context, target: T): T
  disable(): void
  createKey(description: string): symbol
}

class BaseContext implements Context {
  private _currentContext: Map<symbol, unknown>

  constructor(parentContext?: Map<symbol, unknown>) {
    this._currentContext = parentContext ? new Map(parentContext) : new Map()
  }

  getValue(key: symbol): unknown {
    return this._currentContext.get(key)
  }

  setValue(key: symbol, value: unknown): Context {
    const context = new BaseContext(this._currentContext)
    context._currentContext.set(key, value)
    return context
  }

  deleteValue(key: symbol): Context {
    const context = new BaseContext(this._currentContext)
    context._currentContext.delete(key)
    return context
  }
}

let activeContext = new BaseContext()

export const context: ContextAPI = {
  active(): Context {
    return activeContext
  },

  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    context: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    const previousContext = activeContext
    activeContext = context as BaseContext
    
    LOG.info('Context switched', {
      previous_context_keys: Array.from((previousContext as any)._currentContext?.keys() || []).map((k: any) => String(k.toString())),
      new_context_keys: Array.from((context as any)._currentContext?.keys() || []).map((k: any) => String(k.toString()))
    })
    
    try {
      return fn.call(thisArg as any, ...args)
    } finally {
      activeContext = previousContext
      LOG.info('Context restored', {
        restored_context_keys: Array.from((activeContext as any)._currentContext?.keys() || []).map((k: any) => String(k.toString()))
      })
    }
  },

  bind<T>(context: Context, target: T): T {
    return target
  },

  disable(): void {
    activeContext = new BaseContext()
    LOG.info('Context API disabled')
  },

  createKey(description: string): symbol {
    const key = Symbol(description)
    LOG.info('Context key created', { description })
    return key
  }
}
