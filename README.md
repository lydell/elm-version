# elm-version

Download and run Elm tooling from [elm-tooling.json].

Status: Proof-of-concept. Hacky JSON parsing. But it works! No Windows support.

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

Triple-click, copy and paste.

```sh
sh -c 'path="/usr/local/bin/elm-version"; url="https://raw.githubusercontent.com/lydell/elm-version/master/elm-version"; if command -v curl > /dev/null; then curl -#fLo "$path" "$url"; else wget -nv -O "$path" "$url"; fi && chmod +x "$path" && elm-version setup "$(dirname "$path")"'
```

> Permission denied? Try adding `sudo` at the start: `sudo sh -c '...'`

<details>
<summary>Explanation</summary>

- `sh -c '...'`: Execute `...` in the `sh` shell. Why? Copy-paste compatibility with most shells and it’s easy to add `sudo` if needed.
- `path="/usr/local/bin/elm-version"`: Set the variable `path` to where to install `elm-version`.
- `url="https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version"`: Set the variable `url` to where to download `elm-version` from. Visit this URL first if you want to see what the code looks like before running it.
- `if command -v curl > /dev/null; then curl -#fLo "$path" "$url"; else wget -nv -O "$path" "$url"; fi`: Download `elm-version` from `url` to `path` using `curl` if available and `wget` otherwise.
- `chmod +x "$path"`: Make the downloaded `elm-version` executable.
- `elm-version setup "$(dirname "$path")"`: Create wrappers for `elm` and `elm-format`, in the same directory as `elm-version`.

</details>

<details>
<summary>Alternative installation instructions</summary>

1. Download the `elm-version` shell script from this repo.
2. Make it executable.
3. Put it in your `$PATH`.
4. Run `elm-version setup SOME_DIR_IN_PATH` to create wrappers for `elm` and `elm-format`.

</details>

## CI/Build installation

Want to use `elm-version` in CI and build systems? Then it’s recommended to commit a copy of `elm-version` to your repo! You _could_ copy that one-liner above into your CI setup and build scripts, but:

- It’s ugly and hard to read.
- You might end up accidentally using different versions of `elm-version` in CI vs your build scripts.
- I’d recommend adding a shasum check to it (so you know that you get what you expected), which makes the oneliner even more complicated and error-prone.

By instead committing a copy of `elm-version`:

- Your scripts become super clean: `sh elm-version ...`
- You always know exactly what is being executed, and you get rid of one Internet request that can fail.
- As a bonus, new contributors who don’t have `elm-version` installed can run `sh elm-version setup /usr/bin/local` to get it. They might not get the absolutely latest version, but they’ll at least get something that works with your project.
- `elm-version` is a couple of hundred lines of shell script so it shouldn’t be too bad to commit. The alternative would be copying and committing a 300-char oneliner (possibly more than once).

Once you’ve installed `elm-version` on your computer, you could run the following to copy it to your project:

```sh
cd your-project
sh -c 'cp "$(which elm-version)" elm-version'
```

### Docker

```Dockerfile
COPY elm-version elm-tooling.json ./
RUN sh elm-version setup /usr/local/bin && elm-version download
```

Note: `curl` or `wget` is required – you might need to install one of them depending on what docker image you use.

It’s recommended to put the above code early in your Dockerfile so you can take advantage of caching.

### GitHub Actions

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

## Upgrading

To update `elm-version` itself, re-run the installation instructions. It overwrites the previous installation.

To update `elm` or `elm-format`, edit [elm-tooling.json] and run `elm-version download`. Note: This might requiring updating `elm-version` as well. `elm-version` hardcodes the versions of binaries it supports (see the next section for why). This shouldn’t be a problem since `elm` and `elm-format` releases aren’t frequent.

## Uninstallation

Run `elm-version uninstall` and follow the instructions. Basically, you need to remove a couple of files.

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

## Goals

The goal is to make it easy and fast to have project-specific versions of Elm and Elm tooling. It should be easy for developers, as well as for CI and build scripts.

The dream is that editors will start to support [elm-tooling.json] so they don’t even need to rely on `elm-version`’s wrappers of `elm` and `elm-format`. That would mean 0 overhead – editors could just execute binaries directly.

[binaries]: https://github.com/lydell/elm-tooling.json#binaries
[elm-tooling.json]: https://github.com/lydell/elm-tooling.json
