#!/bin/bash
rm -r dist
mkdir dist
cp -r src/. dist
terser -c -m -o ./dist/someutils.min.js ./dist/someutils.js || true
git add dist/.
exit 0