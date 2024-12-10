import { db } from '@/db';
import {
  ROLES_SQL,
  DROP_RLS_SQL,
  RLS_SQL,
  MESSAGE_INSERT_SQL,
} from '@/db/schema';

const SQL = process.env.TESTING
  ? [ROLES_SQL, DROP_RLS_SQL, RLS_SQL]
  : [DROP_RLS_SQL, RLS_SQL, MESSAGE_INSERT_SQL];

main()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Done ✅');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

async function main() {
  for (const query of SQL) {
    await db.execute(query);
  }
}
