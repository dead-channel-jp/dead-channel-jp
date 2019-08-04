#!/usr/bin/env bash

set -e

GH_REPO=dead-channel-jp/dead-channel-jp.github.io

git clone https://github.com/$GH_REPO.git web
rsync -rpt --delete --exclude='.git' --exclude='README.md' --exclude='.gitignore' --exclude='CNAME' --exclude='LICENSE' docs/ web/
cd web
git remote
git config user.email guy@hametuha.com
git config user.name fumikito
git add .
git commit -m "Deploy ${TRAVIS_COMMIT}"
git push "https://${GITHUB_TOKEN}@github.com/${GH_REPO}" master
cd ..
