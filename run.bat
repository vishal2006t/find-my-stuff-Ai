@echo off
title Find My Stuff AI - Smart Home Item Finder
echo ========================================================
echo       FIND MY STUFF AI - SMART HOME ITEM FINDER
echo ========================================================
echo Checking dependencies...
python -m pip install -r requirements.txt
echo.
echo Initializing database...
python database.py
echo.
echo Starting Find My Stuff AI server...
start http://127.0.0.1:5000
python app.py
pause

