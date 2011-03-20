#!/bin/sh
APP=IAMFox.app

rm -rf IAMFox.app *.dmg
cp -pr IAMFox-src.app IAMFox.app
cp -p /Library/Frameworks/XUL.framework/Versions/Current/xulrunner IAMFox.app/Contents/MacOS
