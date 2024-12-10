o?=$o

test:
	env-cmd -f .env.test tsx src/db/init-db.ts
	env-cmd -f .env.test npx drizzle-kit push --force
	env-cmd -f .env.test tsx src/db/reset-db.ts
	env-cmd -f .env.test tsx src/db/initial-rls.ts
	cp -f target/deploy/gb-keypair-wip.json target/deploy/gb-keypair.json
	env-cmd -f .env.test anchor test --skip-lint

lint:
	pnpm run lint

jest:
	make copy-files
	jest tests/admin.spec.ts 
#	jest tests/puzzle-currency.spec.ts
#	jest tests/new-puzzle.spec.ts
#	jest tests/puzzles-sol.spec.ts
#	jest tests/puzzles-gb.spec.ts
#	jest tests/puzzles-usdc.spec.ts
#	jest tests/timeout-sol.spec.ts
#	jest tests/timeout-gb.spec.ts
#	jest tests/timeout-usdc.spec.ts
#	jest tests/my-chat.spec.ts
#	jest tests/attempt-validation.spec.ts

copy-files:
	cp -f target/idl/gb.json ../../packages/lib/src/program/gb.json
	cp -f target/types/gb.ts ../../packages/lib/src/program/gb.ts
	cd ../../packages/lib && pnpm run lint

copy-ui-files:
	env-cmd -f .env.wip bash -c 'supabase gen types --lang=typescript --project-id "$${SUPABASE_PROJECT_ID}" --schema public > ../../apps/ui/src/lib/db-types.ts'
	cd ../../apps/ui && pnpm run lint

build:
	anchor build
	make copy-files

deploy-wip:
	make build
	cp target/deploy/gb-keypair-wip.json target/deploy/gb-keypair.json
	anchor deploy --provider.cluster devnet

deploy-dev:
	make build
	cp target/deploy/gb-keypair-dev.json target/deploy/gb-keypair.json
	anchor deploy --provider.cluster devnet

deploy-prd:
	make build
	cp target/deploy/gb-keypair-prd.json target/deploy/gb-keypair.json
	anchor deploy --provider.cluster mainnet

db-push-wip:
	env-cmd -f .env.wip npx drizzle-kit push --force
	env-cmd -f .env.wip tsx src/db/reset-db.ts
	env-cmd -f .env.wip tsx src/db/initial-rls.ts
	env-cmd -f .env.wip bash -c 'supabase gen types --lang=typescript --project-id "$${SUPABASE_PROJECT_ID}" --schema public > ../../apps/ui/src/lib/db-types.ts'
	cd ../../apps/ui && pnpm run lint

db-push-dev:
	env-cmd -f .env.dev npx drizzle-kit push --force
	env-cmd -f .env.dev tsx src/db/reset-db.ts
	env-cmd -f .env.dev tsx src/db/initial-rls.ts
	env-cmd -f .env.dev bash -c 'supabase gen types --lang=typescript --project-id "$${SUPABASE_PROJECT_ID}" --schema public > ../../apps/ui/src/lib/db-types.ts'
	cd ../../apps/ui && pnpm run lint

db-push-prd:
	env-cmd -f .env.prd npx drizzle-kit push --force
	env-cmd -f .env.prd tsx src/db/reset-db.ts
	env-cmd -f .env.prd tsx src/db/initial-rls.ts
# env-cmd -f .env.prd bash -c 'supabase gen types --lang=typescript --project-id "$${SUPABASE_PROJECT_ID}" --schema public > ../../apps/ui/src/lib/db-types.ts'
# cd ../../apps/ui && pnpm run lint

clean:
	rm -rf target

index-wip:
	@env-cmd -f .env.wip tsx src/scripts/indexer/indexer.ts indexer

index-dev:
	@env-cmd -f .env.dev tsx src/scripts/indexer/indexer.ts indexer

index-prd:
	@env-cmd -f .env.prd tsx src/scripts/indexer/indexer.ts indexer

verify-wip:
	@env-cmd -f .env.wip tsx src/scripts/indexer/indexer.ts verifier

verify-dev:
	@env-cmd -f .env.dev tsx src/scripts/indexer/indexer.ts verifier

verify-prd:
	@env-cmd -f .env.prd tsx src/scripts/indexer/indexer.ts verifier

init-wip:
	@env-cmd -f .env.wip tsx src/scripts/test/init.ts

init-dev:
	@env-cmd -f .env.dev tsx src/scripts/test/init.ts

init-prd:
	@env-cmd -f .env.prd tsx src/scripts/test/init.ts

seed-wip:
	@env-cmd -f .env.wip tsx src/scripts/test/seed.ts 

seed-dev:
	@env-cmd -f .env.dev tsx src/scripts/test/seed.ts 

seed-prd:
	@env-cmd -f .env.prd tsx src/scripts/test/seed.ts 

tg-wip:
	@env-cmd -f .env.wip tsx src/scripts/cron/tg.ts

tg-dev:
	@env-cmd -f .env.dev tsx src/scripts/cron/tg.ts

tg-prd:
	@env-cmd -f .env.prd tsx src/scripts/cron/tg.ts

coingecko-wip:
	@env-cmd -f .env.wip tsx src/scripts/cron/coingecko.ts

coingecko-dev:
	@env-cmd -f .env.dev tsx src/scripts/cron/coingecko.ts

coingecko-prd:
	@env-cmd -f .env.prd tsx src/scripts/cron/coingecko.ts

usd-updater-wip:
	@env-cmd -f .env.wip tsx src/scripts/cron/usd-updater.ts

usd-updater-dev:
	@env-cmd -f .env.dev tsx src/scripts/cron/usd-updater.ts

usd-updater-prd:
	@env-cmd -f .env.prd tsx src/scripts/cron/usd-updater.ts

mint-gb-wip:
	@env-cmd -f .env.wip tsx src/scripts/test/mint-gb.ts

mint-gb-dev:
	@env-cmd -f .env.dev tsx src/scripts/test/mint-gb.ts

.PHONY: 