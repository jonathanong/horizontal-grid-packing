build: component dist

lint:
	@jshint lib

clean:
	@rm -rf components

component:
	@component install
	@component build

dist:
	@component build \
		--standalone Pack \
		--out dist \
		--name pack

demo: component
	@node demo

.PHONY: build lint clean dist component demo