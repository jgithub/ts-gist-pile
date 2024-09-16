import { safeStringify } from "../string/safeStringify"

export function d4l(input: string | number | boolean | Error | Array<any> | any, logOptions: LogOptions = {}) {
  if (typeof input === 'undefined') {
    return "<undefined> (undefined)"
  }
  else if (input == null) {
    return "<null> (null)"
  }
  else if (typeof input === 'string') {
    if (logOptions.joinLines) {
      input = input?.replace(/\r\n/g, " ")
      input = input?.replace(/\n\r/g, " ")
      input = input?.replace(/\n/g, " ")
      input = input?.replace(/\r/g, " ")      
    }
    return `'${input}' (string, ${input.length})`
  }
  else if (typeof input === 'number') {
    return `${input} (number)`
  }
  else if (typeof input === 'boolean') {
    return `${input == true ? 'TRUE' : 'FALSE'} (boolean)`
  }
  else if (input instanceof Error) {
    let stackStr: string | undefined = (input as Error).stack
    stackStr = stackStr?.replace(/\r\n/g, "\\n,   ")
    stackStr = stackStr?.replace(/\n\r/g, "\\n,   ")
    stackStr = stackStr?.replace(/\n/g, "\\n,   ")
    stackStr = stackStr?.replace(/\r/g, "\\n,   ")
    return `${input} (Error, stack: ${stackStr}`
  }
  else if (Object.prototype.toString.call(input) === '[object Date]') {
    return (input as Date).toISOString();
  }  
  else if (typeof input === 'object') {
    if (typeof ((input as any).toDebugString) === 'function' ) {
      return (input as any).toDebugString()
    }
    if (typeof ((input as any).toLogString) === 'function' ) {
      return (input as any).toLogString()
    }
    // Do yourself a huge favor and don't mess with toJSON
    // if (typeof ((input as any).toJSON) === 'function' ) {
    //   const whateverToJSONReturns = (input as any).toJSON()
    //   if (typeof whateverToJSONReturns === 'string') {
    //     return whateverToJSONReturns
    //   }
    // }
    if (typeof ((input as any).asJson) === 'function' ) {
      const whateverAsJsonReturns = (input as any).asJson()
      // return whateverAsJsonReturns
      try {
        return safeStringify(whateverAsJsonReturns)
      } catch (err){}
    }
    try {
      return safeStringify(input)
    } catch (err){}
  }
  else if (Array.isArray(input)) {
    const parts: string[] = []

    const inputAsArray = (input as Array<any>)
    if (inputAsArray.length > 0) {
      parts.push(`${d4l(inputAsArray[0])}`)
    }
    if (inputAsArray.length > 2) {
      parts.push(`…`)
    }
    if (inputAsArray.length > 1) {
      parts.push(`${d4l(inputAsArray[inputAsArray.length-1])}`)
    }

    return `Array(len=${inputAsArray.length}) [${parts.join(", ")}]`
  }
  return `${input}`
}

export type LogOptions = {
  joinLines?: boolean
}