#!/bin/sh
VERSION=0.1.0
SRC_DIR=iam-fox_win

rm -rf $SRC_DIR *setup.exe
cp -pr Resources $SRC_DIR
cd $SRC_DIR
rsync -rl /usr/local/xulrunner ./
cd ..
cygstart -w iam-fox.ci
mv setup.exe IAMFox-${VERSION}-setup.exe