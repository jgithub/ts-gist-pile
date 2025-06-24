export function tryGetEnvVar(envVarName: string): string | undefined {
  // @ts-ignore: import.meta may not be recognized depending on tsconfig/module system
  try {
    // Avoid TS1343 by putting this inside a dynamically eval'd function
    const importMeta = new Function('return import.meta')();
    if (typeof importMeta !== 'undefined' && typeof importMeta?.env?.[envVarName] !== 'undefined') {
      // @ts-ignore: TypeScript doesn't know about Vite's import.meta.env
      return importMeta.env[envVarName];
    }
  }
  catch {
    // Safe to ignore — import.meta not available
  }

  if (typeof process !== 'undefined' && typeof process.env?.[envVarName] !== 'undefined') {
    return process.env[envVarName];
  }

  return undefined;
}