import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function truncateAllTablesWithSQL() {
  try {
    console.log('🗑️  Starting to truncate all tables using SQL block...');

    // Execute the exact SQL block you provided
    await prisma.$executeRaw`
      DO $$
      DECLARE
          table_rec RECORD;
      BEGIN
          -- Loop through all tables in the public schema
          FOR table_rec IN (
              SELECT table_name
              FROM information_schema.tables
              WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
              AND table_name != '_prisma_migrations'
          )
          LOOP
              EXECUTE 'TRUNCATE TABLE public.' || quote_ident(table_rec.table_name) || ' CASCADE';
          END LOOP;
      END $$;
    `;

    console.log('🎉 All tables truncated successfully using SQL block!');
    console.log(
      '💡 You can now run "npm run seed" to re-populate the database.',
    );
  } catch (error) {
    console.error('❌ Error truncating tables:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the script
truncateAllTablesWithSQL();
