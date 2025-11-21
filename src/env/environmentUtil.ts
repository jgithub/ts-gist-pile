

const memoized = new Map<string, true>();

/**
 * Resets the memoization cache for tryGetEnvVar.
 * This is primarily useful for testing.
 * @internal
 */
export function resetEnvVarCache(): void {
  memoized.clear();
}

export function tryGetEnvVar(envVarName: string): string | undefined {
  // @ts-ignore: import.meta may not be recognized depending on tsconfig/module system
  let retval: string | undefined = undefined;

  if (typeof retval === 'undefined') {
    if (typeof process !== 'undefined' && typeof process.env?.[envVarName] !== 'undefined') {
      retval = process.env[envVarName];
      if (!memoized.has(`process.env.${envVarName}`)) {
        console.log(`ts-gist-pile: tryGetEnvVar(): During logger configuration, found process.env[${envVarName}] = ${retval}`);
        memoized.set(`process.env.${envVarName}`, true);
      }
    }
  }

  const prefixes = [`REACT_APP_`, `VITE_`]
  for (let ii = 0; ii < prefixes.length; ++ii) {
    const prefix = prefixes[ii]

    if (/* typeof window !== "undefined" && */ typeof retval === 'undefined') {
      const effectiveEnvVarName = `${prefix}${envVarName}`;

      if (typeof process !== 'undefined' && typeof process.env?.[effectiveEnvVarName] !== 'undefined') {
        retval = process.env[effectiveEnvVarName];
        if (!memoized.has(`process.env.${effectiveEnvVarName}`)) {
          console.log(`ts-gist-pile: tryGetEnvVar(): During logger configuration, found process.env[${effectiveEnvVarName}] = ${retval}`);
          memoized.set(`process.env.${effectiveEnvVarName}`, true);
        }
      }
    }
  }

  return retval;
}

export function isProductionLikeEnv(): boolean {
  const nodeEnv = tryGetEnvVar('NODE_ENV');
  return nodeEnv === 'production' || nodeEnv === 'prod';
}

export function isDevelopmentLikeEnv(): boolean {
  const nodeEnv = tryGetEnvVar('NODE_ENV');
  return nodeEnv === 'development' || nodeEnv === 'dev';
}

export function isStagingLikeEnv(): boolean {
  const nodeEnv = tryGetEnvVar('NODE_ENV');
  return nodeEnv === 'staging' || nodeEnv === 'stage';
}

export function isTestLikeEnv(): boolean {
  const nodeEnv = tryGetEnvVar('NODE_ENV');
  return nodeEnv === 'test';
}

export function isEagerAutoSanitizeEnabled(): boolean {
  const value = tryGetEnvVar('LOG_EAGER_AUTO_SANITIZE');
  return isTruelike(value);
}

function isTruelike(input: boolean | string | number | undefined): boolean {
  if (input == null) {
    return false;
  }
  if (['true', 'yes', 't', 'y', '1'].includes(input.toString().trim().toLowerCase())) {
    return true;
  }
  return false;
}