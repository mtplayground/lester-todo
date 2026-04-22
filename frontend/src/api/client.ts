export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
  };
};

type RequestOptions<TBody> = Omit<RequestInit, "body" | "headers"> & {
  body?: TBody;
  headers?: HeadersInit;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly payload?: ApiErrorPayload;

  constructor(status: number, payload?: ApiErrorPayload) {
    super(payload?.error.message ?? `Request failed with status ${status}`);
    this.name = "ApiClientError";
    this.status = status;
    this.code = payload?.error.code ?? "unknown_error";
    this.payload = payload;
  }
}

export async function apiRequest<TResponse, TBody = undefined>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { body, headers, ...init } = options;

  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson
    ? ((await response.json()) as TResponse | ApiErrorPayload)
    : undefined;

  if (!response.ok) {
    throw new ApiClientError(
      response.status,
      isJson ? (payload as ApiErrorPayload) : undefined,
    );
  }

  return payload as TResponse;
}
