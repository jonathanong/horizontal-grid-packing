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
		--standalone HorizontalGridPacking \
		--out dist \
		--name horizontal-grid-packing

demo: npm component
	@node demo

npm:
	@npm i

.PHONY: build lint clean dist component demo npm