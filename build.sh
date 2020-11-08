#!/bin/bash

rm -r dist
mkdir dist
cp -r src/. dist
(terser -c -m -o "dist/someutils.min.js" "dist/someutils.js" || true) &
wait
git add dist/.
exit 0