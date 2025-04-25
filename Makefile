ROOT_DIR:=$(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))


.PHONY: dist
dist: cleandist
	cd ${ROOT_DIR} && npm run build

.PHONY: build
build: dist

.PHONY: cleandist
cleandist:
	cd ${ROOT_DIR} && rm -rf dist/*

.PHONY: test
test:
	cd ${ROOT_DIR} && npm test

.PHONY: publish
publish:
	cd ${ROOT_DIR} && npm publish


.PHONY: LogTester
LogTester:
	cd ${ROOT_DIR}/src && LOG_DEBUG=1 LOG_USE_JSON_FORMAT=1 LOG_PREPEND_TIMESTAMP=1 npx ts-node --files tester/LogTester.ts
