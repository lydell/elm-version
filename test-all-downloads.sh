#!/usr/bin/env sh

set -e

all="
elm	0.19.0
elm	0.19.1
elm-format	0.8.1
elm-format	0.8.2
elm-format	0.8.3
"

write_json() {
    printf '{"entrypoints":["elm/Main.elm"],"binaries":{"%s":"%s"}}' "$1" "$2" > elm-tooling.json
}

echo "$all" | sed "/^$/d" | while read -r line; do
    name="$(echo "$line" | cut -f 1)"
    version="$(echo "$line" | cut -f 2)"
    write_json "$name" "$version"
    elm-version download
done

write_json "unknown" "1.0.0"
if elm-version download; then
    echo "Unknown binary name should be an error"
    exit 1
fi

write_json "elm" "0.0.0"
if elm-version download; then
    echo "Unknown binary version should be an error"
    exit 1
fi
