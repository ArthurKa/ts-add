import npmRegistryFetch from 'npm-registry-fetch';
import { parsedCLIParams } from './parsedCLIParams';

const { registry, _auth } = parsedCLIParams;

interface IPackage {
  versions: Record<string, {
    types?: unknown;
    typings?: unknown;
    files?: string[];
    deprecated?: unknown;
  }>;
  'dist-tags': {
    latest: string;
    [key: string]: string;
  };
}

export const fetchPackage = (name: string) => npmRegistryFetch.json(name, {
  ...registry && { registry },
  ..._auth && { headers: { Authorization: `Basic ${_auth}` } },
}) as any as Promise<IPackage>;
