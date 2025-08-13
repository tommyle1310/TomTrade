/* eslint-disable */
// scripts/cleanup-duplicate-alerts.script.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateAlerts() {
  console.log('🧹 Cleaning up duplicate alert rules...');

  try {
    // Get all alert rules grouped by user, ticker, and rule type
    const alertRules = await prisma.alertRule.findMany({
      orderBy: [
        { userId: 'asc' },
        { ticker: 'asc' },
        { ruleType: 'asc' },
        { createdAt: 'desc' }, // Keep the most recent one
      ],
    });

    const seen = new Set<string>();
    const toDelete: string[] = [];

    for (const rule of alertRules) {
      const key = `${rule.userId}-${rule.ticker}-${rule.ruleType}`;
      if (seen.has(key)) {
        toDelete.push(rule.id);
        console.log(`🗑️ Marking duplicate rule for deletion: ${rule.id} (${rule.userId}, ${rule.ticker}, ${rule.ruleType})`);
      } else {
        seen.add(key);
      }
    }

    if (toDelete.length > 0) {
      console.log(`🗑️ Deleting ${toDelete.length} duplicate alert rules...`);
      
      // Delete duplicate alert rules
      await prisma.alertRule.deleteMany({
        where: {
          id: {
            in: toDelete,
          },
        },
      });

      // Also delete any AlertSent records for the deleted rules
      await prisma.alertSent.deleteMany({
        where: {
          ruleId: {
            in: toDelete,
          },
        },
      });

      console.log('✅ Duplicate alert rules cleaned up successfully');
    } else {
      console.log('✅ No duplicate alert rules found');
    }

    // Show remaining alert rules
    const remainingRules = await prisma.alertRule.findMany({
      orderBy: [
        { userId: 'asc' },
        { ticker: 'asc' },
        { ruleType: 'asc' },
      ],
    });

    console.log('\n📋 Remaining alert rules:');
    for (const rule of remainingRules) {
      console.log(`- ${rule.id}: ${rule.userId} | ${rule.ticker} | ${rule.ruleType} | ${rule.targetValue}`);
    }

  } catch (error) {
    console.error('❌ Error cleaning up duplicate alerts:', error);
  }
}

cleanupDuplicateAlerts()
  .catch((e) => console.error('❌ ERROR:', e))
  .finally(() => prisma.$disconnect());
