
@echo off
echo ========================================
echo    PUSH TO GITHUB
echo ========================================
echo.
echo Please make sure you've created a repository on GitHub first!
echo.
echo Enter your GitHub username:
set /p username=
echo.
echo Enter your repository name:
set /p reponame=
echo.

echo Adding remote repository...
git remote add origin https://github.com/%username%/%reponame%.git

echo.
echo Setting main branch...
git branch -M main

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo    Push Complete!
echo ========================================
echo Your repository is now available at:
echo https://github.com/%username%/%reponame%
echo.
pause
