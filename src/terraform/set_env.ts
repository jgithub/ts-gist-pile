#!/usr/bin/env npx tsx
/**
 * set_env.ts - Environment variable loader with multi-source support
 *
 * Replaces set_dotenv.sh with TypeScript implementation that supports:
 * - --source=dotenv: Load from .env files (default behavior)
 * - --source=tfvars: Load from Terraform .tfvars files
 *
 * Usage:
 *   npx tsx script/set_env.ts --source=dotenv --environment=development
 *   npx tsx script/set_env.ts --source=tfvars --environment=staging --output=.env.staging
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { TerraformParserServiceImpl } from './TerraformParserServiceImpl';
import { TerraformToEnvConversionServiceImpl } from './TerraformToEnvConversionServiceImpl';
import { TerraformVariables } from './TerraformValue';

interface CliArgs {
  source: 'dotenv' | 'tfvars';
  environment?: string;
  output?: string;
  path?: string;
  help?: boolean;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.source === 'dotenv') {
    await handleDotenvSource(args);
  }

  if (args.source === 'tfvars') {
    await handleTerraformSource(args);
  }
}

async function handleDotenvSource(args: CliArgs) {
  const environment = args.environment || '';

  // Determine which base file to load
  const baseFile = environment ? `.env.${environment}` : '.env';
  const baseFilePath = path.resolve(process.cwd(), baseFile);

  console.log(`Loading environment from: ${baseFile}`);
  console.log(`Working directory: ${process.cwd()}`);

  try {
    // Check if base file exists
    try {
      await fs.access(baseFilePath);
    } catch {
      console.error(`\n❌ ERROR: Environment file not found: ${baseFile}`);
      console.error(`Searched in: ${process.cwd()}`);
      process.exit(1);
    }

    // Load base file
    const baseContent = await fs.readFile(baseFilePath, 'utf-8');
    const baseVars = parseDotenvContent(baseContent);
    console.log(`  ✓ Loaded ${Object.keys(baseVars).length} variables from ${baseFile}`);

    // Check for .env.local
    const localFilePath = path.resolve(process.cwd(), '.env.local');
    let localVars: Record<string, string> = {};
    let hasLocal = false;

    try {
      await fs.access(localFilePath);
      hasLocal = true;
      const localContent = await fs.readFile(localFilePath, 'utf-8');
      localVars = parseDotenvContent(localContent);
      console.log(`  ✓ Loaded ${Object.keys(localVars).length} variables from .env.local`);
    } catch {
      console.log(`  ℹ No .env.local file found (this is fine)`);
    }

    // Merge variables (local overrides base)
    const merged = { ...baseVars, ...localVars };
    console.log(`  ✓ Total: ${Object.keys(merged).length} variables`);

    // Generate output
    const lines: string[] = [];
    lines.push('# Environment variables');
    lines.push(`# Source: ${baseFile}${hasLocal ? ' + .env.local' : ''}`);
    lines.push(`# Generated: ${new Date().toISOString()}`);
    lines.push('');

    for (const [key, value] of Object.entries(merged).sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`${key}=${value}`);
    }

    const envContent = lines.join('\n');

    // Output to file or stdout
    if (args.output) {
      const outputPath = path.resolve(process.cwd(), args.output);
      await fs.writeFile(outputPath, envContent, 'utf-8');
      console.log(`\n✅ Generated: ${outputPath}`);
    } else {
      console.log('\n' + '='.repeat(80));
      console.log(envContent);
      console.log('='.repeat(80));
    }

  } catch (error) {
    console.error('\n❌ Error loading environment configuration:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * parseDotenvContent(): Parse .env file content into key-value pairs.
 *
 * Handles:
 * - Comments (# lines)
 * - Empty lines
 * - KEY=value format
 * - Quoted values ("value" or 'value')
 */
function parseDotenvContent(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const lines = content.split('\n');

  for (let line of lines) {
    // Strip whitespace
    line = line.trim();

    // Skip empty lines and comments
    if (line.length === 0 || line.startsWith('#')) {
      continue;
    }

    // Parse KEY=VALUE
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) {
      continue; // Skip malformed lines
    }

    const key = line.substring(0, equalIndex).trim();
    let value = line.substring(equalIndex + 1).trim();

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.substring(1, value.length - 1);
    }

    vars[key] = value;
  }

  return vars;
}

