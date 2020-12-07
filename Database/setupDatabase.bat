@echo off

echo Creating database password.
echo.

rem 16 stings pwd

setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION
set alfanum=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$!@#%&

set pwd=
FOR /L %%b IN (0, 1, 16) DO (
SET /A rnd_num=!RANDOM! * 62 / 32768 + 1
for /F %%c in ('echo %%alfanum:~!rnd_num!^,1%%') do set pwd=!pwd!%%c
)

echo Creating pgpass.conf file.
echo.
set cwd=%cd%
cd %APPDATA%
IF EXIST postgresql (
    cd ".\postgresql"
) ELSE (
    mkdir "postgresql"
    cd ".\postgresql"
)
echo %cd%
set string=localhost:5432:LLUO:postgres:%pwd%

IF EXIST pgpass.conf (
    echo >> pgpass.conf
    echo %string% >> pgpass.conf    
) ELSE (
    echo %string% > pgpass.conf
)

echo Password for database is: %pwd%
echo Please enter this password when prompted by installer.
echo Beginning database installation.
cd %cwd%
start /W postgresql-13.1-1-windows-x64.exe

echo Please add psql to your path environment variable before continuing.
pause
echo.

echo Setting up initial database.
echo. 
cd %cwd%
cd ".\creationScripts"

psql -U postgres -w -f createDatabase.sql
echo Database creation complete.
echo.
cd ".."
start /W /B resetDatabase.bat -y

echo Finished.
pause