build:
	@component install
	@component build

lint:
	@jshint lib

clean:
	@rm -rf components

.PHONY: build lint clean