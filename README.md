[![All dependencies](https://img.shields.io/librariesio/release/npm/ts-add/1.0.1?style=flat-square "All dependencies of ts-add@1.0.1")](https://libraries.io/npm/ts-add/1.0.1)
[![Reported vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/ts-add@1.0.1?style=flat-square "Reported vulnerabilities of ts-add@1.0.1")](https://snyk.io/test/npm/ts-add/1.0.1)
[![Commits](https://flat.badgen.net/github/commits/ArthurKa/ts-add)](https://github.com/ArthurKa/ts-add/commits/master)
[![NPM-version](https://img.shields.io/badge/npm-v1.0.1-blue.svg?style=flat-square&&logo=npm "Current NPM-version")](https://www.npmjs.com/package/ts-add/v/1.0.1)
[![Total downloads](https://img.shields.io/npm/dt/ts-add?style=flat-square "Total downloads for all the time")](https://npm-stat.com/charts.html?package=ts-add)
[![Developed by](https://img.shields.io/badge/developed_by-ArthurKa-blueviolet.svg?style=flat-square "GitHub")](https://github.com/ArthurKa)\
[![Publish size](https://flat.badgen.net/packagephobia/publish/ts-add@1.0.1?label=publish 'Publish size of ts-add@1.0.1')](https://packagephobia.now.sh/result?p=ts-add@1.0.1)
[![Install size](https://flat.badgen.net/packagephobia/install/ts-add@1.0.1?label=install 'Install size of ts-add@1.0.1')](https://packagephobia.now.sh/result?p=ts-add@1.0.1)
[![Minified size](https://img.shields.io/bundlephobia/min/ts-add@1.0.1?style=flat-square&label=minified "Minified size of ts-add@1.0.1")](https://bundlephobia.com/result?p=ts-add@1.0.1)
[![Minified + gzipped size](https://img.shields.io/bundlephobia/minzip/ts-add@1.0.1?style=flat-square&label=minzipped "Minified + gzipped size of ts-add@1.0.1")](https://bundlephobia.com/result?p=ts-add@1.0.1)

# ts-add@1.0.1

Helps you conveniently add packages with their corresponding types to your project.

## Installation
`ts-add` is available via NPM and recomended to install globally:
```bash
$ npm i -g ts-add@1.0.1
```
You can also use `ts-add` via NPX without explicit installation:
```bash
$ npx ts-add ...
```

## Synopsis
```bash
ts-add [-c completion] [-v version] [-h help]
ts-add [options]... package[@version] [[options] [package[@version]]]...
```

## Aliases
- `tsa` — for `ts-add`
- `tsi` — for `ts-add -i`

## Options
| Alias, name                       | Type    | Description
|-----------------------------------|---------|-
| [-d, --dry-run](#-d---dry-run)             | boolean | Run without installing any packages.
| [-D, --save-dev](#-d---save-dev)            | boolean | Save regular (not `@types`) packages into devDependencies.
| [-P, --save-prod](#-p---save-prod)           | boolean | Save `@types` packages into regular dependencies.
| [-t, --types-only](#-t---types-only)          | boolean | Install only `@types` packages.
| [-i, --ignore-package-json](#-i---ignore-package-json) | boolean | Add "latest" tag for all installing packages in case of latest versions are required to install.
| [--ap, --allow-prerelease](#--ap---allow-prerelease) | boolean | Allow to install prerelease versions of `@types` packages.
| -s, --silent                      | boolean | Hide output messages.
| [-r, --registry](#-r---registry)            | string  | Specify any other package registry besides https://registry.npmjs.org (this value can be stored in `.npmrc` as **registry** key).
| [-a, --_auth](#-a---_auth--l---login--p---password)     | string  | Set Auth Basic token for custom registry (this value can be stored in `.npmrc` as **_auth** key).
| [-l, --login](#-a---_auth--l---login--p---password)     | string  | Set Auth Basic username for custom registry (this value can be stored in `.npmrc` as **login** key).
| -u, --username                    | string  | Alias for **login**.
| [-p, --password](#-a---_auth--l---login--p---password)  | string  | Set Auth Basic password for custom registry (this value can be stored in `.npmrc` as **password** key).
| [-c, --completion](#-c---completion)          | boolean | Output bash CLI autocompletion alias and exit.
| -v, --version                     | boolean | Output version information and exit.
| -h, --help                        | boolean | Display this help and exit.

## Searching `@types` algorithm
1. Look into `package.json` file of requested package. If there is `types` or `typings` field or `files` array includes `.d.ts` ending string in it so package has explicit types. Job's done.
2. If not — search for `@types` package. If there is `@types` package search for its corresponding version:
   - for latest requested package — latest `@types` package;
   - for any other version — take max satisfying version by `<major>.<minor>.x`, where `<major>` and `<minor>` parts are taken from requested package.\
   **Notice**: if you use **ts-add** without `-i` flag packages will be installed according to `package.json` versions and may have discrepancies in versions of main package and its `@types`. So consider to use `-i` flag to avoid this.
3. If still not found — assume that package has no types.

## Examples
### -d, --dry-run
Use if you want to check what packages are supposed to install without their actual installation.

![image](https://user-images.githubusercontent.com/16370704/117040928-15673000-ad13-11eb-8ad0-b5b1b81908da.png)

### -D, --save-dev
Use if you want to save main packages into devDependencies.

![image](https://user-images.githubusercontent.com/16370704/117041052-36c81c00-ad13-11eb-9fb3-f6d0976d23bc.png)

### -P, --save-prod
Similarly to [save-dev](#-d---save-dev) but save `@types` packages into regular dependencies.

![image](https://user-images.githubusercontent.com/16370704/118207155-b751ef80-b46c-11eb-93e9-f04707a9a2a0.png)

Note: you can use `-D` and `-P` flags at the same time, which means to swap packages install destination.

![image](https://user-images.githubusercontent.com/16370704/118167875-d9794c80-b42f-11eb-98fa-ee4bfeca2e2a.png)

### -t, --types-only
Install only correspondent `@types` packages for requested packages.

![image](https://user-images.githubusercontent.com/16370704/118170474-cf0c8200-b432-11eb-96e6-4879ec9a62bd.png)

### -i, --ignore-package-json
If there are no versions requested for installing packages NPM will rely on version ranges into `package.json` by default. If you don't want to involve `package.json` ranges just use **-i** flag or **ts-add -i** alias: **tsi**.

In case of the next dependencies:
```json
{
  "dependencies": {
    "node-fetch": "~2.1.0"
  },
  "devDependencies": {
    "@types/node-fetch": "~2.1.7"
  }
}
```

![image](https://user-images.githubusercontent.com/16370704/118171224-c8cad580-b433-11eb-8af0-118540f833ba.png)

The `--ignore-package-json` flag simply add `latest` tag for packages with no provided versions so NPM doesn't rely on already installed packages in `package.json`.

![image](https://user-images.githubusercontent.com/16370704/118376582-78897a00-b5d1-11eb-9ead-f560a302ecd8.png)

### --ap, --allow-prerelease
Include to search pool `@types` prerelease package versions such as 2.3.5-beta-1, 3.0.1-rc-4 and so on.

### -r, --registry
Provide a custrom registry to search for packages.
```bash
tsi my-awesome-module -r=https://my-awesome-registry.com
```

The **registry** key can also conveniently be stored in the `.npmrc` file.

### -a, --_auth, -l, --login, -p, --password
Provide credentials for registry authentication.

#### By Auth Basic token
```bash
tsi my-awesome-module -a=<my-awesome-auth-basic-token>
```

#### By Basic login + password pair
```bash
tsi my-awesome-module -l=<login> -p=<password>
```

#### By credential embedded into registry URL
```bash
tsi my-awesome-module -r=https://<login>:<password>@my-awesome-registry.com
```

Keys **_auth**, **login** and **password** can also conveniently be stored in the `.npmrc` file.

### -c, --completion
Run `tsa -c >> ~/.bashrc` command to append CLI autocomplection into `.bashrc` file.

## Testing
Manually tested by the developer during development. Automated tests are not provided.

---

Your improve suggestions and bug reports [are welcome](https://github.com/ArthurKa/ts-add/issues) any time.
