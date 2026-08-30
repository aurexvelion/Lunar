package com.lunar.genshin;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;

public class ReminderReceiver extends BroadcastReceiver {
    public static final String CHANNEL = "lunar_dailies";

    @Override public void onReceive(Context c, Intent i) {
        if (c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        boolean weekly = "weekly".equals(i.getStringExtra("type"));
        Intent open = new Intent(c, MainActivity.class);
        PendingIntent p = PendingIntent.getActivity(c, weekly ? 1 : 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        String title = weekly ? "L.U.N.A.R. • Weeklies" : "L.U.N.A.R. • Dailies";
        String text = weekly
                ? "Transformer, Crystalfly Trap, Transient Resin, weekly bosses and stash check."
                : "Welkin, commissions and today’s resin plan.";
        Notification n = new Notification.Builder(c, CHANNEL)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setContentTitle(title)
                .setContentText(text)
                .setContentIntent(p)
                .setAutoCancel(true)
                .build();
        ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(weekly ? 4108 : 4107, n);
    }
}
