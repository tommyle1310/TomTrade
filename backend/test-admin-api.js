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

const GET_ALL_USERS_QUERY = gql`
  query GetAllUsers {
    getAllUsers {
      id
      name
      email
      role
      isBanned
      avatar
      createdAt
      balance
    }
  }
`;

const BAN_USER_MUTATION = gql`
  mutation BanUser($userId: String!) {
    banUser(userId: $userId) {
      id
      name
      email
      role
      isBanned
      avatar
      createdAt
      balance
    }
  }
`;

const UNBAN_USER_MUTATION = gql`
  mutation UnbanUser($userId: String!) {
    unbanUser(userId: $userId) {
      id
      name
      email
      role
      isBanned
      avatar
      createdAt
      balance
    }
  }
`;

const PROMOTE_TO_ADMIN_MUTATION = gql`
  mutation PromoteToAdmin($userId: String!) {
    promoteToAdmin(userId: $userId) {
      id
      name
      email
      role
      isBanned
      avatar
      createdAt
      balance
    }
  }
`;

const DEMOTE_FROM_ADMIN_MUTATION = gql`
  mutation DemoteFromAdmin($userId: String!) {
    demoteFromAdmin(userId: $userId) {
      id
      name
      email
      role
      isBanned
      avatar
      createdAt
      balance
    }
  }
`;

async function testAdminAPI() {
  try {
    console.log('🔐 Testing Admin API...');

    // Step 1: Login to get access token
    console.log('📝 Step 1: Logging in as admin...');
    const loginResult = await client.mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        input: {
          email: 'admin@tomtrade.com', // Replace with actual admin credentials
          password: 'admin123', // Replace with actual admin password
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

    // Step 3: Test getting all users
    console.log('📊 Step 2: Testing GetAllUsers query...');
    const usersResult = await client.query({
      query: GET_ALL_USERS_QUERY,
      fetchPolicy: 'no-cache',
    });

    console.log('✅ GetAllUsers Response:');
    console.log(JSON.stringify(usersResult.data, null, 2));

    // Step 4: Test user actions (if users exist)
    const users = usersResult.data.getAllUsers;
    if (users.length > 0) {
      const testUser = users.find((u) => u.role !== 'ADMIN') || users[0];
      console.log(
        `🧪 Testing actions on user: ${testUser.name || testUser.email}`,
      );

      // Test ban/unban
      console.log('🔒 Testing ban user...');
      const banResult = await client.mutate({
        mutation: BAN_USER_MUTATION,
        variables: { userId: testUser.id },
      });
      console.log('Ban result:', banResult.data.banUser.isBanned);

      console.log('🔓 Testing unban user...');
      const unbanResult = await client.mutate({
        mutation: UNBAN_USER_MUTATION,
        variables: { userId: testUser.id },
      });
      console.log('Unban result:', unbanResult.data.unbanUser.isBanned);

      // Test promote/demote (only if user is not already admin)
      if (testUser.role !== 'ADMIN') {
        console.log('👑 Testing promote to admin...');
        const promoteResult = await client.mutate({
          mutation: PROMOTE_TO_ADMIN_MUTATION,
          variables: { userId: testUser.id },
        });
        console.log('Promote result:', promoteResult.data.promoteToAdmin.role);

        console.log('⬇️ Testing demote from admin...');
        const demoteResult = await client.mutate({
          mutation: DEMOTE_FROM_ADMIN_MUTATION,
          variables: { userId: testUser.id },
        });
        console.log('Demote result:', demoteResult.data.demoteFromAdmin.role);
      }
    }
  } catch (error) {
    console.error('❌ Error testing Admin API:');
    console.error(error.message);
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err) => {
        console.error('GraphQL Error:', err.message);
      });
    }
  }
}

// Run the test
testAdminAPI();
