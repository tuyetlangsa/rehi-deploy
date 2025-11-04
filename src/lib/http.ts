import { BaseResponse } from "@/constants/api-result";
import { getAccessToken } from "@auth0/nextjs-auth0";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

type ApiResponse<T> = BaseResponse<T> & {
  statusCode: number;
};

export interface HttpOptions {
  token?: string | null;
  signal?: AbortSignal;
  timeoutMs?: number;
}

const instance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5204",
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error)
);

async function handleRequest<T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: unknown,
  options: HttpOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      timeout: options.timeoutMs,
      signal: options.signal,
    };

    if (options.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${options.token}`,
      };
    } else {
      const accessToken = await getAccessToken();
      if (accessToken) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }
    }

    const response = await instance.request<BaseResponse<T>>(config);
    return {
      ...response.data,
      statusCode: response.status,
    };
  } catch (err) {
    const error = err as AxiosError<unknown>;
    console.error("API Error:", error);
    return {
      ...(error.response?.data as BaseResponse<T>),
      statusCode: error.response?.status || 0,
    };
  }
}

export const http = {
  get: <T>(url: string, options?: HttpOptions) =>
    handleRequest<T>("get", url, undefined, options),
  post: <T>(url: string, data?: unknown, options?: HttpOptions) =>
    handleRequest<T>("post", url, data, options),
  put: <T>(url: string, data?: unknown, options?: HttpOptions) =>
    handleRequest<T>("put", url, data, options),
  patch: <T>(url: string, data?: unknown, options?: HttpOptions) =>
    handleRequest<T>("patch", url, data, options),
  delete: <T>(url: string, data?: unknown, options?: HttpOptions) =>
    handleRequest<T>("delete", url, data, options),
};
