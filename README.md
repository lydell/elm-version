# Deprecated

Use [elm-tooling](https://github.com/lydell/elm-tooling.json/tree/master/cli) instead.

# elm-version

Download and run Elm tooling from [elm-tooling.json].

Proof-of-concept. Hacky JSON parsing. But it works! No Windows support.

[elm-tooling.json]: https://github.com/lydell/elm-tooling.json

<!-- prettier-ignore-start -->
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Example](#example)
- [Installation](#installation)
- [CI/Build installation](#cibuild-installation)
  - [Docker](#docker)
  - [GitHub Actions](#github-actions)
- [Upgrading](#upgrading)
- [Uninstallation](#uninstallation)
- [Security](#security)
- [Supported binaries](#supported-binaries)
- [Creating elm-tooling.json](#creating-elm-toolingjson)
  - [For a new project](#for-a-new-project)
  - [For an existing project](#for-an-existing-project)
- [Tips and tricks](#tips-and-tricks)
- [Goals](#goals)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->
<!-- prettier-ignore-end -->

## Example

```
example-project
├── elm-tooling.json
├── elm.json
└── src
   └── Main.elm
```

Run `cd example-project && elm-version download` to get the versions of `elm` and `elm-format` used in the project. Done! Now running `elm` and `elm-format` will automatically use the version needed for the project you’re in.

There’s no magic – `elm-version` simply replaces your global `elm` and `elm-format` with wrappers that look up the directory tree for an [elm-tooling.json] and uses the versions specified there (or the latest version if no [elm-tooling.json] is found.) The _actual_ [binaries are stored in `~/.elm`][binaries].

## Installation

Copy and paste into your terminal:

```sh
sh -c '
# Exit on errors:
set -e

# Where to install elm-version:
path="/usr/local/bin/elm-version"

# Where to download elm-version from:
url="https://raw.githubusercontent.com/lydell/elm-version/master/elm-version"

# Download elm-version using curl if available, and wget otherwise.
if command -v curl > /dev/null; then curl -#fLo "$path" "$url"; else wget -nv -O "$path" "$url"; fi

# Make elm-version executable:
chmod +x "$path"

# Create wrappers for elm and elm-format, next to elm-version:
elm-version setup "$(dirname "$path")"
'
```

> Permission denied? Try adding `sudo` at the start: `sudo sh -c '...'`

You can also install using `npm` if you prefer:

```sh
sh -c 'npm install --global elm-version && elm-version setup "$(dirname "$(which elm-version)")"'
```

<details>
<summary>Alternative installation instructions</summary>

1. Download the `elm-version` shell script from this repo.
2. Make it executable.
3. Put it in your `$PATH`.
4. Run `elm-version setup SOME_DIR_IN_PATH` to create wrappers for `elm` and `elm-format`.

</details>

## CI/Build installation

Want to use `elm-version` in CI and build systems? There are two ways to do it:

<details>
<summary>Install <code>elm-version</code> using <code>npm</code> (if you need <code>npm</code> anyway)</summary>

```sh
npm install --save-dev elm-version
```

To upgrade, edit the version number for `"elm-version"` in `package.json`.

</details>

<details>
<summary>Commit a copy of <code>elm-version</code> to your repo</summary>

You _could_ copy installation command into your CI setup and build scripts, but:

- You might end up accidentally using different versions of `elm-version` in CI vs your build scripts.
- I’d recommend adding a shasum check to it (so you know that you get what you expected), which makes the installation command even more complicated and error-prone.

By instead committing a copy of `elm-version`:

- Your scripts become super clean: `sh elm-version ...`
- You always know exactly what is being executed, and you get rid of one Internet request that can fail.
- As a bonus, new contributors who don’t have `elm-version` installed can run `sh elm-version setup /usr/bin/local` to get it. They might not get the absolutely latest version, but they’ll at least get something that works with your project.
- `elm-version` is a couple of hundred lines of shell script so it shouldn’t be too bad to commit.

Once you’ve installed `elm-version` on your computer, you could run the following to copy it to your project:

```sh
cd your-project
sh -c 'cp "$(which elm-version)" elm-version'
```

</details>

### Docker

<details>
<summary>Via npm</summary>

```Dockerfile
# Install npm packages in a separate image, for maximum Docker caching.
# Otherwise you’d lose the cached downloads of Elm binaries every time
# package.json changes (which is much more frequent).
FROM node:12 AS npm
WORKDIR app
COPY package.json package-lock.json ./
RUN npm ci

# Start a new image.
FROM node:12
WORKDIR app

# Copy elm-version from the previous image, then setup and install.
COPY --from=npm /app/node_modules/elm-version/elm-version elm-version
COPY elm-tooling.json ./
RUN sh elm-version setup /usr/local/bin && elm-version download

# Copy the full node_modules folder for the rest of your build.
COPY --from=npm /app/node_modules node_modules

# Then do whatever you need to.
```

</details>

<details>
<summary>Committed copy</summary>

```Dockerfile
# Put this early in your Dockerfile, to take advantage of Docker caching.
COPY elm-version elm-tooling.json ./
RUN sh elm-version setup /usr/local/bin && elm-version download
```

</details>

Note: `curl` or `wget` is required – you might need to install one of them depending on what Docker image you use.

### GitHub Actions

<details>
<summary>Via npm</summary>

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v1
        with:
          node-version: "12"

      - name: Cache node_modules
        uses: actions/cache@v1
        with:
          path: node_modules
          key: node_modules-${{ hashFiles('package-lock.json') }}

      - name: Cache elm packages and binaries
        uses: actions/cache@v1
        with:
          path: ~/.elm
          key: elm-${{ hashFiles('elm*.json') }}

      - name: Run workflow
        run: |
          test -d node_modules || npm ci
          sudo npx elm-version setup /usr/local/bin
          elm-version download
          npm run build # Or whatever you do in your build
```

</details>

<details>
<summary>Committed copy</summary>

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Cache elm packages and binaries
        uses: actions/cache@v1
        with:
          path: ~/.elm
          key: elm-${{ hashFiles('elm*.json') }}

      - name: Run workflow
        run: |
          sudo sh elm-version setup /usr/local/bin
          elm-version download
          elm make src/Main.elm # Or whatever you do in your build
```

</details>

## Upgrading

To upgrade `elm-version` itself, re-run the installation instructions. It overwrites the previous installation.

To upgrade `elm` or `elm-format`, edit [elm-tooling.json] and run `elm-version download`. Note: This might requiring updating `elm-version` as well. `elm-version` hardcodes the versions of binaries it supports (see the next section for why). This shouldn’t be a problem since `elm` and `elm-format` releases aren’t frequent.

## Uninstallation

Run `elm-version uninstall` and follow the instructions. Basically, you need to remove a couple of files.

If you installed using `npm` you need to run either `npm uninstall elm-version` or `npm uninstall --global elm-version` afterwards.

## Security

`elm-version` includes sha256 checksums for all binary versions it supports. If there’s a checksum mismatch on a downloaded file, `elm-version` removes the bad file and errors. Only known versions can be installed.

## Supported binaries

- elm
  - 0.19.0
  - 0.19.1
- elm-format
  - 0.8.1
  - 0.8.2
  - 0.8.3

Notes:

- Tools that need Node.js, such as elm-test, elm-live, elm-graphql, elm-review and elm-pages, are better installed with `npm`.
- Tools that _are_ binaries but don’t need project specific versions, such as elm-json, are better installed globally using any method you prefer. However, maybe `elm-version` could help installing such binaries globally in the future?
- Why not install `elm` and `elm-format` using `npm`? Because `npm` doesn’t really support platform-specific binaries, which means that the binaries aren’t cached and often re-downloaded unnecessarily when you run `npm install`. Also, you’ll get a copy of the binaries in each project, making them take around 45 MB\* more space than they’d need to.

(\*) After running `npm install elm elm-format` in a new folder on macOS, `node_modules` is 45 MB. That’s including the size of the binaries as well as all 70 dependencies the `elm` and `elm-format` npm packages use to get the binaries to your computer.

## Creating elm-tooling.json

### For a new project

Run `elm-version init` to create an [elm-tooling.json] with the latest versions, that matches the `elm.json` created by running `elm init`.

```sh
mkdir my-project
cd my-project
elm-version init
elm-version download
elm init
mkdir src
touch src/Main.elm
```

Then start working on your project!

### For an existing project

You can use `elm-version init` for existing projects as well, but you might need to tweak [elm-tooling.json] a little.

1. `cd my-project`
2. `elm-version init`
3. Edit [elm-tooling.json]. For example, if you previously installed `elm` and `elm-format` using `npm`, copy their versions from `package.json` to [elm-tooling.json]. Then you can remove them from `package.json`. You also need to edit `"entrypoints"` in [elm-tooling.json] to match your project.
4. `elm-version download`
5. Configure tools and editors. For example, tools should look for just `elm`, not `./node_modules/.bin/elm`.
6. `sh -c 'cp "$(which elm-version)" elm-version'`
7. Configure CI and build. For example, you need to run `sh elm-version setup /usr/local/bin && elm-version download` rather than `npm install` (see the [CI/Build installation](#cibuild-installation) section).

## Tips and tricks

- If you use for example Elm 0.19.0 very often, you could put a symlink to `~/.elm/elm-tooling/elm/0.19.0/elm` in your `$PATH`. For example:

  ```sh
  sh -c 'ln -s "${ELM_HOME:-$HOME/.elm}/elm-tooling/elm/0.19.0/elm" /usr/local/bin/elm0.19.0'
  ```

- If you want to check if you and someone else are running the same version of `elm-version`, you could both run `sh -c 'cksum "$(which elm-version)"'` and compare outputs.

## Goals

The goal is to make it easy and fast to have project-specific versions of Elm and Elm tooling. It should be easy for developers, as well as for CI and build scripts.

The dream is that editors will start to support [elm-tooling.json] so they don’t even need to rely on `elm-version`’s wrappers of `elm` and `elm-format`. That would mean 0 overhead – editors could just execute binaries directly.

[binaries]: https://github.com/lydell/elm-tooling.json#binaries
