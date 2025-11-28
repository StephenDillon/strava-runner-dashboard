const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export class StravaClient {
  private accessToken: string | null = null;
  private expiresAt: number | null = null;

  constructor(accessToken?: string, expiresAt?: number) {
    this.accessToken = accessToken || null;
    this.expiresAt = expiresAt || null;
  }

  /**
   * Refresh the access token using the backend API
   */
  async refreshAccessToken(): Promise<string> {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.expiresAt = data.expires_at;

    return this.accessToken!;
  }

  /**
   * Ensure we have a valid access token
   */
  async ensureValidToken(): Promise<string> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    // Check if token is expired (with 5 minute buffer)
    if (this.expiresAt && Date.now() / 1000 > this.expiresAt - 300) {
      return await this.refreshAccessToken();
    }

    return this.accessToken!;
  }

  /**
   * Centralized fetch method that handles token refresh on 401 errors
   */
  async fetchFromStrava<T>(
    endpoint: string,
    params?: URLSearchParams
  ): Promise<T> {
    const token = await this.ensureValidToken();

    const url = params 
      ? `${STRAVA_API_BASE}${endpoint}?${params.toString()}`
      : `${STRAVA_API_BASE}${endpoint}`;

    let response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle 401 - check if it's an invalid token error
    if (response.status === 401) {
      try {
        const errorData = await response.json();
        
        // Check if it matches the specific authorization error format
        if (
          errorData.message === "Authorization Error" &&
          errorData.errors?.[0]?.field === "access_token" &&
          errorData.errors?.[0]?.code === "invalid"
        ) {
          console.log('Access token invalid, refreshing...');
          
          // Refresh the token and retry
          await this.refreshAccessToken();
          const newToken = await this.ensureValidToken();
          
          response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
          
          // Check if retry was successful
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch ${endpoint} after token refresh:`, response.status, errorText);
            throw new Error(`Failed to fetch ${endpoint}`);
          }
          
          return await response.json();
        }
      } catch (parseError) {
        // If we can't parse the error, just throw a generic error
        console.error(`401 error on ${endpoint}, could not parse error response`);
        throw new Error(`Unauthorized: Failed to fetch ${endpoint}`);
      }
    }

    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await response.text();
      } catch (e) {
        // ignore if we can't read the error text
      }
      console.error(`Failed to fetch ${endpoint}:`, response.status, errorText);
      throw new Error(`Failed to fetch ${endpoint}`);
    }

    return await response.json();
  }

  /**
   * Get updated token data after refresh
   */
  getTokenData() {
    return {
      accessToken: this.accessToken,
      expiresAt: this.expiresAt
    };
  }
}

// Server-side helper function to create a client from request cookies
export function getStravaClientFromCookies(cookies: any): StravaClient {
  const accessToken = cookies.get('strava_access_token')?.value;
  const expiresAt = cookies.get('strava_expires_at')?.value;
  
  return new StravaClient(
    accessToken,
    expiresAt ? parseInt(expiresAt) : undefined
  );
}

// Client-side helper function to create a client from status API
export async function getClientSideStravaClient(): Promise<StravaClient | null> {
  try {
    const response = await fetch('/api/v1/auth/status');
    const data = await response.json();
    
    if (!data.authenticated) {
      return null;
    }
    
    // Get token info from the refresh endpoint to initialize the client
    const refreshResponse = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    
    if (!refreshResponse.ok) {
      return null;
    }
    
    const tokenData = await refreshResponse.json();
    return new StravaClient(tokenData.access_token, tokenData.expires_at);
  } catch (error) {
    console.error('Failed to initialize Strava client:', error);
    return null;
  }
}
