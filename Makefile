build:
	@component install
	@component build

lint:
	@jshint lib

.PHONY: build lint