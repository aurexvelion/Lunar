package com.lunar.genshin;import android.content.*;public class BootReceiver extends BroadcastReceiver{public void onReceive(Context c,Intent i){ReminderScheduler.restore(c);}}
