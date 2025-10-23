/**
 * Log Level Rules Configuration
 *
 * This file configures logging levels for different parts of your application.
 *
 * Rules are evaluated in order (first match wins), so put the most specific
 * patterns first and more general fallback patterns last.
 *
 * Pattern matching:
 * - Exact match: "api.users" matches only "api.users"
 * - Suffix wildcard: "api.*" matches "api.users", "api.products", etc.
 * - Prefix wildcard: "*.service" matches "api.service", "db.service", etc.
 * - Multiple wildcards: "api.*.controller" matches "api.users.controller", etc.
 * - Catch-all: "*" matches everything
 *
 * Log levels (in order of verbosity):
 * - TRACE: Most verbose, shows everything
 * - DEBUG: Development debugging information
 * - INFO: General informational messages
 * - NOTICE: Normal but significant events
 * - WARN: Warning messages
 * - ERROR: Error conditions
 * - FATAL: Critical errors that may cause shutdown
 *
 * Usage:
 * 1. Copy this file to log-level-rules.js or config/log-level-rules.js
 * 2. Edit the rules below to match your needs
 * 3. Restart your application (no recompilation needed!)
 *
 * Alternative: Set LOG_LEVEL_RULES_FILE env var to point to this file:
 *   export LOG_LEVEL_RULES_FILE=./log-level-rules.js
 */

const env = process.env.NODE_ENV || 'development';

// Base rules for all environments
const baseRules = [
  { pattern: 'api.*', level: 'INFO' },
  { pattern: 'db.*', level: 'WARN' },
  { pattern: '*', level: 'WARN' }
];

// Development-specific rules (more verbose)
const developmentRules = [
  { pattern: 'api.users.controller', level: 'TRACE' },
  { pattern: 'api.users.*', level: 'DEBUG' },
  { pattern: 'api.*', level: 'DEBUG' },
  { pattern: 'db.*', level: 'DEBUG' },
  { pattern: '*', level: 'INFO' }
];

// Production rules (less verbose)
const productionRules = [
  { pattern: 'api.*', level: 'INFO' },
  { pattern: 'db.*', level: 'WARN' },
  { pattern: '*', level: 'ERROR' }
];

// Staging rules
const stagingRules = [
  { pattern: 'api.*', level: 'INFO' },
  { pattern: 'db.*', level: 'INFO' },
  { pattern: '*', level: 'WARN' }
];

// Export the appropriate rules based on environment
module.exports = {
  rules: env === 'production'
    ? productionRules
    : env === 'staging'
    ? stagingRules
    : developmentRules
};
