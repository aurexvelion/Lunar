package com.lunar.genshin;
import android.Manifest;import android.app.*;import android.content.pm.PackageManager;import android.graphics.Color;import android.os.Bundle;import android.view.WindowInsets;import android.webkit.*;
public class MainActivity extends Activity {
 private WebView w;
 @Override public void onCreate(Bundle b){super.onCreate(b);getWindow().setStatusBarColor(Color.rgb(9,10,15));getWindow().setNavigationBarColor(Color.rgb(9,10,15));
  NotificationManager n=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);n.createNotificationChannel(new NotificationChannel(ReminderReceiver.CHANNEL,"Genshin dailies",NotificationManager.IMPORTANCE_DEFAULT));
  w=new WebView(this);WebSettings s=w.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);w.setBackgroundColor(Color.rgb(9,10,15));w.setWebViewClient(new WebViewClient());w.addJavascriptInterface(new Bridge(),"LunarAndroid");
  w.setOnApplyWindowInsetsListener((v,insets)->{int bottom=insets.getInsets(WindowInsets.Type.navigationBars()).bottom;v.setPadding(0,0,0,bottom);return insets;});
  setContentView(w);w.loadUrl("file:///android_asset/index.html");}
 public class Bridge {@JavascriptInterface public String getReminder(){return "{\"enabled\":"+ReminderScheduler.isEnabled(MainActivity.this)+",\"hour\":"+ReminderScheduler.getHour(MainActivity.this)+",\"minute\":"+ReminderScheduler.getMinute(MainActivity.this)+"}";} @JavascriptInterface public void setReminder(boolean e,int h,int m){ReminderScheduler.saveAndSchedule(MainActivity.this,e,h,m);if(e&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)runOnUiThread(()->requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},4401));}}
}
