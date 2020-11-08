#!/bin/bash
terser -c -m -o "src/someutils.min.js" "src/someutils.js" || true
rm -r dist
mkdir dist
cp -r src/. dist
git add dist/.
exit 0