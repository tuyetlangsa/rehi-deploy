interface GenericResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T | null;
  type: string | null;
  title: string | null;
  status: number | null;
  detail: string | null;
  extensions: Record<string, any> | null; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type BaseResponse<T> =
  | SuccessResponse<T>
  | ErrorResponse
  | ValidationErrorResponse;

export interface SuccessResponse<T> extends GenericResponse<T> {
  isSuccess: true;
  data: T;
}

export interface ErrorResponse extends GenericResponse<null> {
  isSuccess: false;
  data: null;
  type: string;
  title: string;
  status: number;
  detail: string;
}

export interface ValidationErrorResponse extends GenericResponse<null> {
  isSuccess: false;
  type: string;
  title: string;
  status: number;
  detail: string;
  extensions: {
    errors: {
      code: number;
      description: string;
    }[];
  };
}

export interface PagedResponse<T> extends GenericResponse<{ items: T }> {
  isSuccess: true;
  message: string;
  data: {
    items: T;
  };
  errorCode: null;
  extensions: {
    pageNumber: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
