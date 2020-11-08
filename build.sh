#!/bin/bash

rm -r dist
mkdir dist
terser -c -m -o dist/someutils.min.js src/someutils.js || true
cp -r src/. dist
git add dist/.