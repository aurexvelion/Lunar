package com.lunar.genshin;

import android.app.*;
import android.content.*;
import java.util.Calendar;

public final class ReminderScheduler {
    static final String P = "lunar_native";

    static PendingIntent dailyPi(Context c) {
        Intent i = new Intent(c, ReminderReceiver.class).putExtra("type", "daily");
        return PendingIntent.getBroadcast(c, 4107, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static PendingIntent weeklyPi(Context c) {
        Intent i = new Intent(c, ReminderReceiver.class).putExtra("type", "weekly");
        return PendingIntent.getBroadcast(c, 4108, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static PendingIntent farmPi(Context c) {
        Intent i = new Intent(c, ReminderReceiver.class).putExtra("type", "farm");
        return PendingIntent.getBroadcast(c, 4109, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    public static void saveAndSchedule(Context c, boolean enabled, int hour, int minute) {
        c.getSharedPreferences(P, 0).edit().putBoolean("e", enabled).putInt("h", hour).putInt("m", minute).apply();
        AlarmManager a = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        a.cancel(dailyPi(c));
        if (enabled) {
            Calendar x = Calendar.getInstance();
            x.set(Calendar.HOUR_OF_DAY, hour);x.set(Calendar.MINUTE, minute);x.set(Calendar.SECOND, 0);x.set(Calendar.MILLISECOND, 0);
            if (x.getTimeInMillis() <= System.currentTimeMillis()) x.add(Calendar.DAY_OF_YEAR, 1);
            a.setInexactRepeating(AlarmManager.RTC_WAKEUP, x.getTimeInMillis(), AlarmManager.INTERVAL_DAY, dailyPi(c));
        }
    }

    public static void saveAndScheduleWeekly(Context c, boolean enabled, int day, int hour, int minute) {
        day = Math.max(0, Math.min(6, day));
        c.getSharedPreferences(P, 0).edit().putBoolean("we", enabled).putInt("wd", day).putInt("wh", hour).putInt("wm", minute).apply();
        AlarmManager a = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        a.cancel(weeklyPi(c));
        if (enabled) {
            Calendar x = Calendar.getInstance();
            x.set(Calendar.DAY_OF_WEEK, day + 1);x.set(Calendar.HOUR_OF_DAY, hour);x.set(Calendar.MINUTE, minute);x.set(Calendar.SECOND, 0);x.set(Calendar.MILLISECOND, 0);
            if (x.getTimeInMillis() <= System.currentTimeMillis()) x.add(Calendar.WEEK_OF_YEAR, 1);
            a.setInexactRepeating(AlarmManager.RTC_WAKEUP, x.getTimeInMillis(), AlarmManager.INTERVAL_DAY * 7, weeklyPi(c));
        }
    }

    public static void saveAndScheduleFarm(Context c, boolean enabled, int hour, int minute, String plan) {
        c.getSharedPreferences(P, 0).edit().putBoolean("fe", enabled).putInt("fh", hour).putInt("fm", minute).putString("fp", plan == null ? "" : plan).apply();
        AlarmManager a = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        a.cancel(farmPi(c));
        if (enabled) {
            Calendar x = Calendar.getInstance();
            x.set(Calendar.HOUR_OF_DAY, hour);x.set(Calendar.MINUTE, minute);x.set(Calendar.SECOND, 0);x.set(Calendar.MILLISECOND, 0);
            if (x.getTimeInMillis() <= System.currentTimeMillis()) x.add(Calendar.DAY_OF_YEAR, 1);
            a.setInexactRepeating(AlarmManager.RTC_WAKEUP, x.getTimeInMillis(), AlarmManager.INTERVAL_DAY, farmPi(c));
        }
    }

    public static void restore(Context c) {
        if (isEnabled(c)) saveAndSchedule(c, true, getHour(c), getMinute(c));
        if (isWeeklyEnabled(c)) saveAndScheduleWeekly(c, true, getWeeklyDay(c), getWeeklyHour(c), getWeeklyMinute(c));
        if (isFarmEnabled(c)) saveAndScheduleFarm(c, true, getFarmHour(c), getFarmMinute(c), getFarmPlan(c));
    }

    public static boolean isEnabled(Context c) { return c.getSharedPreferences(P, 0).getBoolean("e", false); }
    public static int getHour(Context c) { return c.getSharedPreferences(P, 0).getInt("h", 20); }
    public static int getMinute(Context c) { return c.getSharedPreferences(P, 0).getInt("m", 0); }
    public static boolean isWeeklyEnabled(Context c) { return c.getSharedPreferences(P, 0).getBoolean("we", false); }
    public static int getWeeklyDay(Context c) { return c.getSharedPreferences(P, 0).getInt("wd", 1); }
    public static int getWeeklyHour(Context c) { return c.getSharedPreferences(P, 0).getInt("wh", 18); }
    public static int getWeeklyMinute(Context c) { return c.getSharedPreferences(P, 0).getInt("wm", 0); }
    public static boolean isFarmEnabled(Context c) { return c.getSharedPreferences(P, 0).getBoolean("fe", false); }
    public static int getFarmHour(Context c) { return c.getSharedPreferences(P, 0).getInt("fh", 18); }
    public static int getFarmMinute(Context c) { return c.getSharedPreferences(P, 0).getInt("fm", 0); }
    public static String getFarmPlan(Context c) { return c.getSharedPreferences(P, 0).getString("fp", ""); }
}