async function handleTerraformSource(args: CliArgs) {
  const environment = args.environment || 'development';
  const infraDir = args.path ? path.resolve(args.path) : process.cwd();

  console.log(`Loading Terraform variables for environment: ${environment}`);
  console.log(`Working directory: ${infraDir}`);

  const parser = new TerraformParserServiceImpl();
  const terraformToEnvConversionService = new TerraformToEnvConversionServiceImpl();

  try {
    // Load base configuration files from working directory
    const commonPath = path.join(infraDir, 'common.tfvars');
    const envPath = path.join(infraDir, `${environment}.tfvars`);

    console.log(`  Reading: ${commonPath}`);
    const commonVars = await parser.parseFile(commonPath);
    console.log(`  ✓ Loaded ${Object.keys(commonVars).length} variables from common.tfvars`);

    console.log(`  Reading: ${envPath}`);
    const envVars = await parser.parseFile(envPath);
    console.log(`  ✓ Loaded ${Object.keys(envVars).length} variables from ${environment}.tfvars`);

    // Merge variables (environment overrides common)
    const merged: TerraformVariables = parser.mergeVariables(commonVars, envVars);
    console.log(`  ✓ Merged: ${Object.keys(merged).length} total variables`);

    // Generate .env content
    const envContent = terraformToEnvConversionService.generateEnvContent(merged, {
      includeComments: true,
      sortKeys: true,
      sourceLabel: `${environment}.tfvars`
    });

    // Output to file or stdout
    if (args.output) {
      const outputPath = path.resolve(process.cwd(), args.output);
      await fs.writeFile(outputPath, envContent, 'utf-8');
      console.log(`\n✅ Generated: ${outputPath}`);
    } else {
      console.log('\n' + '='.repeat(80));
      console.log(envContent);
      console.log('='.repeat(80));
    }

  } catch (error) {
    console.error('\n❌ Error loading Terraform configuration:');
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    source: 'dotenv' // default
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg.startsWith('--source=')) {
      const source = arg.substring('--source='.length);
      if (source !== 'dotenv' && source !== 'tfvars') {
        console.error(`ERROR: Invalid --source value: ${source}`);
        console.error('Valid values: dotenv, tfvars');
        process.exit(1);
      }
      args.source = source;
    } else if (arg.startsWith('--environment=')) {
      args.environment = arg.substring('--environment='.length);
    } else if (arg.startsWith('--output=')) {
      args.output = arg.substring('--output='.length);
    } else if (arg.startsWith('--path=')) {
      args.path = arg.substring('--path='.length);
    } else {
      console.error(`ERROR: Unknown argument: ${arg}`);
      printHelp();
      process.exit(1);
    }
  }

  return args;
}

function printHelp() {
  console.log(`
set_env.ts - Environment variable loader with multi-source support

USAGE:
  npx tsx script/set_env.ts [options]

OPTIONS:
  --source=<type>         Source type: 'dotenv' or 'tfvars' (default: dotenv)
  --environment=<name>    Environment name (e.g., development, staging, production)
  --output=<file>         Output file path (default: stdout)
  --path=<directory>      Directory to search for config files (default: current directory)
  --help, -h              Show this help message

EXAMPLES:
  # Load from .env.development (and optionally .env.local) in current directory
  npx tsx script/set_env.ts --source=dotenv --environment=development

  # Load from .env in current directory
  npx tsx script/set_env.ts --source=dotenv

  # Load terraform files from specific directory
  npx tsx script/set_env.ts --source=tfvars --environment=staging --path=./infrastructure

  # Generate .env.staging from Terraform staging configuration in current directory
  npx tsx script/set_env.ts --source=tfvars --environment=staging --output=.env.staging

  # Load from test fixtures
  cd test/terraform/fixtures && npx tsx ../../../script/set_env.ts --source=tfvars --environment=staging

NOTE:
  For --source=tfvars, this tool expects to find common.tfvars and <environment>.tfvars
  in the working directory (or --path directory).

  To set environment variables in your shell, use the wrapper script:
    source script/set_env.sh --source=dotenv --environment=development
`);
}

// Export for programmatic use
export { parseDotenvContent, parseArgs, main as runSetEnv };
export type { CliArgs };

// Only run main if this file is executed directly (not imported)
// We detect this by checking if the current file matches the entry point
const isMainModule = typeof require !== 'undefined' && require.main === module;
if (isMainModule) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
