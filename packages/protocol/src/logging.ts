import type { ArcaneJSLogEntryStackFrame } from '.';

export type Logger = {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn(message: string, ...args: unknown[]): void;
  warn(error: Error, message?: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  error(error: Error, message?: string, ...args: unknown[]): void;
};

/**
 * Stricter version of {@link Logger} that requires all information to be
 * provided in a single argument,
 * to encourage consistent construction of stack traces.
 */
export type StrictLogger = {
  debug: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string | Error) => void;
  error: (message: string | Error) => void;
};

export const getStackFramesFromError = (
  error: unknown,
): ArcaneJSLogEntryStackFrame => {
  if (typeof error === 'string') {
    return { message: error, stack: null, cause: null };
  }

  if (!(error instanceof Error)) {
    return { message: String(error), stack: null, cause: null };
  }

  const frame: ArcaneJSLogEntryStackFrame = {
    message: error.message,
    stack: error.stack ?? null,
    cause: error.cause ? getStackFramesFromError(error.cause) : null,
  };

  return frame;
};

export const reconstructErrorFromFrame = (
  frame: ArcaneJSLogEntryStackFrame,
): Error => {
  const error = new Error(frame.message);
  error.stack = frame.stack ?? undefined;
  if (frame.cause) {
    error.cause = reconstructErrorFromFrame(frame.cause);
  }
  return error;
};
