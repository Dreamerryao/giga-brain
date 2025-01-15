lint:
	make lint -C packages/lib
	make lint -C apps/program
	make lint -C apps/ui

.PHONY: lint
