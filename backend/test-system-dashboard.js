const { ApolloClient, InMemoryCache, gql } = require('@apollo/client');

// Create Apollo Client
const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache(),
});

// GraphQL query for system dashboard
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

async function testSystemDashboard() {
  try {
    console.log('Testing System Dashboard API...');

    const input = {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      compareStartDate: '2024-12-01',
      compareEndDate: '2024-12-31',
    };

    const result = await client.query({
      query: GET_SYSTEM_DASHBOARD,
      variables: { input },
      fetchPolicy: 'no-cache',
    });

    console.log('✅ System Dashboard API Response:');
    console.log(JSON.stringify(result.data, null, 2));
  } catch (error) {
    console.error('❌ Error testing System Dashboard API:');
    console.error(error.message);
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err) => {
        console.error('GraphQL Error:', err.message);
      });
    }
  }
}

// Run the test
testSystemDashboard();
