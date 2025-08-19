import { gqlRequest } from './graphqlClient';

// GraphQL queries and mutations for dashboard seeder operations
const START_DASHBOARD_SEEDING_MUTATION = `
  mutation StartDashboardSeeding($startDate: String!, $endDate: String!) {
    startDashboardSeeding(startDate: $startDate, endDate: $endDate)
  }
`;

const STOP_DASHBOARD_SEEDING_MUTATION = `
  mutation StopDashboardSeeding {
    stopDashboardSeeding
  }
`;

const GET_DASHBOARD_SEEDING_STATUS_QUERY = `
  query GetDashboardSeedingStatus {
    getDashboardSeedingStatus
  }
`;

// TypeScript interfaces
export interface SeedingStatus {
  isSeeding: boolean;
  status: 'active' | 'inactive';
  dateRange?: {
    startDate: string;
    endDate: string;
  } | null;
}

export interface SeedingResult {
  status: 'started' | 'stopped' | 'already_seeding' | 'not_seeding';
  message: string;
}

// API functions
export const dashboardSeederApi = {
  async startSeeding(
    startDate: string,
    endDate: string,
    token: string
  ): Promise<SeedingResult> {
    const result = await gqlRequest<{ startDashboardSeeding: string }>(
      START_DASHBOARD_SEEDING_MUTATION,
      { startDate, endDate },
      token
    );
    return JSON.parse(result.startDashboardSeeding);
  },

  async stopSeeding(token: string): Promise<SeedingResult> {
    const result = await gqlRequest<{ stopDashboardSeeding: string }>(
      STOP_DASHBOARD_SEEDING_MUTATION,
      {},
      token
    );
    return JSON.parse(result.stopDashboardSeeding);
  },

  async getSeedingStatus(token: string): Promise<SeedingStatus> {
    const result = await gqlRequest<{ getDashboardSeedingStatus: string }>(
      GET_DASHBOARD_SEEDING_STATUS_QUERY,
      {},
      token
    );
    return JSON.parse(result.getDashboardSeedingStatus);
  },
};
