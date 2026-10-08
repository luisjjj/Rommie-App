import 'dotenv/config';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { db } from './client.js';

async function main() {
  await migrate(db as never, { migrationsFolder: './drizzle' });
  console.log('Migrations applied');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
