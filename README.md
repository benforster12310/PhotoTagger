# PhotoTagger

PhotoTagger is a windows project that is designed to tag photos

## To Customise
1. Download the code
2. Edit the main.js file, go to line 9 and change this to a path to your tags.csv file
3. then follow the build steps below

to build first use electron-packager

`electron-packager . phototagger`

then use electron-installer-windows

`electron-installer-windows --src phototagger-win32-x64/ --dest installers/ --productName PhotoTagger`

and then the installer files are located in /installers, use the .exe file to install locally or the .msi file to install machine wide