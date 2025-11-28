import { expect } from 'chai';
import { TerraformParserServiceImpl } from '../../src/terraform/TerraformParserServiceImpl';
import { getLogger } from '../../src/log/getLogger';

const LOG = getLogger('test.TerraformParser');

describe('TerraformParserService {testId:1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
  let parser: TerraformParserServiceImpl;

  beforeEach(() => {
    parser = new TerraformParserServiceImpl();
  });

  describe('parseString() - Simple Values {testId:2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
    it('should parse string values {testId:3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = 'environment = "staging"';
      const result = parser.parseString(content);

      LOG.info(() => `parseString(): Parsed result = ${JSON.stringify(result)}`);

      expect(result).to.deep.equal({ environment: 'staging' });
    });

    it('should parse number values {testId:4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = 'kms_deletion_window = 14';
      const result = parser.parseString(content);

      expect(result).to.deep.equal({ kms_deletion_window: 14 });
    });

    it('should parse boolean values {testId:5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = `
        enable_nat_gateway = true
        enable_vpn_gateway = false
      `;
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        enable_nat_gateway: true,
        enable_vpn_gateway: false
      });
    });

    it('should parse multiple variables {testId:6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = `
        environment = "staging"
        aws_region = "us-east-1"
        kms_deletion_window = 14
        enable_nat_gateway = true
      `;
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        environment: 'staging',
        aws_region: 'us-east-1',
        kms_deletion_window: 14,
        enable_nat_gateway: true
      });
    });
  });

  describe('parseString() - Comments {testId:7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
    it('should ignore line comments {testId:8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = `
        # This is a comment
        environment = "staging"
        # Another comment
        aws_region = "us-east-1"
      `;
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        environment: 'staging',
        aws_region: 'us-east-1'
      });
    });

    it('should handle inline comments {testId:9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = 'environment = "staging" # Production-like environment';
      const result = parser.parseString(content);

      expect(result).to.deep.equal({ environment: 'staging' });
    });

    it('should handle empty lines and whitespace {testId:0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = `

        environment = "staging"


        aws_region = "us-east-1"

      `;
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        environment: 'staging',
        aws_region: 'us-east-1'
      });
    });
  });

  describe('parseString() - Lists {testId:1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
    it('should parse string lists {testId:2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = 'availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]';
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        availability_zones: ['us-east-1a', 'us-east-1b', 'us-east-1c']
      });
    });

    it('should parse multi-line lists {testId:3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = `
        availability_zones = [
          "us-east-1a",
          "us-east-1b",
          "us-east-1c"
        ]
      `;
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        availability_zones: ['us-east-1a', 'us-east-1b', 'us-east-1c']
      });
    });

    it('should parse mixed-type lists {testId:4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = 'mixed = ["string", 42, true, false]';
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        mixed: ['string', 42, true, false]
      });
    });
  });

  describe('parseString() - Maps/Objects {testId:5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
    it('should parse simple maps {testId:6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = `
        tags = {
          Environment = "staging"
          Project = "louspizza"
        }
      `;
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        tags: {
          Environment: 'staging',
          Project: 'louspizza'
        }
      });
    });

    it('should parse single-line maps {testId:7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = 'tags = { Environment = "staging", Project = "louspizza" }';
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        tags: {
          Environment: 'staging',
          Project: 'louspizza'
        }
      });
    });

    it('should parse nested maps {testId:8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const content = `
        config = {
          database = {
            host = "localhost"
            port = 5432
          }
          cache = {
            enabled = true
          }
        }
      `;
      const result = parser.parseString(content);

      expect(result).to.deep.equal({
        config: {
          database: {
            host: 'localhost',
            port: 5432
          },
          cache: {
            enabled: true
          }
        }
      });
    });
  });

  describe('mergeVariables() {testId:9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
    it('should merge simple variables with later overriding {testId:0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const base = { environment: 'development', region: 'us-east-1' };
      const override = { environment: 'staging' };

      const result = parser.mergeVariables(base, override);

      expect(result).to.deep.equal({
        environment: 'staging',
        region: 'us-east-1'
      });
    });

    it('should deep merge nested objects {testId:1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const base = {
        tags: {
          Environment: 'development',
          Project: 'louspizza',
          Owner: 'team'
        }
      };
      const override = {
        tags: {
          Environment: 'staging',
          CostCenter: 'engineering'
        }
      };

      const result = parser.mergeVariables(base, override);

      expect(result).to.deep.equal({
        tags: {
          Environment: 'staging',
          Project: 'louspizza',
          Owner: 'team',
          CostCenter: 'engineering'
        }
      });
    });

    it('should handle multiple merge layers {testId:2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a,speed:purelogic,needsRdbms:false,needsExternal:false}', () => {
      const layer1 = { a: 1, b: 2, c: 3 };
      const layer2 = { b: 20, d: 4 };
      const layer3 = { c: 30, e: 5 };

      const result = parser.mergeVariables(layer1, layer2, layer3);

      expect(result).to.deep.equal({ a: 1, b: 20, c: 30, d: 4, e: 5 });
    });
  });
});
