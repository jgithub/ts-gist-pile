const memoized = new Map<string, true>();
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
        if (!memoized.has(`import.meta.env.${envVarName}`)) {
          console.log(`ts-gist-pile: tryGetEnvVar(): During logger configuration, found import.meta.env[${envVarName}] = ${retval}`);
          memoized.set(`import.meta.env.${envVarName}`, true);
        }
      }
    }
    catch {
      // Safe to ignore — import.meta not available
    }
  }

  if ( /* typeof window !== "undefined" && */ typeof retval === 'undefined') {
    try {
      // Avoid TS1343 by putting this inside a dynamically eval'd function
      const importMeta = new Function('return import.meta')();
      if (typeof importMeta !== 'undefined' && typeof importMeta?.env?.[`VITE_${envVarName}`] !== 'undefined') {
        // @ts-ignore: TypeScript doesn't know about Vite's import.meta.env
        retval = importMeta.env[`VITE_${envVarName}`];
        if (!memoized.has(`import.meta.env.VITE_${envVarName}`)) {
          console.log(`ts-gist-pile: tryGetEnvVar(): During logger configuration, found import.meta.env[VITE_${envVarName}] = ${retval}`);
          memoized.set(`import.meta.env.VITE_${envVarName}`, true);
        }
      }
    }
    catch {
      // Safe to ignore — import.meta not available
    }
  }  

  if (typeof retval === 'undefined') {
    if (typeof process !== 'undefined' && typeof process.env?.[envVarName] !== 'undefined') {
      retval = process.env[envVarName];
      if (!memoized.has(`process.env.${envVarName}`)) {
        console.log(`ts-gist-pile: tryGetEnvVar(): During logger configuration, found process.env[${envVarName}] = ${retval}`);
        memoized.set(`process.env.${envVarName}`, true);
      }
    }
  }

  if ( /* typeof window !== "undefined" && */ typeof retval === 'undefined') {
    if (typeof process !== 'undefined' && typeof process.env?.[`REACT_${envVarName}`] !== 'undefined') {
      retval = process.env[`REACT_${envVarName}`];
      if (!memoized.has(`process.env.REACT_${envVarName}`)) {
        console.log(`ts-gist-pile: tryGetEnvVar(): During logger configuration, found process.env[REACT_${envVarName}] = ${retval}`);
        memoized.set(`process.env.REACT_${envVarName}`, true);
      }
    }
  }

  return retval;
}