lint:
	make lint -C packages/lib
	make lint -C packages/solana-anchor-indexer
	make lint -C apps/program
	make lint -C apps/ui

.PHONY: lint
