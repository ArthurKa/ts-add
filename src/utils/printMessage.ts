import chalk from 'chalk';
import commandLineUsage, { OptionDefinition } from 'command-line-usage';
// WARN
// eslint-disable-next-line import/no-cycle
import {
  getConfig,
  makeFlagWithPrefix,
  flagsWithDefaultValues,
  flagAliases,
  Flag,
  FlagSynonym,
} from './parsedCLIParams';

import { ObjEntries } from './tsUtils';

const pathToPackageJson = '../../package.json';

function multilineTrimLeft(strings: TemplateStringsArray, ...params: unknown[]): string {
  const s = strings.map((e, i) => `${e}${i === params.length ? '' : params[i]}`).join('');

  const whiteSpaceAmount = s.match(/\n?(\s*)\S/)?.[1]?.length;

  let result = s.trim();
  if(whiteSpaceAmount) {
    const re = new RegExp(`\\n[\\t ]{1,${whiteSpaceAmount}}`, 'g');
    result = result.replace(re, '\n');
  }

  return result;
}

interface IPrintMessage {
  noTypesDeclaration(packageName: string): void;
  endNoTypesDeclaration(): void;
  noPackage(packageName: string): void;
  noParams(): void;
  unauthorized(): void;
  version(): void;
  help(): void;
  completion(): void;
  command(command: string): void;
  error(command: string): void;
  warning(command: string): void;
}

