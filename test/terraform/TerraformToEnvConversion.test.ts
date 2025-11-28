import { expect } from 'chai';
import { TerraformToEnvConversionServiceImpl } from '../../src/terraform/TerraformToEnvConversionServiceImpl';
import { getLogger } from '../../src/log/getLogger';

const LOG = getLogger('test.TerraformToEnvConversion');

describe('TerraformToEnvConversionService {testId:3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
  let generator: TerraformToEnvConversionServiceImpl;

  beforeEach(() => {
    generator = new TerraformToEnvConversionServiceImpl();
  });

  describe('generateEnvContent() - Simple Values {testId:4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
    it('should convert snake_case to SCREAMING_SNAKE_CASE {testId:5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        environment: 'staging',
        aws_region: 'us-east-1'
      };

      const result = generator.generateEnvContent(vars, { includeComments: false });

      LOG.info(() => `generateEnvContent(): Generated .env content:\n${result}`);

      expect(result).to.include('ENVIRONMENT=staging');
      expect(result).to.include('AWS_REGION=us-east-1');
    });

    it('should convert numbers to strings {testId:6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        kms_deletion_window: 14,
        port: 5432
      };

      const result = generator.generateEnvContent(vars, { includeComments: false });

      expect(result).to.include('KMS_DELETION_WINDOW=14');
      expect(result).to.include('PORT=5432');
    });

    it('should convert booleans to lowercase strings {testId:7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        enable_nat_gateway: true,
        enable_vpn_gateway: false
      };

      const result = generator.generateEnvContent(vars, { includeComments: false });

      expect(result).to.include('ENABLE_NAT_GATEWAY=true');
      expect(result).to.include('ENABLE_VPN_GATEWAY=false');
    });

    it('should quote strings with spaces {testId:8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        description: 'This is a description with spaces',
        simple: 'noSpaces'
      };

      const result = generator.generateEnvContent(vars, { includeComments: false });

      expect(result).to.include('DESCRIPTION="This is a description with spaces"');
      expect(result).to.include('SIMPLE=noSpaces');
    });
  });

  describe('generateEnvContent() - Complex Values {testId:9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
    it('should serialize lists as JSON {testId:0f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        availability_zones: ['us-east-1a', 'us-east-1b', 'us-east-1c']
      };

      const result = generator.generateEnvContent(vars, { includeComments: false });

      expect(result).to.include('AVAILABILITY_ZONES=["us-east-1a","us-east-1b","us-east-1c"]');
    });

    it('should serialize maps as JSON {testId:1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        tags: {
          Environment: 'staging',
          Project: 'louspizza'
        }
      };

      const result = generator.generateEnvContent(vars, { includeComments: false });

      expect(result).to.include('TAGS={"Environment":"staging","Project":"louspizza"}');
    });

    it('should serialize nested structures as JSON {testId:2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        config: {
          database: {
            host: 'localhost',
            port: 5432
          }
        }
      };

      const result = generator.generateEnvContent(vars, { includeComments: false });

      const expectedJson = JSON.stringify({
        database: {
          host: 'localhost',
          port: 5432
        }
      });
      expect(result).to.include(`CONFIG=${expectedJson}`);
    });
  });

  describe('generateEnvContent() - Options {testId:3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
    it('should sort keys alphabetically when sortKeys=true {testId:4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        zebra: 'last',
        apple: 'first',
        middle: 'middle'
      };

      const result = generator.generateEnvContent(vars, {
        includeComments: false,
        sortKeys: true
      });

      const lines = result.trim().split('\n');
      expect(lines[0]).to.include('APPLE=first');
      expect(lines[1]).to.include('MIDDLE=middle');
      expect(lines[2]).to.include('ZEBRA=last');
    });

    it('should include comments when includeComments=true {testId:5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = { environment: 'staging' };

      const result = generator.generateEnvContent(vars, { includeComments: true });

      expect(result).to.include('#');
    });

    it('should add prefix when specified {testId:6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        environment: 'staging',
        region: 'us-east-1'
      };

      const result = generator.generateEnvContent(vars, {
        includeComments: false,
        prefix: 'TF_'
      });

      expect(result).to.include('TF_ENVIRONMENT=staging');
      expect(result).to.include('TF_REGION=us-east-1');
    });

    it('should include source label in comments when specified {testId:7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = { environment: 'staging' };

      const result = generator.generateEnvContent(vars, {
        includeComments: true,
        sourceLabel: 'staging.tfvars'
      });

      expect(result).to.include('staging.tfvars');
    });
  });

  describe('generateEnvContent() - Edge Cases {testId:8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
    it('should handle empty variables {testId:9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {};

      const result = generator.generateEnvContent(vars, { includeComments: false });

      expect(result.trim()).to.equal('');
    });

    it('should handle special characters in string values {testId:0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        password: 'p@$$w0rd!',
        path: '/usr/local/bin'
      };

      const result = generator.generateEnvContent(vars, { includeComments: false });

      expect(result).to.include('PASSWORD="p@$$w0rd!"');
      expect(result).to.include('PATH="/usr/local/bin"');
    });

    it('should handle DANGER_WILL_ROBINSON variables {testId:1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const vars = {
        danger_will_robinson_use_fake_s3: false,
        danger_will_robinson_disable_rate_limiting: true
      };

      const result = generator.generateEnvContent(vars, { includeComments: false });

      expect(result).to.include('DANGER_WILL_ROBINSON_USE_FAKE_S3=false');
      expect(result).to.include('DANGER_WILL_ROBINSON_DISABLE_RATE_LIMITING=true');
    });
  });
});
