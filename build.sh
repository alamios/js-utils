#!/bin/bash

rm -r dist
mkdir dist
cp -r src/. dist
terser -c -m -o dist/someutils.min.js src/someutils.js || true
git add dist/.