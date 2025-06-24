export function tryGetEnvVar(envVarName: string): string | undefined {
  // @ts-ignore: import.meta may not be recognized depending on tsconfig/module system
  let retval: string | undefined = undefined;

  if (typeof retval === 'undefined') {
    try {
      // Avoid TS1343 by putting this inside a dynamically eval'd function
      const importMeta = new Function('return import.meta')();
      if (typeof importMeta !== 'undefined' && typeof importMeta?.env?.[envVarName] !== 'undefined') {
        // @ts-ignore: TypeScript doesn't know about Vite's import.meta.env
        retval = importMeta.env[envVarName];
      }
    }
    catch {
      // Safe to ignore — import.meta not available
    }
  }

  if (typeof window !== "undefined" && typeof retval === 'undefined') {
    try {
      // Avoid TS1343 by putting this inside a dynamically eval'd function
      const importMeta = new Function('return import.meta')();
      if (typeof importMeta !== 'undefined' && typeof importMeta?.env?.[envVarName] !== 'undefined') {
        // @ts-ignore: TypeScript doesn't know about Vite's import.meta.env
        retval = importMeta.env[`VITE_` + envVarName];
      }
    }
    catch {
      // Safe to ignore — import.meta not available
    }
  }  

  if (typeof retval === 'undefined') {
    if (typeof process !== 'undefined' && typeof process.env?.[envVarName] !== 'undefined') {
      return process.env[envVarName];
    }
  }

  if (typeof window !== "undefined" && typeof retval === 'undefined') {
    if (typeof process !== 'undefined' && typeof process.env?.[envVarName] !== 'undefined') {
      return process.env[`REACT_` + envVarName];
    }
  }

  return undefined;
}