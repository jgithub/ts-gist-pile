import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { VERSION } from '../../src/version';

// `make dist` stamps src/version.ts from package.json; a release built another way (npm run build) can skip the stamp
// and ship the previous version number (#109's round-two review: 0.0.334 exported '0.0.333').
describe('VERSION', () => {
  it('equals package.json version', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));
    expect(VERSION).to.equal(packageJson.version);
  });
});
