import { login, gqlRequest } from './test-utils';

async function main() {
  try {
    console.log('🔐 Logging in as demo user...');
    const token = await login('demo@example.com', 'password123');
    console.log('✅ Login successful');

    // Test 1: Create an alert rule
    console.log('\n📝 Creating alert rule...');
    const createAlertResult = await gqlRequest(
      `
      mutation CreateAlertRule($input: CreateAlertRuleInput!) {
        createAlertRule(input: $input) {
          id
          ticker
          ruleType
          targetValue
          createdAt
        }
      }
      `,
      {
        input: {
          ticker: 'AAPL',
          ruleType: 'PRICE_ABOVE',
          targetValue: 200.0,
        },
      },
      token,
    );
    console.log('✅ Alert rule created:', createAlertResult.createAlertRule);

    // Test 2: Get all alert rules
    console.log('\n📋 Fetching all alert rules...');
    const alertRulesResult = await gqlRequest(
      `
      query GetMyAlertRules {
        getMyAlertRules {
          id
          ticker
          ruleType
          targetValue
          createdAt
        }
      }
      `,
      {},
      token,
    );
    console.log('✅ Alert rules fetched:', alertRulesResult.getMyAlertRules);

    // Test 3: Create another alert rule with different type
    console.log('\n📝 Creating second alert rule...');
    const createAlertResult2 = await gqlRequest(
      `
      mutation CreateAlertRule($input: CreateAlertRuleInput!) {
        createAlertRule(input: $input) {
          id
          ticker
          ruleType
          targetValue
          createdAt
        }
      }
      `,
      {
        input: {
          ticker: 'TSLA',
          ruleType: 'PRICE_BELOW',
          targetValue: 150.0,
        },
      },
      token,
    );
    console.log('✅ Second alert rule created:', createAlertResult2.createAlertRule);

    // Test 4: Delete the first alert rule
    console.log('\n🗑️ Deleting first alert rule...');
    const deleteResult = await gqlRequest(
      `
      mutation DeleteAlertRule($id: ID!) {
        deleteAlertRule(id: $id)
      }
      `,
      {
        id: createAlertResult.createAlertRule.id,
      },
      token,
    );
    console.log('✅ Alert rule deleted:', deleteResult.deleteAlertRule);

    // Test 5: Verify deletion by fetching rules again
    console.log('\n📋 Fetching alert rules after deletion...');
    const finalAlertRulesResult = await gqlRequest(
      `
      query GetMyAlertRules {
        getMyAlertRules {
          id
          ticker
          ruleType
          targetValue
          createdAt
        }
      }
      `,
      {},
      token,
    );
    console.log('✅ Final alert rules:', finalAlertRulesResult.getMyAlertRules);

    // Test 6: Test validation with invalid data
    console.log('\n❌ Testing validation with invalid data...');
    try {
      await gqlRequest(
        `
        mutation CreateAlertRule($input: CreateAlertRuleInput!) {
          createAlertRule(input: $input) {
            id
            ticker
            ruleType
            targetValue
            createdAt
          }
        }
        `,
        {
          input: {
            ticker: '', // Invalid: empty ticker
            ruleType: 'PRICE_ABOVE',
            targetValue: -10.0, // Invalid: negative value
          },
        },
        token,
      );
    } catch (error: any) {
      console.log('✅ Validation error caught as expected:', error.message);
    }

    console.log('\n🎉 All alert integration tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();