const noTypesPackages: string[] = [];
export const printMessage: IPrintMessage = {
  noTypesDeclaration(packageName) {
    if(getConfig('silent') || getConfig(':test-flags-run')) {
      return;
    }

    noTypesPackages.push(packageName);

    if(noTypesPackages.length === 2) {
      this.warning('Notice that the next packages have no type declarations:');
      noTypesPackages.forEach(e => this.warning(` - ${e}`));
    }
    if(noTypesPackages.length > 2) {
      this.warning(` - ${packageName}`);
    }
  },

  endNoTypesDeclaration() {
    if(getConfig('silent') || getConfig(':test-flags-run')) {
      return;
    }

    if(noTypesPackages.length === 1) {
      this.warning(`Notice that "${noTypesPackages[0]}" has no type declarations.`);
    }
    if(noTypesPackages.length) {
      console.warn();
    }
  },

  noPackage(packageName) {
    if(getConfig('silent') || getConfig(':test-flags-run')) {
      return;
    }

    this.endNoTypesDeclaration();
    this.error(`No such package as ${packageName}.`);
  },

  noParams() {
    if(getConfig('silent') || getConfig(':test-flags-run')) {
      return;
    }

    this.error('No packages to install. Provide some params.');
  },

  unauthorized() {
    if(getConfig('silent') || getConfig(':test-flags-run')) {
      return;
    }

    this.error('Unauthorized. Provide correct _auth Basic token or pair login and password.');
  },

  version() {
    if(getConfig(':test-flags-run')) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
    const { version } = require(pathToPackageJson);

    console.info(`v${version}`);
  },

  help() {
    if(getConfig(':test-flags-run')) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
    const { name, version } = require(pathToPackageJson);

    const optionDescriptions: Record<Flag, string> = {
      'dry-run': 'Run without installing any packages.',
      'save-dev': 'Save regular (not {italic @types}) packages to devDependencies.',
      'save-prod': 'Save {italic @types} packages to regular dependencies.',
      'types-only': 'Install only {italic @types} packages.',
      'ignore-package-json': 'Add "latest" tag for all installing packages in case of latest versions are required to install.',
      'allow-prerelease': 'Allow to install prerelease versions of {italic @types} packages.',
      silent: 'Hide output messages.',
      registry: 'Specify any other package registry besides https://registry.npmjs.org (this value can be stored in .npmrc as {bold registry} key).',
      _auth: 'Set Auth Basic {italic token} for custom registry (this value can be stored in .npmrc as {bold _auth} key).',
      login: 'Set Auth Basic {italic username} for custom registry (this value can be stored in .npmrc as {bold login} key).',
      password: 'Set Auth Basic {italic password} for custom registry (this value can be stored in .npmrc as {bold password} key).',
      completion: 'Output bash CLI autocompletion alias and exit.',
      version: 'Output version information and exit.',
      help: 'Display this help and exit.',
      ':make-autocompletion-flags': '',
      ':test-flags-run': '',
    };

    const options: OptionDefinition[] = ObjEntries(optionDescriptions)
      .filter(e => e[1])
      .flatMap(([name, desc]) => {
        const synonyms = flagAliases[name];
        const aliases = Array.isArray(synonyms) ? synonyms : [synonyms];

        const alias = aliases.shift();
        const type = { name: typeof flagsWithDefaultValues[name] };
        const description = (() => {
          const [firstWord, ...restWords] = desc.split(' ');

          return `{underline ${firstWord}} ${restWords.join(' ')}`;
        })();

        const result = [{
          name,
          description,
          alias: alias && makeFlagWithPrefix(alias).slice(1),
          type,
        } as OptionDefinition];

        while(aliases.length) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const synonymName = aliases.shift()!;
          const alias = aliases.shift();

          result.push({
            name: synonymName,
            alias,
            description: `{underline Alias} for {bold ${name}}.`,
            type,
          });
        }

        return result;
      });

    console.info(commandLineUsage([
      {
        header: 'NAME',
        content: `${name} — add packages with their corresponding types. Version ${version}.`,
      },
      {
        header: 'ALIASES',
        content: multilineTrimLeft`
          {bold tsa} — for {bold ${name}}
          {bold tsi} — for {bold ${name} -i}
        `,
      },
      {
        header: 'SYNOPSIS',
        content: (() => {
          const [
            completion,
            version,
            help,
          ]: readonly Flag[] = [
            'completion',
            'version',
            'help',
          ] as const;

          const [c, v, h]: readonly FlagSynonym[] = ['c', 'v', 'h'] as const;

          return multilineTrimLeft`
            ${name} [{bold -${c}} {underline ${completion}}] [{bold -${v}} {underline ${version}}] [{bold -${h}} {underline ${help}}]
            ${name} [options]... package[@version] [[options] [package[@version]]]...
          `;
        })(),
      },
      {
        header: 'DESCRIPTION',
        content: `Some of NPM packages provide explicit types, some — external (as @types packages), rest — don't have any. ${name} helps to find and install NPM packages together with their corresponding types.`,
      },
      {
        header: 'EXAMPLES',
        content: (() => {
          const [
            completion,
            dryRun,
            registry,
          ]: readonly Flag[] = [
            'completion',
            'dry-run',
            'registry',
          ] as const;
          const [i, P, D, r]: readonly FlagSynonym[] = ['i', 'P', 'D', 'r'] as const;

          return multilineTrimLeft`
            ${name} --${completion}
            tsa node-fetch@^2.0 axios decline-word@latest --${dryRun}
            ${name} -${i}${P}${D} decline-word elapsing-time
            tsi my-awesome-module -${r}=https://my-awesome-${registry}.com
            tsa -t node@${process.version.slice(1)}
          `;
        })(),
      },
      {
        header: 'OPTIONS',
        optionList: options,
      },
      {
        header: 'EXIT STATUS',
        content: multilineTrimLeft`
          0   if OK,
          1   if any problems.
        `,
      },
      {
        header: 'AUTHOR',
        content: 'Designed and developed by ArthurKa.',
      },
      {
        header: 'ISSUES AND BUG REPORTING',
        content: `Your improve suggestions and bug reports are welcome any time at https://github.com/ArthurKa/${name}/issues.`,
      },
      {
        header: 'SEE ALSO',
        content: multilineTrimLeft`
          For more information visit:
           - NPM (https://www.npmjs.com/package/${name}/v/${version})
           - GitHub (https://github.com/ArthurKa/${name})
        `,
      },
    ]));
  },

  completion() {
    if(getConfig(':test-flags-run')) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-dynamic-require, global-require
    const { name } = require(pathToPackageJson);

    console.info(`\n${multilineTrimLeft`
      ###-begin-${name}-completion-###
      # ${name} command completion script
      # Installation: ${name} --completion >> ~/.bashrc
      #
      if type complete &>/dev/null; then
        _ts_add_completion() {
          local cur;
          _get_comp_words_by_ref -n : cur;

          COMPREPLY=($(compgen -W '$($1 --:make-autocompletion-flags\\
            \${COMP_WORDS[COMP_CWORD]} "\${COMP_LINE}")' -- "$cur"));
        }

        complete -F _ts_add_completion ${name} tsa tsi;
      fi
      ###-end-${name}-completion-###
    `}`);
  },

  command(command) {
    if(getConfig('silent')) {
      return;
    }

    console.info(chalk.bold(command));
  },

  error(command) {
    console.error(chalk.red(command));
  },

  warning(command) {
    console.warn(chalk.yellow(command));
  },
};
