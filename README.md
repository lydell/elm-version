# elm-version

Download and run Elm tooling from [elm-tooling.json].

Status: Proof-of-concept. Hacky JSON parsing. But it works! No Windows support.

## Installation

Triple-click to select, then copy and paste in the terminal.

<details>
<summary>macOS / if you have curl</summary>

```sh
sh -c 'path="/usr/local/bin/elm-version"; curl -#fLo "$path" "https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version" && echo "39a324b13c6545f45a8cb17c8e947ef7c96163e83cc9640e7974e5073c5a038c  $path" | sha256sum -c && chmod +x "$path" && elm-version setup "$(dirname "$path")"'
```

</details>

<details>
<summary>Linux / if you have wget</summary>

```sh
sh -c 'path="/usr/local/bin/elm-version"; wget -nv -O "$path" "https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version" && echo "39a324b13c6545f45a8cb17c8e947ef7c96163e83cc9640e7974e5073c5a038c  $path" | sha256sum -c && chmod +x "$path" && elm-version setup "$(dirname "$path")"'
```

</details>

<details>
<summary>Windows / other OS</summary>

Sorry! Only macOS and Linux are supported so far.

</details>

<details>
<summary>Docker</summary>

```Dockerfile
RUN path="/usr/local/bin/elm-version"; curl -#fLo "$path" "https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version" && echo "39a324b13c6545f45a8cb17c8e947ef7c96163e83cc9640e7974e5073c5a038c  $path" | sha256sum -c && chmod +x "$path" && elm-version setup "$(dirname "$path")"
COPY elm-tooling.json ./
RUN elm-version download
```

</details>

<details>
<summary>Docker Alpine</summary>

```Dockerfile
RUN path="/usr/local/bin/elm-version"; wget -nv -O "$path" "https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version" && echo "39a324b13c6545f45a8cb17c8e947ef7c96163e83cc9640e7974e5073c5a038c  $path" | sha256sum -c && chmod +x "$path" && elm-version setup "$(dirname "$path")"
COPY elm-tooling.json ./
RUN elm-version download
```

</details>

<details>
<summary>GitHub Actions</summary>

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
          sudo sh -c 'path="/usr/local/bin/elm-version"; curl -#fLo "$path" "https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version" && echo "39a324b13c6545f45a8cb17c8e947ef7c96163e83cc9640e7974e5073c5a038c  $path" | sha256sum -c && chmod +x "$path" && elm-version setup "$(dirname "$path")"'
          elm-version download
          elm make src/Main.elm # Or whatever you do in your build
```

</details>

<details>
<summary>More information</summary>

- `sh -c '...'`: Execute `...` in the `sh` shell. Why? Copy-paste compatibility with most shells and easy to add `sudo`.
- `path="/usr/local/bin/elm-version"`: Set the variable `path` to where to install `elm-version`.
- `curl -#fLo "$path" "https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version"`: Download `elm-version` using `curl` to `path`.
  - `wget -nv -O "$path" "https://raw.githubusercontent.com/lydell/elm-version/v1.0.0/elm-version"`: Same thing but using `wget` instead of `curl`.
- `echo "39a324b13c6545f45a8cb17c8e947ef7c96163e83cc9640e7974e5073c5a038c $path" | sha256sum -c`: Check that the downloaded `elm-version` has not been tampered with.
- `chmod +x "$path"`: Make the downloaded `elm-version` executable.
- `elm-version setup "$(dirname "$path")"`: Create wrappers for `elm` and `elm-format`, in the same directory as `elm-version`.

</details>

[elm-tooling.json]: https://github.com/lydell/elm-tooling.json
