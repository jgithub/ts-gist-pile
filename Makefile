ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make build                    - Build the project"
	@echo "  make test                     - Run tests"
	@echo "  make demo-blur                - Run blur API demo (dev mode)"
	@echo "  make demo-blur-prod           - Run blur API demo (prod mode with hashing)"
	@echo "  make demo-comprehensive       - Run comprehensive logging demo (130 objects)"
	@echo "  make demo-comprehensive-prod  - Run comprehensive demo (prod mode)"
	@echo "  make demo-all                 - Run all blur demos"

.PHONY: dist
dist: cleandist
#	cd ${ROOT_DIR} && npm run build
	cd ${ROOT_DIR} && npm pack

.PHONY: build
build: dist

.PHONY: cleandist
cleandist:
	cd ${ROOT_DIR} && rm -rf dist/*

.PHONY: test
test:
	cd ${ROOT_DIR} && npm test

.PHONY: pack
pack:
	cd ${ROOT_DIR} && npm pack

.PHONY: publish
publish:
	cd ${ROOT_DIR} && npm publish


.PHONY: bundle
bundle: build
	cd ${ROOT_DIR} && cp dist/index.js TsGistPile.js

.PHONY: LogTester
LogTester:
	cd ${ROOT_DIR}/src && VITE_LOG_DEBUG=1 LOG_USE_JSON_FORMAT=0 LOG_PREPEND_TIMESTAMP=1 npx ts-node --files tester/LogTester.ts

.PHONY: demo-blur
demo-blur:
	@echo "=== Blur API Demo (Development Mode) ==="
	cd ${ROOT_DIR} && npx ts-node examples/test_blur_functions.ts

.PHONY: demo-blur-prod
demo-blur-prod:
	@echo "=== Blur API Demo (Production Mode with Hashing) ==="
	cd ${ROOT_DIR} && LOG_HASH_SECRET=my-secret-key-123 npx ts-node examples/test_blur_functions.ts

.PHONY: demo-comprehensive
demo-comprehensive:
	@echo "=== Comprehensive Logging Demo (130 objects) ==="
	cd ${ROOT_DIR} && LOG_INFO=true npx ts-node examples/comprehensive_logging_demo.ts

.PHONY: demo-comprehensive-prod
demo-comprehensive-prod:
	@echo "=== Comprehensive Demo (Production Mode) ==="
	cd ${ROOT_DIR} && LOG_EAGER_AUTO_SANITIZE=true LOG_HASH_SECRET=my-secret-key-123 LOG_INFO=true npx ts-node examples/comprehensive_logging_demo.ts

.PHONY: demo-all
demo-all: demo-blur demo-blur-prod
