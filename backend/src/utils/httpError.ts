export class HttpError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const isHttpError = (err: unknown): err is HttpError => {
  return !!err && typeof err === 'object' && 'statusCode' in (err as any);
};

export default HttpError;
