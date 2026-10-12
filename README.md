# L.U.N.A.R.

A mobile-first Genshin Impact tracker for Android, combining the original Primogem tracker and a character material tracker in one app.

## Primogems

- Enter your current Primogem balance.
- Track a **1,600 Primogems per week** goal and a **200,000 Primogems** long-term goal.
- The weekly starting balance is stored locally and rolls forward each Monday.
- **Existing saved Primogem balances are preserved**: the original `lunar_core_v1` local-storage key is unchanged.

## Materials

- Add unlimited character sections by typing character names.
- Add materials to each character with **required** and **owned** amounts.
- Change counts directly or use the **+ / −** buttons.
- Track remaining quantities and completion progress for each character.
- Edit a material's required/owned values or delete materials and characters.
- All material progress is saved locally using `lunar_materials_v1`.

## Install on Android

1. Open **Actions** on this GitHub repository.
2. Open the most recent successful **Build LUNAR APK** run.
3. Download the `LUNAR-Genshin-S25-APK` artifact.
4. Extract the downloaded ZIP and install the APK on your Android phone.

Builds use GitHub Actions with the Gradle `assembleDebug` task.
The Android application ID is unchanged (`com.lunar.genshin`) and the version code is incremented so it can update a previous installation without erasing local data. Do not uninstall the old app before installing an update. Android may block an update if APK signing keys do not match.

No login or network access is needed for either tracker. Data stays in app local storage; clearing the app's data or uninstalling can delete it.
