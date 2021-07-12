import fs from 'fs';
import path from 'path';
import btoa from 'btoa';
import atob from 'atob';
import yargsParser, { Arguments, Options } from 'yargs-parser';
// WARN
// eslint-disable-next-line import/no-cycle
import { printMessage } from './printMessage';
import { ObjEntries, ObjKeys, ValueOf } from './tsUtils';
import { parseURL } from './parseURL';

// eslint-disable-next-line import/no-mutable-exports
export let withFlagCredentials = false;

export const flagsWithDefaulValues = {
  'dry-run': false,
  'save-dev': false,
  'save-prod': false,
  'types-only': false,
  'ignore-package-json': false,
  'allow-prerelease': false,
  silent: false,
  registry: '',
  _auth: '',
  login: '',
  password: '',
  completion: false,
  version: false,
  help: false,
  ':make-autocompletion-flags': false,
  ':test-flags-run': false,
  // 'check-package-json-only': false,
  // 'ts-version': '',
};
export const flagAliases: FlagAliases = {
  'dry-run': 'd',
  'save-dev': 'D',
  'save-prod': 'P',
  'types-only': 't',
  'ignore-package-json': 'i',
  'allow-prerelease': 'ap',
  silent: 's',
  registry: 'r',
  _auth: 'a',
  login: ['l', 'username', 'u'],
  password: 'p',
  completion: 'c',
  version: 'v',
  help: 'h',
  ':make-autocompletion-flags': [],
  ':test-flags-run': [],
  // 'check-package-json-only': 'co',
};

type FlagsWithDefaultValues = typeof flagsWithDefaulValues;
export type Flag = keyof FlagsWithDefaultValues;
function isFlag(e: any): e is Flag {
  return ObjKeys(flagsWithDefaulValues).includes(e);
}

export type FlagSynonym = Exclude<(
  | 'P' | 'D' | 'r' | 'a' | 'ap' | 'c' | 'd' | 't' | 'i'
  | 'p' | 'l' | 'u' | 'username' | 'v' | 'h' | 's'
), Flag>;

type FlagAliases = Record<Flag, FlagSynonym | FlagSynonym[]>;

interface TransformedOptions {
  boolean: NonNullable<Options['boolean']>;
  string: NonNullable<Options['string']>;
  alias: NonNullable<Options['alias']>;
}

interface ParsedCLIParams extends FlagsWithDefaultValues {
  _: Arguments['_'];
}

function transformOptions(opts: FlagAliases): TransformedOptions {
  const tOptions: TransformedOptions = {
    boolean: [],
    string: [],
    alias: {},
  };
  const allFlagSynonyms: FlagSynonym[] = [];

  for(const [flag, val] of ObjEntries(opts)) {
    const flagSynonyms = Array.isArray(val) ? val : [val];
    const flagType = typeof flagsWithDefaulValues[flag];

    if(flagType === 'boolean' || flagType === 'string') {
      tOptions[flagType].push(flag);
    } else {
      printMessage.warning(`Attention: type of flag "${flag}" is neither string nor boolean!`);
    }
    tOptions.alias[flag] = flagSynonyms;

    for(const flagSynonym of flagSynonyms) {
      if(!allFlagSynonyms.includes(flagSynonym)) {
        allFlagSynonyms.push(flagSynonym);
      } else {
        printMessage.warning(`Attention: synonym "${flagSynonym}" of flag "${flag}" is a duplicate!`);
      }
    }
  }

  return tOptions;
}

const parserOptions = {
  ...transformOptions(flagAliases),
  configuration: {
    'camel-case-expansion': false,
    'dot-notation': false,
    'parse-positional-numbers': false,
    'boolean-negation': false,
    'duplicate-arguments-array': false,
    'strip-aliased': true,
    'unknown-options-as-args': true,
    'negation-prefix': '',
  },
};

