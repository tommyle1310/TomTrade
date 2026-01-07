import { PrismaService } from 'prisma/prisma.service';
import axios from 'axios';

/**
 * Test script for getUserMetricCards API
 * Tests the GraphQL query directly against a running server
 */
async function testMetricCards() {
  const prisma = new PrismaService();
  const API_URL = 'http://localhost:4000/graphql';

  try {
    console.log('🧪 Testing getUserMetricCards API...\n');
    console.log('⚠️  Make sure the backend server is running on port 4000\n');

    // Login to get JWT token
    const loginMutation = `
      mutation {
        login(email: "test@test.com", password: "test123") {
          token
          user {
            id
            email
          }
        }
      }
    `;

    let token: string;
    let userId: string;

    try {
      const loginResponse = await axios.post(API_URL, {
        query: loginMutation,
      });

      if (loginResponse.data.errors) {
        console.log('⚠️  Test user not found, creating one...');
        
        // Create test user directly in database
        const hashedPassword = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36YqHwfnGkMfGfG5TmG6uOe'; // "test123"
        const testUser = await prisma.user.create({
          data: {
            email: 'test@test.com',
            passwordHash: hashedPassword,
          },
        });

        await prisma.balance.create({
          data: {
            userId: testUser.id,
            amount: 10000,
          },
        });

        // Try login again
        const retryLogin = await axios.post(API_URL, {
          query: loginMutation,
        });

        token = retryLogin.data.data.login.token;
        userId = retryLogin.data.data.login.user.id;
      } else {
        token = loginResponse.data.data.login.token;
        userId = loginResponse.data.data.login.user.id;
      }

      console.log(`✅ Logged in as user: ${userId}\n`);
    } catch (error) {
      console.error('❌ Failed to login. Make sure the server is running.');
      throw error;
    }

    // Query metric cards
    const metricCardsQuery = `
      query {
        getUserMetricCards {
          title
          value
          valueUnit
          valueType
          change
          changeType
          changeExtraData
          extraData
        }
      }
    `;

    console.log('📊 Querying getUserMetricCards...\n');

    const response = await axios.post(
      API_URL,
      { query: metricCardsQuery },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.data.errors) {
      console.error('❌ GraphQL Errors:', response.data.errors);
      throw new Error('GraphQL query failed');
    }

    const metricCards = response.data.data.getUserMetricCards;

    console.log('📋 Metric Cards Result:');
    console.log('======================\n');
    
    metricCards.forEach((card: any, index: number) => {
      console.log(`Card ${index + 1}: ${card.title}`);
      console.log(`  Value: ${card.value} ${card.valueUnit || ''}`);
      if (card.change !== null) {
        console.log(`  Change: ${card.change} ${card.changeType || ''}`);
      }
      if (card.changeExtraData) {
        console.log(`  Extra: ${card.changeExtraData}`);
      }
      if (card.extraData) {
        console.log(`  Info: ${card.extraData}`);
      }
      console.log('');
    });

    console.log('\n📊 Raw JSON Output:');
    console.log(JSON.stringify(metricCards, null, 2));

    console.log('\n✅ Test completed successfully!');
    console.log('\n💡 To add test positions, use the frontend or other test scripts');
    console.log('   to create portfolio positions, then run this test again.');

  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      console.error('\n❌ Cannot connect to server at', API_URL);
      console.error('   Please start the backend server first with: npm run start:dev');
    } else {
      console.error('\n❌ Test failed:', error);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMetricCards()
  .then(() => {
    console.log('\n✅ Test script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test script failed');
    process.exit(1);
  });
