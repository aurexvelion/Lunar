package com.lunar.genshin;

import android.Manifest;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import java.util.Calendar;
import java.util.TimeZone;

public class ReminderReceiver extends BroadcastReceiver {
    public static final String CHANNEL = "lunar_dailies";

    @Override public void onReceive(Context c, Intent i) {
        if (c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        String type = i.getStringExtra("type");
        boolean weekly = "weekly".equals(type);
        boolean farm = "farm".equals(type);
        Intent open = new Intent(c, MainActivity.class);
        int requestCode = weekly ? 1 : (farm ? 2 : 0);
        PendingIntent p = PendingIntent.getActivity(c, requestCode, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String title;
        String text;
        int notifyId;
        if (weekly) {
            title = "L.U.N.A.R. • Weeklies";
            text = "Transformer, Crystalfly Trap, Transient Resin, weekly bosses and stash check.";
            notifyId = 4108;
        } else if (farm) {
            title = "L.U.N.A.R. • Today's farm";
            String plan = ReminderScheduler.getFarmPlan(c);
            Calendar server = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
            server.add(Calendar.HOUR_OF_DAY, -9);
            int day = server.get(Calendar.DAY_OF_WEEK) - 1;
            String[] days = plan.split("\u001F", -1);
            text = day >= 0 && day < days.length && !days[day].isEmpty()
                    ? days[day]
                    : "Open L.U.N.A.R. to check today's America-server farm plan.";
            notifyId = 4109;
        } else {
            title = "L.U.N.A.R. • Dailies";
            text = "Welkin, commissions and today’s resin plan.";
            notifyId = 4107;
        }

        Notification n = new Notification.Builder(c, CHANNEL)
                .setSmallIcon(android.R.drawable.ic_popup_reminder)
                .setContentTitle(title)
                .setContentText(text)
                .setStyle(new Notification.BigTextStyle().bigText(text))
                .setContentIntent(p)
                .setAutoCancel(true)
                .build();
        ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(notifyId, n);
    }
}
