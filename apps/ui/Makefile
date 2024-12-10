wip:
	pnpx env-cmd -f .env.wip pnpm run dev

dev:
	pnpx env-cmd -f .env.dev pnpm run dev

prd:
	pnpx env-cmd -f .env.prd pnpm run dev

lint:
	pnpm run lint

preview:
	pnpx env-cmd -f .env.dev wrangler dev --port 7300

deploy:
	make lint
	pnpx env-cmd -f .env.dev pnpm run build
	pnpx env-cmd -f .env.dev cloudflare
	pnpx env-cmd -f .env.dev wrangler deploy --env devnet

deploy-prd:
	make lint
	pnpx env-cmd -f .env.prd pnpm run build
	pnpx env-cmd -f .env.prd cloudflare
	pnpx env-cmd -f .env.prd wrangler deploy --env mainnet

.PHONY: wip dev build lint dev-worker deploy deploy-prd
