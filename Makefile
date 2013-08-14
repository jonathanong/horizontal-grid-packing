build:
	@component install
	@component build

lint:
	@jshint lib

clean:
	@rm -rf components

dist:
	@component build \
		--standalone Pack \
		--out dist \
		--name pack

.PHONY: build lint clean dist