import dotenv from 'dotenv';
dotenv.config();
import contentful from 'contentful-management';
import { runMigration } from 'contentful-migration';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const {
  CONTENTFUL_SPACE_ID,
  CONTENTFUL_ENVIRONMENT,
  CONTENTFUL_PERSONAL_ACCESS_TOKEN,
} = process.env;

if (
  !CONTENTFUL_SPACE_ID ||
  !CONTENTFUL_ENVIRONMENT ||
  !CONTENTFUL_PERSONAL_ACCESS_TOKEN
) {
  console.error('Missing Contentful credentials in .env file');
  process.exit(1);
}

const client = contentful.createClient({
  accessToken: CONTENTFUL_PERSONAL_ACCESS_TOKEN,
});

async function run() {
  const space = await client.getSpace(CONTENTFUL_SPACE_ID);
  const environment = await space.getEnvironment(CONTENTFUL_ENVIRONMENT);

  console.log(
    `Running migrations for space: ${CONTENTFUL_SPACE_ID}, environment: ${CONTENTFUL_ENVIRONMENT}`
  );

  const migrationsPath = `${__dirname}/migrations`;

  console.log(`Running migrations from: ${migrationsPath}`);

  const migrationFiles = fs.readdirSync(migrationsPath).sort((a, b) => {
    const aNum = parseInt(a.split('.')[0], 10);
    const bNum = parseInt(b.split('.')[0], 10);
    return aNum - bNum;
  });

  console.log(`Found ${migrationFiles} migration files.`);

  const lastMigrationFile = migrationFiles[migrationFiles.length - 1];

  console.log(`Last migration file: ${lastMigrationFile}`);

  if (lastMigrationFile) {
    const migrationModule = await import(
      `${migrationsPath}/${lastMigrationFile}`
    );
    await runMigration({
      migrationFunction: migrationModule.default,
      spaceId: CONTENTFUL_SPACE_ID,
      environmentId: CONTENTFUL_ENVIRONMENT,
      accessToken: CONTENTFUL_PERSONAL_ACCESS_TOKEN,
    });
    console.log(`Migration file ${lastMigrationFile} ran successfully.`);
  } else {
    console.log('No migration files found.');
  }
}

run().catch((error) => {
  console.error('Error running migrations:', error);
  process.exit(1);
});
