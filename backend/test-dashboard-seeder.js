const { ApolloClient, InMemoryCache, gql } = require('@apollo/client');

// Create Apollo Client
const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

// GraphQL mutations and queries
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        name
        email
        role
        avatar
        createdAt
      }
    }
  }
`;

const START_DASHBOARD_SEEDING_MUTATION = gql`
  mutation StartDashboardSeeding($startDate: String!, $endDate: String!) {
    startDashboardSeeding(startDate: $startDate, endDate: $endDate)
  }
`;

const STOP_DASHBOARD_SEEDING_MUTATION = gql`
  mutation StopDashboardSeeding {
    stopDashboardSeeding
  }
`;

const GET_DASHBOARD_SEEDING_STATUS_QUERY = gql`
  query GetDashboardSeedingStatus {
    getDashboardSeedingStatus
  }
`;

const GET_SYSTEM_DASHBOARD_QUERY = gql`
  query GetSystemDashboard($input: SystemDashboardInput!) {
    getSystemDashboard(input: $input) {
      totalRevenue {
        startDate
        endDate
      }
      totalTradesExecuted {
        startDate
        endDate
      }
      winRate {
        startDate
        endDate
      }
      maxDrawdown {
        startDate
        endDate
      }
      equityAndDrawdown {
        date
        equity
        maxDrawdown
      }
      pnlOverTime {
        date
        pnl
      }
      mostTradedStocks {
        ticker
        companyName
        volume
        shareOfVolume
      }
      arpu {
        startDate
        endDate
      }
      churnRate {
        startDate
        endDate
      }
      averageTradeSize {
        startDate
        endDate
      }
      marginCallAlerts {
        startDate
        endDate
      }
      serviceUptime {
        startDate
        endDate
      }
      topUsers {
        id
        name
        avatar
        pnl
        totalValue
      }
    }
  }
`;

async function testDashboardSeeder() {
  try {
    console.log('🔐 Testing Dashboard Seeder API...');

    // Step 1: Login to get access token
    console.log('📝 Step 1: Logging in as admin...');
    const loginResult = await client.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        input: {
          email: 'admin@example.com', // Use the seeded admin user
          password: 'admin123',
        },
      },
    });

    if (!loginResult.data?.login?.accessToken) {
      throw new Error('Login failed - no access token received');
    }

    const { accessToken, user } = loginResult.data.login;
    console.log('✅ Login successful!');
    console.log(`👤 User: ${user.name} (${user.role})`);
    console.log(`🔑 Token: ${accessToken.substring(0, 20)}...`);

    // Step 2: Set the authorization header for subsequent requests
    const { ApolloLink } = require('@apollo/client');
    client.setLink(
      new ApolloLink((operation, forward) => {
        operation.setContext({
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });
        return forward(operation);
      }).concat(client.link),
    );

    // Step 3: Check initial seeding status
    console.log('📊 Step 2: Checking initial seeding status...');
    const initialStatus = await client.query({
      query: GET_DASHBOARD_SEEDING_STATUS_QUERY,
      fetchPolicy: 'no-cache',
    });
    console.log(
      'Initial status:',
      JSON.parse(initialStatus.data.getDashboardSeedingStatus),
    );

    // Step 4: Start seeding
    console.log('🚀 Step 3: Starting dashboard seeding...');
    const dashboardInput = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    };

    const startResult = await client.mutate({
      mutation: START_DASHBOARD_SEEDING_MUTATION,
      variables: {
        startDate: dashboardInput.startDate,
        endDate: dashboardInput.endDate,
      },
    });
    console.log(
      'Start result:',
      JSON.parse(startResult.data.startDashboardSeeding),
    );

    // Step 5: Wait a moment and check status
    console.log('⏳ Step 4: Waiting 5 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const statusAfterStart = await client.query({
      query: GET_DASHBOARD_SEEDING_STATUS_QUERY,
      fetchPolicy: 'no-cache',
    });
    console.log(
      'Status after start:',
      JSON.parse(statusAfterStart.data.getDashboardSeedingStatus),
    );

    // Step 6: Test system dashboard data
    console.log('📈 Step 5: Testing system dashboard data...');
    const dashboardResult = await client.query({
      query: GET_SYSTEM_DASHBOARD_QUERY,
      variables: { input: dashboardInput },
      fetchPolicy: 'no-cache',
    });

    console.log('✅ Dashboard data after seeding:');
    console.log(JSON.stringify(dashboardResult.data, null, 2));

    // Step 7: Wait a bit more and test again
    console.log('⏳ Step 6: Waiting 10 seconds for more data...');
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const dashboardResult2 = await client.query({
      query: GET_SYSTEM_DASHBOARD_QUERY,
      variables: { input: dashboardInput },
      fetchPolicy: 'no-cache',
    });

    console.log('✅ Dashboard data after 10 seconds:');
    console.log(JSON.stringify(dashboardResult2.data, null, 2));

    // Step 8: Stop seeding
    console.log('🛑 Step 7: Stopping dashboard seeding...');
    const stopResult = await client.mutate({
      mutation: STOP_DASHBOARD_SEEDING_MUTATION,
    });
    console.log(
      'Stop result:',
      JSON.parse(stopResult.data.stopDashboardSeeding),
    );

    // Step 9: Check final status
    const finalStatus = await client.query({
      query: GET_DASHBOARD_SEEDING_STATUS_QUERY,
      fetchPolicy: 'no-cache',
    });
    console.log(
      'Final status:',
      JSON.parse(finalStatus.data.getDashboardSeedingStatus),
    );

    console.log('✅ Dashboard Seeder API test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing Dashboard Seeder API:');
    console.error(error.message);
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err) => {
        console.error('GraphQL Error:', err.message);
      });
    }
  }
}

// Run the test
testDashboardSeeder();
