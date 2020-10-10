@echo off
cd "creationScripts"

echo "Starting database reset script."
echo "All database data will be reset to default values."
echo.

IF [%1]==[-y] GOTO N1 
IF NOT [%1]==[-y] GOTO N2

:N1
psql -U postgres -d LLUO -w -f setupDatabase.sql

echo.
echo "Database has been reset."
GOTO End

:N2
set /p continue="Are you sure you wish to reset the database y/n: " 

IF [%continue%]==[y] GOTO N1
IF NOT [%continue%]==[y] echo "Database reset has been canceled."
GOTO End

:End
pause
exit