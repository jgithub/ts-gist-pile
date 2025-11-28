#!/usr/bin/env npx tsx
interface CliArgs {
    source: 'dotenv' | 'tfvars';
    environment?: string;
    output?: string;
    path?: string;
    help?: boolean;
}
declare function main(): Promise<void>;
declare function parseDotenvContent(content: string): Record<string, string>;
declare function parseArgs(argv: string[]): CliArgs;
export { parseDotenvContent, parseArgs, main as runSetEnv };
export type { CliArgs };
