// API response wrappers
export interface ApiResponse<T> { success: boolean; data: T }
export interface ApiError { success: false; error: { message: string; code: string } }
export interface PaginatedResponse<T> extends ApiResponse<T[]> { meta: { total: number; page: number; limit: number } }
