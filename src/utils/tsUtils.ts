type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export function ObjEntries<T>(obj: T): Entries<T> {
  return Object.entries(obj) as any;
}

export function ObjKeys<T>(obj: T): (keyof T)[] {
  return Object.keys(obj) as any;
}

export function ObjValues<T>(obj: T): (T[keyof T])[] {
  return Object.values(obj) as any;
}

export type ValueOf<T> = T[keyof T];
