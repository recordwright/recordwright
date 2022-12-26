@echo off
taskkill -f -im chromium.exe
taskkill -f -im chrome.exe
taskkill -f -im node.exe
timeout 1
taskkill -f -im chromium.exe
taskkill -f -im chrome.exe
taskkill -f -im node.exe