function parseCLIParams(): ParsedCLIParams {
  const cliParams = process.argv.slice(2).join(' ');
  const parsedParams = yargsParser(cliParams, parserOptions);

  const argv = {
    ...flagsWithDefaulValues,
    ...Object.fromEntries(
      ObjEntries(parsedParams)
        .map(e => {
          const [key, val] = e;

          if(val === false) {
            parsedParams._.push('false');
            return [key, true];
          }

          return e;
        }),
    ) as Pick<ReturnType<typeof yargsParser>, '_'>,
  };
  argv[':test-flags-run'] = false;

  if(!argv[':make-autocompletion-flags']) {
    const unknownFlags = argv._.filter(e => e.startsWith('-'));
    if(unknownFlags.length) {
      printMessage.error(`Unknown flag "${unknownFlags[0]}".`);
      process.exit(1);
    }
  }

  argv._ = [...new Set(argv._)];

  if(argv.registry || argv._auth || argv.login || argv.password) {
    withFlagCredentials = true;
  }

  try {
    const { registry, _auth, login, password } = Object.fromEntries(
      fs
        .readFileSync(path.resolve('.npmrc'))
        .toString()
        .trim()
        .split('\n')
        .map(row => (
          row
            .split('=')
            .map(e => e.trim())
        )),
    );

    if(!argv.registry && registry) {
      argv.registry = registry;
    }
    if(!argv._auth && _auth) {
      argv._auth = _auth;
    }
    if(!argv.login && login) {
      argv.login = login;
    }
    if(!argv.password && password) {
      argv.password = password;
    }
  } catch {}

  if(!argv.registry) {
    argv.registry = 'https://registry.npmjs.org';
  }

  try {
    const { registry } = argv;
    const { hrefWithNoCredentials, username, password } = parseURL(registry);

    argv.registry = hrefWithNoCredentials;
    if(username) {
      argv.login = username;
    }
    if(password) {
      argv.password = password;
    }
    if(argv.login && argv.password) {
      argv._auth = btoa(`${argv.login}:${argv.password}`);
    }
    if(argv._auth) {
      const [login, password] = atob(argv._auth).split(':');
      if(login) {
        argv.login = login;
      }
      if(password) {
        argv.password = password;
      }
    }
  } catch {}

  return argv;
}

export const parsedCLIParams = parseCLIParams();

export function getConfigValueByFlagOrSynonym(key: Flag | FlagSynonym): ValueOf<typeof flagsWithDefaulValues> {
  if(isFlag(key)) {
    return parsedCLIParams[key];
  }

  const alias = ObjEntries(flagAliases).find(([, e]) => e === key || e.includes(key));
  if(!alias) {
    throw new Error('This should never happen.');
  }

  return parsedCLIParams[alias[0]];
}

const clearHyphens = (flag: string) => flag.replace(/^-+/, '');
const clearPostfixEqualitySigns = (flag: string) => flag.replace(/=+$/, '');
const clearFlag = (flag: string) => clearHyphens(clearPostfixEqualitySigns(flag));

export const makeFlagWithPrefix = (flag: string) => clearFlag(flag).length > 1 ? `--${flag}` : `-${flag}`;

export function isFlagOrSynonymInCommandLine(key: string) {
  const cliParams = process.argv.slice(2).join(' ');
  const { aliases } = yargsParser.detailed(cliParams, parserOptions);

  const keys = [
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...aliases[clearFlag(key)]!.map(makeFlagWithPrefix),
    clearPostfixEqualitySigns(key),
  ];

  const arr = cliParams
    .split(/\s+/)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .map(e => e.split(/=/)[0]!)
    .flatMap(e => {
      const match = e.match(/^-([a-z]+)$/i);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return !match ? e : match[1]!.split('').map(e => `-${e}`);
    });

  return arr.some(e => keys.includes(e));
}

export const flagStack: Partial<Record<Flag, boolean>> = {};
export function getConfig<T extends Flag>(flag: T): FlagsWithDefaultValues[T] {
  flagStack[flag] = true;
  return parsedCLIParams[flag];
}
