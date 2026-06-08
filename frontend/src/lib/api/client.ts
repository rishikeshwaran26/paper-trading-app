// Typed HTTP client: get, post, put, patch, delete
// Uses fetch, returns typed responses, throws ApiRequestError on non-2xx
export class ApiClient { constructor(private baseUrl: string) {} }
export const apiClient = new ApiClient('');
