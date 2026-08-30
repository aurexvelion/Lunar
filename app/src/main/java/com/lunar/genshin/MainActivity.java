package com.lunar.genshin;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.*;

public class MainActivity extends Activity {
    private WebView w;

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        getWindow().setStatusBarColor(Color.rgb(9, 11, 18));
        getWindow().setNavigationBarColor(Color.rgb(9, 11, 18));

        NotificationManager n = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        n.createNotificationChannel(new NotificationChannel(ReminderReceiver.CHANNEL, "Genshin reminders", NotificationManager.IMPORTANCE_DEFAULT));

        w = new WebView(this);
        WebSettings s = w.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        w.setBackgroundColor(Color.rgb(9, 11, 18));
        w.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                view.evaluateJavascript(
                    "(()=>{" +
                    "const addSmart=()=>{if(document.getElementById('lunar-smart-last-module'))return;const q=document.createElement('script');q.id='lunar-smart-last-module';q.src='file:///android_asset/smart_last.js';document.body.appendChild(q)};" +
                    "const addUx=()=>{if(document.getElementById('lunar-uxfix-module')){addSmart();return;}const u=document.createElement('script');u.id='lunar-uxfix-module';u.src='file:///android_asset/uxfix.js';u.onload=addSmart;document.body.appendChild(u)};" +
                    "const addRules=()=>{if(document.getElementById('lunar-rules-module')){addUx();return;}const r=document.createElement('script');r.id='lunar-rules-module';r.src='file:///android_asset/rules.js';r.onload=addUx;document.body.appendChild(r)};" +
                    "const addEnh=()=>{if(document.getElementById('lunar-enhancements-module')){addRules();return;}const e=document.createElement('script');e.id='lunar-enhancements-module';e.src='file:///android_asset/enhancements.js';e.onload=addRules;document.body.appendChild(e)};" +
                    "const addWeekly=()=>{if(document.getElementById('lunar-weekly-module')){addEnh();return;}const x=document.createElement('script');x.id='lunar-weekly-module';x.src='file:///android_asset/weekly.js';x.onload=addEnh;document.body.appendChild(x)};" +
                    "if(document.getElementById('lunar-full-materials-module')){addWeekly();return;}" +
                    "const m=document.createElement('script');m.id='lunar-full-materials-module';m.src='file:///android_asset/materials_full.js';m.onload=addWeekly;document.body.appendChild(m);" +
                    "})()", null);
            }
        });
        w.addJavascriptInterface(new Bridge(), "LunarAndroid");
        setContentView(w);
        w.loadUrl("file:///android_asset/index.html");
    }

    private void requestNotificationPermission() {
        if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            runOnUiThread(() -> requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 4401));
        }
    }

    public class Bridge {
        @JavascriptInterface public String getReminder() {
            return "{\"enabled\":" + ReminderScheduler.isEnabled(MainActivity.this)
                    + ",\"hour\":" + ReminderScheduler.getHour(MainActivity.this)
                    + ",\"minute\":" + ReminderScheduler.getMinute(MainActivity.this) + "}";
        }

        @JavascriptInterface public void setReminder(boolean enabled, int hour, int minute) {
            ReminderScheduler.saveAndSchedule(MainActivity.this, enabled, hour, minute);
            if (enabled) requestNotificationPermission();
        }

        @JavascriptInterface public String getWeeklyReminder() {
            return "{\"enabled\":" + ReminderScheduler.isWeeklyEnabled(MainActivity.this)
                    + ",\"day\":" + ReminderScheduler.getWeeklyDay(MainActivity.this)
                    + ",\"hour\":" + ReminderScheduler.getWeeklyHour(MainActivity.this)
                    + ",\"minute\":" + ReminderScheduler.getWeeklyMinute(MainActivity.this) + "}";
        }

        @JavascriptInterface public void setWeeklyReminder(boolean enabled, int day, int hour, int minute) {
            ReminderScheduler.saveAndScheduleWeekly(MainActivity.this, enabled, day, hour, minute);
            if (enabled) requestNotificationPermission();
        }

        @JavascriptInterface public String getFarmReminder() {
            return "{\"enabled\":" + ReminderScheduler.isFarmEnabled(MainActivity.this)
                    + ",\"hour\":" + ReminderScheduler.getFarmHour(MainActivity.this)
                    + ",\"minute\":" + ReminderScheduler.getFarmMinute(MainActivity.this) + "}";
        }

        @JavascriptInterface public void setFarmReminder(boolean enabled, int hour, int minute, String plan) {
            ReminderScheduler.saveAndScheduleFarm(MainActivity.this, enabled, hour, minute, plan);
            if (enabled) requestNotificationPermission();
        }

        @JavascriptInterface public void copyText(String text) {
            ClipboardManager cb = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
            cb.setPrimaryClip(ClipData.newPlainText("L.U.N.A.R. backup", text == null ? "" : text));
        }

        @JavascriptInterface public String getClipboard() {
            ClipboardManager cb = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
            if (!cb.hasPrimaryClip() || cb.getPrimaryClip() == null || cb.getPrimaryClip().getItemCount() == 0) return "";
            CharSequence t = cb.getPrimaryClip().getItemAt(0).coerceToText(MainActivity.this);
            return t == null ? "" : t.toString();
        }
    }
}
