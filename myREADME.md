<header>

Helps you conveniently add packages with their corresponding types to your project.

<globalInstallation>
<npxAlso>

## Synopsis
```bash
<pkg.name> [-c completion] [-v version] [-h help]
<pkg.name> [options]... package[@version] [[options] [package[@version]]]...
```

## Aliases
- `tsa` — for `ts-add`
- `tsi` — for `ts-add -i`

## Options
| Alias, name                       | Type    | Description
|-----------------------------------|---------|-
| [-d, --dry-run](<#d>)             | boolean | Run without installing any packages.
| [-D, --save-dev](<#D>)            | boolean | Save regular (not `@types`) packages into devDependencies.
| [-P, --save-prod](<#P>)           | boolean | Save `@types` packages into regular dependencies.
| [-t, --types-only](<#t>)          | boolean | Install only `@types` packages.
| [-i, --ignore-package-json](<#i>) | boolean | Add "latest" tag for all installing packages in case of latest versions are required to install.
| [--ap, --allow-prerelease](<#ap>) | boolean | Allow to install prerelease versions of `@types` packages.
| -s, --silent                      | boolean | Hide output messages.
| [-r, --registry](<#r>)            | string  | Specify any other package registry besides https://registry.npmjs.org (this value can be stored in `.npmrc` as **registry** key).
| [-a, --_auth](<#credentials>)     | string  | Set Auth Basic token for custom registry (this value can be stored in `.npmrc` as **_auth** key).
| [-l, --login](<#credentials>)     | string  | Set Auth Basic username for custom registry (this value can be stored in `.npmrc` as **login** key).
| -u, --username                    | string  | Alias for **login**.
| [-p, --password](<#credentials>)  | string  | Set Auth Basic password for custom registry (this value can be stored in `.npmrc` as **password** key).
| [-c, --completion](<#c>)          | boolean | Output bash CLI autocompletion alias and exit.
| -v, --version                     | boolean | Output version information and exit.
| -h, --help                        | boolean | Display this help and exit.

## Searching `@types` algorithm
1. Look into `package.json` file of requested package. If there is `types` or `typings` field in it so package has explicit types. Job's done.
2. If not — search for `@types` package. If there is `@types` package search for its corresponding version:
   - for latest requested package — latest `@types` package;
   - for any other version — take max satisfying version by `<major>.<minor>.x`, where `<major>` and `<minor>` parts are taken from requested package.\
   **Notice**: if you use **<pkg.name>** without `-i` flag packages will be installed according to `package.json` versions and may have discrepancies in versions of main package and its `@types`. So consider to use `-i` flag to avoid this.
3. If still not found — assume that package has no types.

## Examples
### <-d, --dry-run|#d>
Use if you want to check what packages are supposed to install without their actual installation.

![image](https://user-images.githubusercontent.com/16370704/117040928-15673000-ad13-11eb-8ad0-b5b1b81908da.png)

### <-D, --save-dev|#D>
Use if you want to save main packages into devDependencies.

![image](https://user-images.githubusercontent.com/16370704/117041052-36c81c00-ad13-11eb-9fb3-f6d0976d23bc.png)

### <-P, --save-prod|#P>
Similarly to [save-dev](<#D>) but save `@types` packages into regular dependencies.

![image](https://user-images.githubusercontent.com/16370704/118207155-b751ef80-b46c-11eb-93e9-f04707a9a2a0.png)

Note: you can use `-D` and `-P` flags at the same time, which means to swap packages install destination.

![image](https://user-images.githubusercontent.com/16370704/118167875-d9794c80-b42f-11eb-98fa-ee4bfeca2e2a.png)

### <-t, --types-only|#t>
Install only correspondent `@types` packages for requested packages.

![image](https://user-images.githubusercontent.com/16370704/118170474-cf0c8200-b432-11eb-96e6-4879ec9a62bd.png)

### <-i, --ignore-package-json|#i>
If there are no versions requested for installing packages NPM will rely on version ranges into `package.json` by default. If you don't want to involve `package.json` ranges just use **-i** flag or **<pkg.name> -i** alias: **tsi**.

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

### <--ap, --allow-prerelease|#ap>
Include to search pool `@types` prerelease package versions such as 2.3.5-beta-1, 3.0.1-rc-4 and so on.

### <-r, --registry|#r>
Provide a custrom registry to search for packages.
```bash
tsi my-awesome-module -r=https://my-awesome-registry.com
```

The **registry** key can also conveniently be stored in the `.npmrc` file.

### <-a, --_auth, -l, --login, -p, --password|#credentials>
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

### <-c, --completion|#c>
Run `tsa -c >> ~/.bashrc` command to append CLI autocomplection into `.bashrc` file.

<noTesting>

<suggestions>
