#!/bin/sh
VERSION=0.1.3-1
SRC_DIR=iam-fox_win

rm -rf $SRC_DIR *setup.exe
cp -pr Resources $SRC_DIR
cd $SRC_DIR
cp chrome/icons/default/main-window.ico iam-fox.ico
cp /usr/local/xulrunner/xulrunner-stub.exe ./iam-fox.exe
rsync -rl /usr/local/xulrunner ./
cd ..
cygstart -w iam-fox.ci
mv setup.exe IAMFox-${VERSION}-setup.exe
