# Deploy to Android Device

Build and install the app on a connected Android phone or emulator via Capacitor. Assumes the dev server is already running on port 5445.

## Steps

### 1. Determine the deploy target

Ask the user whether they want to deploy to:
- **Physical phone** — uses LAN IP (`192.168.86.38:5445`), requires same Wi-Fi network
- **Emulator** — uses `10.0.2.2:5445` (Android's alias for host localhost)

### 2. Verify device connection

Run `adb devices` using the known ADB path:

```bash
export ANDROID_HOME="/c/Users/jason/AppData/Local/Android/Sdk"
"$ANDROID_HOME/platform-tools/adb" devices
```

Expected serials:
- Physical phone: `R5CW6025DYK` (or wireless `adb-R5CW6025DYK-jkcdN9._adb-tls-connect._tcp`)
- Emulator: `emulator-5554`

If the target device is not listed, stop and tell the user to connect their phone (USB or wireless ADB) or start the emulator.

### 3. Sync Capacitor

Sync the Capacitor project in dev mode. Set the flags based on the target:

**For physical phone:**
```bash
CAP_DEV=1 npx cap sync android
```

**For emulator:**
```bash
CAP_DEV=1 CAP_EMU=1 npx cap sync android
```

After sync, verify the generated config has the correct URL:
```bash
cat android/app/src/main/assets/capacitor.config.json
```
- Phone should show `http://192.168.86.38:5445`
- Emulator should show `http://10.0.2.2:5445`

### 4. Build the APK

Build the debug APK using Android Studio's bundled JDK:

```bash
export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
export ANDROID_HOME="/c/Users/jason/AppData/Local/Android/Sdk"
cd android && ./gradlew assembleDebug && cd ..
```

If the build fails, check error output and troubleshoot. Common issues:
- Wrong JAVA_HOME path (Android Studio may have updated)
- Missing SDK components (run Android Studio SDK Manager)

### 5. Install on device

Install the APK on the target device using `-s` to specify the serial:

**For physical phone:**
```bash
export ANDROID_HOME="/c/Users/jason/AppData/Local/Android/Sdk"
"$ANDROID_HOME/platform-tools/adb" -s R5CW6025DYK install -r android/app/build/outputs/apk/debug/learntoplay-debug.apk
```

**For emulator:**
```bash
export ANDROID_HOME="/c/Users/jason/AppData/Local/Android/Sdk"
"$ANDROID_HOME/platform-tools/adb" -s emulator-5554 install -r android/app/build/outputs/apk/debug/learntoplay-debug.apk
```

### 6. Confirm

Tell the user the app is installed and ready. Key reminders:
- **Phone**: Both devices must be on the same Wi-Fi network for the dev server connection.
- **Emulator**: The dev server must be running on the host machine (`localhost:5445`).
