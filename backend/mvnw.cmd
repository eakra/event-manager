@REM Maven Wrapper script for Windows
@echo off
@setlocal

set "MAVEN_PROJECTBASEDIR=%~dp0"

@REM Just use 'java' from the current PATH environment.
set "JAVACMD=java"

if not "%JAVA_HOME%"=="" (
    set "JAVACMD=%JAVA_HOME%\bin\java.exe"
)

:chkMWrapper
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

if exist "%WRAPPER_JAR%" goto execMaven

echo Downloading Maven Wrapper...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('%WRAPPER_URL%', '%WRAPPER_JAR%') }"
if ERRORLEVEL 1 (
    echo Failed to download maven-wrapper.jar >&2
    goto error
)

:execMaven
echo Using java: "%JAVACMD%"
echo Using wrapper: "%WRAPPER_JAR%"

"%JAVACMD%" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR:~0,-1%" org.apache.maven.wrapper.MavenWrapperMain %*

if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
cmd /C exit /B %ERROR_CODE%
