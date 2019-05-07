@echo off
echo Clearing dist folder
del /S /Q dist
echo Starting build
parcel build ./test/%1/index.html --no-cache --no-source-maps -d dist
