import { gqlRequest } from './graphqlClient';

// GraphQL queries and mutations for admin operations
const GET_ALL_USERS_QUERY = `
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

const GET_USER_BY_ID_QUERY = `
  query GetUserById($userId: String!) {
    getUserById(userId: $userId) {
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

const BAN_USER_MUTATION = `
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

const UNBAN_USER_MUTATION = `
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

const PROMOTE_TO_ADMIN_MUTATION = `
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

const DEMOTE_FROM_ADMIN_MUTATION = `
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

// TypeScript interfaces
export interface AdminUser {
  id: string;
  name?: string | null;
  email: string;
  role: string;
  isBanned: boolean;
  avatar?: string | null;
  createdAt: string;
  balance: number;
}

// API functions
export const adminApi = {
  async getAllUsers(token: string): Promise<AdminUser[]> {
    const result = await gqlRequest<{ getAllUsers: AdminUser[] }>(
      GET_ALL_USERS_QUERY,
      {},
      token
    );
    return result.getAllUsers;
  },

  async getUserById(userId: string, token: string): Promise<AdminUser> {
    const result = await gqlRequest<{ getUserById: AdminUser }>(
      GET_USER_BY_ID_QUERY,
      { userId },
      token
    );
    return result.getUserById;
  },

  async banUser(userId: string, token: string): Promise<AdminUser> {
    const result = await gqlRequest<{ banUser: AdminUser }>(
      BAN_USER_MUTATION,
      { userId },
      token
    );
    return result.banUser;
  },

  async unbanUser(userId: string, token: string): Promise<AdminUser> {
    const result = await gqlRequest<{ unbanUser: AdminUser }>(
      UNBAN_USER_MUTATION,
      { userId },
      token
    );
    return result.unbanUser;
  },

  async promoteToAdmin(userId: string, token: string): Promise<AdminUser> {
    const result = await gqlRequest<{ promoteToAdmin: AdminUser }>(
      PROMOTE_TO_ADMIN_MUTATION,
      { userId },
      token
    );
    return result.promoteToAdmin;
  },

  async demoteFromAdmin(userId: string, token: string): Promise<AdminUser> {
    const result = await gqlRequest<{ demoteFromAdmin: AdminUser }>(
      DEMOTE_FROM_ADMIN_MUTATION,
      { userId },
      token
    );
    return result.demoteFromAdmin;
  },
};
