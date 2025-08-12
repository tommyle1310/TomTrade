export type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

const backendHost = process.env.NEXT_PUBLIC_BACKEND_URL || 'localhost';
const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || '4000';
export const GRAPHQL_URL = `http://${backendHost}:${backendPort}/graphql`;

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string
): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const rawText = await res.text();
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Expected JSON from ${GRAPHQL_URL} but received '${contentType}'. Status ${
        res.status
      }. Body starts with: ${rawText.slice(
        0,
        80
      )}... Check NEXT_PUBLIC_BACKEND_URL/PORT and that /graphql is reachable.`
    );
  }
  const json = JSON.parse(rawText) as GraphQLResponse<T>;
  if (!res.ok || json.errors) {
    const message =
      json.errors?.map((e) => e.message).join('; ') || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return json.data as T;
}

export async function loginMutation(input: {
  email: string;
  password: string;
}) {
  const query = `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        accessToken
        user { id email }
      }
    }
  `;
  return gqlRequest<{
    login: { accessToken: string; user: { id: string; email: string } };
  }>(query, { input });
}

export async function signUpMutation(input: {
  name?: string;
  email: string;
  password: string;
}) {
  const query = `
    mutation SignUp($input: SignUpInput!) {
      signUp(input: $input) {
        accessToken
        user { id email }
      }
    }
  `;
  return gqlRequest<{
    signUp: { accessToken: string; user: { id: string; email: string } };
  }>(query, { input });
}
