# elm-version

Download and run Elm tooling from [elm-tooling.json].

Status: Proof-of-concept. Hacky JSON parsing. But it works! No Windows support.

## Installation

Triple-click, copy and paste.

```sh
sh -c 'path="/usr/local/bin/elm-version"; url="https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version"; if type curl > /dev/null; then curl -#fLo "$path" "$url"; else wget -nv -O "$path" "$url"; fi && (echo "c83948e4c600dbf6489b6632eb9a1ad862fdd7e565e3dcdca05a5d709f7e78d6  $path" | sha256sum -c || (rm "$path" && exit 1)) && chmod +x "$path" && elm-version setup "$(dirname "$path")"'
```

> Permission denied? Try adding `sudo` at the start: `sudo sh -c '...'`.

Docker:

```Dockerfile
RUN path="/usr/local/bin/elm-version"; url="https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version"; if type curl > /dev/null; then curl -#fLo "$path" "$url"; else wget -nv -O "$path" "$url"; fi && (echo "c83948e4c600dbf6489b6632eb9a1ad862fdd7e565e3dcdca05a5d709f7e78d6  $path" | sha256sum -c || (rm "$path" && exit 1)) && chmod +x "$path" && elm-version setup "$(dirname "$path")"
COPY elm-tooling.json ./
RUN elm-version download
```

GitHub Actions:

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
          sudo sh -c 'path="/usr/local/bin/elm-version"; url="https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version"; if type curl > /dev/null; then curl -#fLo "$path" "$url"; else wget -nv -O "$path" "$url"; fi && (echo "c83948e4c600dbf6489b6632eb9a1ad862fdd7e565e3dcdca05a5d709f7e78d6  $path" | sha256sum -c || (rm "$path" && exit 1)) && chmod +x "$path" && elm-version setup "$(dirname "$path")"'
          elm-version download
          elm make src/Main.elm # Or whatever you do in your build
```

More information:

- `sh -c '...'`: Execute `...` in the `sh` shell. Why? Copy-paste compatibility with most shells and easy to add `sudo`.
- `path="/usr/local/bin/elm-version"`: Set the variable `path` to where to install `elm-version`.
- `url="https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version"`: Set the variable `url` to where to download `elm-version` from.
- `if type curl > /dev/null; then curl -#fLo "$path" "$url"; else wget -nv -O "$path" "$url"; fi`: Download `elm-version` from `url` to `path` using `curl` if available and `wget` otherwise.
- `(echo "c83948e4c600dbf6489b6632eb9a1ad862fdd7e565e3dcdca05a5d709f7e78d6  $path" | sha256sum -c || (rm "$path" && exit 1))`: Check that the downloaded `elm-version` has not been tampered with – if so, remove the download file.
- `echo "39a324b13c6545f45a8cb17c8e947ef7c96163e83cc9640e7974e5073c5a038c $path" | sha256sum -c`: Check that the downloaded `elm-version` has not been tampered with.
- `chmod +x "$path"`: Make the downloaded `elm-version` executable.
- `elm-version setup "$(dirname "$path")"`: Create wrappers for `elm` and `elm-format`, in the same directory as `elm-version`.

[elm-tooling.json]: https://github.com/lydell/elm-tooling.json
