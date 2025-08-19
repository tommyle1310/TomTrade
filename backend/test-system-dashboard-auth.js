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

const GET_SYSTEM_DASHBOARD = gql`
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

async function testSystemDashboardWithAuth() {
  try {
    console.log('🔐 Testing System Dashboard API with Authentication...');
    
    // Step 1: Login to get access token
    console.log('📝 Step 1: Logging in...');
    const loginResult = await client.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        input: {
          email: 'admin@tomtrade.com', // Replace with actual admin credentials
          password: 'admin123' // Replace with actual admin password
        }
      }
    });

    if (!loginResult.data?.login?.accessToken) {
      throw new Error('Login failed - no access token received');
    }

    const { accessToken, user } = loginResult.data.login;
    console.log('✅ Login successful!');
    console.log(`👤 User: ${user.name} (${user.role})`);
    console.log(`🔑 Token: ${accessToken.substring(0, 20)}...`);

    // Step 2: Set the authorization header for subsequent requests
    client.setLink(
      new ApolloLink((operation, forward) => {
        operation.setContext({
          headers: {
            authorization: `Bearer ${accessToken}`
          }
        });
        return forward(operation);
      }).concat(client.link)
    );

    // Step 3: Test the system dashboard query
    console.log('📊 Step 2: Testing System Dashboard query...');
    
    const input = {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      compareStartDate: '2024-12-01',
      compareEndDate: '2024-12-31'
    };

    const dashboardResult = await client.query({
      query: GET_SYSTEM_DASHBOARD,
      variables: { input },
      fetchPolicy: 'no-cache'
    });

    console.log('✅ System Dashboard API Response:');
    console.log(JSON.stringify(dashboardResult.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing System Dashboard API with Auth:');
    console.error(error.message);
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach(err => {
        console.error('GraphQL Error:', err.message);
      });
    }
  }
}

// Import ApolloLink for setting headers
const { ApolloLink } = require('@apollo/client');

// Run the test
testSystemDashboardWithAuth();
