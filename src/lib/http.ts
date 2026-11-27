import { BaseResponse } from "@/constants/api-result";
import { API_BASE_URL } from "@/lib/api-base-url";
import { getAccessToken, getAccessTokenAfterRejection } from "@/lib/session";
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

type ApiResponse<T> = BaseResponse<T> & {
  statusCode: number;
};

export interface HttpOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
  const send = (token: string | null) =>
    instance.request<BaseResponse<T>>({
      method,
      url,
      data,
      timeout: options.timeoutMs,
      signal: options.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

  try {
    const token = await getAccessToken();
    let response: AxiosResponse<BaseResponse<T>>;
    try {
      response = await send(token);
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      if (status !== 401 || !token) throw err;
      response = await send(await getAccessTokenAfterRejection(token));
    }
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
