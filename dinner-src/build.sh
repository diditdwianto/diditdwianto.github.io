#!/bin/sh
# Same as build.mjs, for machines without Node: needs an esbuild binary (ESBUILD, default "esbuild")
# and node_modules/@wonderful/web (see README).
set -e
cd "$(dirname "$0")"
ESBUILD="${ESBUILD:-esbuild}"
out=../dinner
v=$(date +%s | awk '{printf "%x", $1}')
rm -rf "$out" && mkdir -p "$out/worklets"
"$ESBUILD" src/main.js --bundle --format=esm --target=es2020 --minify --loader:.json=json --outfile="$out/app.js" --log-level=warning
cp node_modules/@wonderful/web/voice/worklets/microphone.js node_modules/@wonderful/web/voice/worklets/playback.js "$out/worklets/"
cp src/style.css "$out/style.css"
cp src/orb/all-blue.webp "$out/orb.webp"
cp src/brand/wonderful-wordmark.png "$out/wordmark.png"
sed "s/__V__/$v/g" src/index.html > "$out/index.html"
cp src/mode.json "$out/mode.json"
echo "built $out/ (v $v)"
