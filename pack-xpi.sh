#!/bin/sh
VERSION=0.1.4
XPI=iam-fox-${VERSION}.xpi

rm -rf *.xpi
cp -r Resources/chrome ./xpi
cd xpi/
echo '.exclude-in-xpi { display:none; }' >> skin/classic/iamfox.css
sed -i 's|<window|\0 sizemode="maximized"|' content/main.xul
zip -r $XPI . > /dev/null
mv $XPI ../
cd ../
rm -rf xpi
