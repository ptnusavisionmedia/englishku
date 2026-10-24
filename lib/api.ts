export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** Convert any thrown value into a safe, friendly message (never raw database text). */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  return 'Ups, ada yang kurang pas. Coba lagi ya!';
}

/** Reject if `promise` does not settle in `ms`, so startup can never wait forever. */
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new AppError(message, 'timeout')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
