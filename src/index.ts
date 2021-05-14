import parsePackageName from 'npm-package-arg';
import semver from 'semver';
import { execSync } from 'child_process';
import {
  parsedCLIParams,
  fetchPackage,
  printMessage,
  ObjKeys,
  flagAliases,
  ObjEntries,
  isFlagOrSynonymInCommandLine,
  makeFlagWithPrefix,
  getConfig,
  flagsWithDefaulValues,
  withFlagCredentials,
  parseURL,
} from './utils';

function makeCommand(dependencies: string[], flags = '') {
  const deps = dependencies
    .map(e => e.match(/[<>]/) ? `"${e}"` : e)
    .join(' ');

  const registryFlag = !withFlagCredentials ? '' : (() => {
    const registry = getConfig('registry');
    const login = getConfig('login');
    const password = getConfig('password');
    const { hrefWithCredentials } = parseURL(registry, login, password);

    return `--reg=${hrefWithCredentials}`;
  })();

  return `npm i ${flags && `${flags} `}${deps} ${registryFlag}`.trim();
}
const runCommand = (command: string) => execSync(command, {
  ...!getConfig('silent') && { stdio: 'inherit' },
});

export async function tsAdd() {
  if(getConfig(':make-autocompletion-flags')) {
    const [param] = process.argv.slice(3);

    if(!param?.startsWith('-')) {
      return;
    }

    // parsedCLIParams[':make-autocompletion-flags'] = false;
    // parsedCLIParams[':test-flags-run'] = true;

    // await tsAdd();
    // const flags = ObjKeys(flagStack)
      // .map(key => [key, flagAliases[key]])
    const flags = ObjEntries(flagAliases)
      .map(e => {
        const [flag, ...aliases] = e;
        if(typeof flagsWithDefaulValues[flag] === 'string') {
          return [`${flag}=`, aliases.flat().map(e => `${e}=`)];
        }

        return e;
      })
      .flat(2)
      .filter(e => !e.startsWith(':'))
      .map(makeFlagWithPrefix);

    const prefixRE = param.startsWith('--') ? /^--/ : /^-[^-]/;
    const processedFlags = flags
      .filter(e => e.match(prefixRE))
      .filter(e => !isFlagOrSynonymInCommandLine(e))
      .filter(e => e.startsWith(param));

    const result = processedFlags.length === 1 && processedFlags[0]?.endsWith('=')
      ? [`${processedFlags[0]}1`, `${processedFlags[0]}2`]
      : processedFlags;

    console.info(result.join(' '));

    return;
  }
  if(getConfig('completion')) {
    return void printMessage.completion();
  }
  if(getConfig('version')) {
    return void printMessage.version();
  }
  if(getConfig('help')) {
    return void printMessage.help();
  }

  const { _: packageNames } = parsedCLIParams;

  if(!packageNames.length) {
    printMessage.noParams();

    if(getConfig(':test-flags-run')) {
      return;
    }
    process.exit(1);
  }

  const dependencies: string[] = [];
  const devDependencies: string[] = [];

  for(const packageName of packageNames) {
    const { name, version, scope } = (() => {
      // Note that some parsePackageName.Result fields of type `string | null` are `string | undefined` actually
      const pkg = parsePackageName(packageName);

      return {
        name: pkg.name || '',
        version: pkg.fetchSpec || 'latest',
        scope: pkg.scope || null,
      };
    })();

    let pkg;
    try {
      pkg = await fetchPackage(name);
    } catch(e) {
      if(e.code === 'E401') {
        printMessage.unauthorized();
      } else {
        printMessage.noPackage(packageName);
      }

      if(getConfig(':test-flags-run')) {
        return;
      }
      process.exit(1);
    }

    const { versions, 'dist-tags': tags } = pkg;
    const allVersions = ObjKeys(versions);
    const v = tags[version] || version;

    const targetVersion = semver.maxSatisfying(allVersions, v, { includePrerelease: true });
    if(!targetVersion) {
      printMessage.noPackage(packageName);

      if(getConfig(':test-flags-run')) {
        return;
      }
      process.exit(1);
    }

    const targetPackage = pkg.versions[targetVersion]!;
    const hasExplicitTypes = Boolean(
      false
      || targetPackage.types
      || targetPackage.typings
      || targetPackage.files?.some(e => e.endsWith('.d.ts'))
    );

    if(!getConfig('types-only')) {
      if(targetVersion === tags.latest) {
        const pkgName = getConfig('ignore-package-json') ? `${name}@latest` : packageName;
        (getConfig('save-dev') ? devDependencies : dependencies).push(pkgName);
      } else {
        (getConfig('save-dev') ? devDependencies : dependencies).push(packageName);
      }
    }

    if(hasExplicitTypes) {
      continue;
    }

    let typesPackage;
    const typesPackageName = scope
      ? `@types/${scope.slice(1)}__${name.slice(scope.length + 1)}`
      : `@types/${name}`;

    try {
      typesPackage = await fetchPackage(typesPackageName);
    } catch {
      printMessage.noTypesDeclaration(packageName);
      continue;
    }

    const { versions: typeVersions, 'dist-tags': typeTags } = typesPackage;
    const allTypesVersions = ObjKeys(typeVersions).filter(v => !typeVersions[v]!.deprecated);

    if(targetVersion === tags.latest && typeVersions[typeTags.latest]!.deprecated) {
      continue;
    }

    const typesTargetVersion = targetVersion === tags.latest
      ? typeTags.latest
      : `<=${semver.major(targetVersion)}.${semver.minor(targetVersion)}.x`;
    const targetTypesVersion = semver.maxSatisfying(allTypesVersions, typesTargetVersion, {
      includePrerelease: getConfig('allow-prerelease'),
    });

    if(targetTypesVersion) {
      if(targetTypesVersion === typeTags.latest) {
        const tPkgName = `${typesPackageName}${getConfig('ignore-package-json') ? '@latest' : ''}`;
        (getConfig('save-prod') ? dependencies : devDependencies).push(tPkgName);
      } else {
        (getConfig('save-prod') ? dependencies : devDependencies).push(`${typesPackageName}@${targetTypesVersion}`);
      }
    } else {
      printMessage.noTypesDeclaration(packageName);
    }
  }
  printMessage.endNoTypesDeclaration();


  let isPrinted = false;
  if(dependencies.length) {
    const command = makeCommand(dependencies, '-P');
    if(!getConfig('silent') && !getConfig(':test-flags-run')) {
      printMessage.command(command);
      isPrinted = true;
    }
    if(!getConfig('dry-run') && !getConfig(':test-flags-run')) {
      runCommand(command);
    }
  }
  if(devDependencies.length) {
    const command = makeCommand(devDependencies, '-D');
    if(!getConfig('silent') && !getConfig(':test-flags-run')) {
      printMessage.command(command);
      isPrinted = true;
    }
    if(!getConfig('dry-run') && !getConfig(':test-flags-run')) {
      runCommand(command);
    }
  }
  if(!getConfig('silent') && !isPrinted && !getConfig(':test-flags-run')) {
    console.info('Nothing to install.');
  }
}
