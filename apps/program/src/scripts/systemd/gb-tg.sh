#!/usr/bin/env bash

export PATH="\
/root/.nvm/versions/node/v21.7.3/bin:\
$PATH"

/root/gb/node_modules/.bin/env-cmd -f .env.dev /root/gb/node_modules/.bin/tsx src/scripts/cron/tg.ts


