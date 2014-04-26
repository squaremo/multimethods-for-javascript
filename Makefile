MOCHA_BIN:=./node_modules/.bin/mocha

.PHONY: test

all: test

$(MOCHA_BIN):
	npm install mocha

test: $(MOCHA_BIN)
	$(MOCHA_BIN) -u tdd test.js
