plugins { id("com.android.application") }
android {
    namespace = "com.lunar.genshin"
    compileSdk = 36
    defaultConfig { applicationId = "com.lunar.genshin"; minSdk = 31; targetSdk = 36; versionCode = 8; versionName = "1.1-combined" }
    buildTypes { release { isMinifyEnabled = false } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
