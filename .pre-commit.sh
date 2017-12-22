#!/bin/sh
git diff --staged --diff-filter=dx --name-only HEAD | grep ".*\.js$" | xargs -I % sh -c './node_modules/.bin/prettier --write --trailing-comma all --single-quote %; git add %'
