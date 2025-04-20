/**
 * Utility type that resolves a type to show all its properties on hover.
 * If T is a Promise, it extracts the type U from Promise<U>.
 * Otherwise, it returns T as is.
 */
export type Resolve<T> = {
  [K in keyof T]: T[K];
} & {};
