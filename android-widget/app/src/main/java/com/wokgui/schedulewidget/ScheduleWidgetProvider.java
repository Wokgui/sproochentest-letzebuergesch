package com.wokgui.schedulewidget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;

public class ScheduleWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_REFRESH = "com.wokgui.schedulewidget.REFRESH";
    public static final String ACTION_BOUNDARY = "com.wokgui.schedulewidget.BOUNDARY";
    private static final int JOB_ID = 4107;
    private static final int ALARM_REQUEST = 4108;

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        super.onUpdate(context, manager, appWidgetIds);
        updateAllWidgets(context);
        ensurePeriodicJob(context);
    }

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        ensurePeriodicJob(context);
        updateAllWidgets(context);
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        cancelPeriodicJob(context);
        cancelBoundaryAlarm(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();
        if (ACTION_REFRESH.equals(action)
                || ACTION_BOUNDARY.equals(action)
                || Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_DATE_CHANGED.equals(action)
                || Intent.ACTION_TIME_CHANGED.equals(action)
                || Intent.ACTION_TIMEZONE_CHANGED.equals(action)) {
            ensurePeriodicJob(context);
            updateAllWidgets(context);
        }
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, ScheduleWidgetProvider.class);
        int[] ids = manager.getAppWidgetIds(component);
        ZonedDateTime now = ZonedDateTime.now();
        for (int id : ids) {
            manager.updateAppWidget(id, buildViews(context, now));
        }
        scheduleNextBoundary(context, now);
    }

    private static RemoteViews buildViews(Context context, ZonedDateTime now) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_schedule);
        Locale fr = Locale.FRANCE;
        String dayName = now.getDayOfWeek().getDisplayName(TextStyle.FULL, fr);
        dayName = Character.toUpperCase(dayName.charAt(0)) + dayName.substring(1);
        views.setTextViewText(R.id.dayLabel, dayName + " " + now.getDayOfMonth());

        List<ScheduleData.Course> today = ScheduleData.coursesFor(now.getDayOfWeek());
        int done = ScheduleData.completedToday(now);
        int total = today.size();
        views.setTextViewText(R.id.courseCounter,
                total == 0 ? "Aucun cours aujourd’hui" : done + " / " + total + " cours terminés");
        views.setProgressBar(R.id.dayProgress, 100, ScheduleData.dayProgressPercent(now), false);
        views.setTextViewText(R.id.progressLabel, ScheduleData.dayProgressPercent(now) + " % de la journée");

        ScheduleData.Course current = ScheduleData.currentCourse(now);
        ScheduleData.NextCourse next = ScheduleData.nextCourse(now);
        long targetMillis = -1L;
        String chronoPrefix = "";

        if (current != null) {
            views.setTextViewText(R.id.status, current.group);
            views.setTextViewText(R.id.details, "Salle " + current.room + " · fin " + current.end);
            targetMillis = LocalDateTime.of(now.toLocalDate(), current.end)
                    .atZone(now.getZone()).toInstant().toEpochMilli();
            chronoPrefix = "Fin dans ";
        } else if (next != null) {
            views.setTextViewText(R.id.status, "Prochain : " + next.course.group);
            if (next.date.equals(now.toLocalDate())) {
                views.setTextViewText(R.id.details,
                        "Salle " + next.course.room + " · à " + next.course.start);
            } else {
                String nextDay = next.date.getDayOfWeek().getDisplayName(TextStyle.FULL, fr);
                nextDay = Character.toUpperCase(nextDay.charAt(0)) + nextDay.substring(1);
                views.setTextViewText(R.id.details,
                        nextDay + " · " + next.course.start + " · salle " + next.course.room);
            }
            targetMillis = LocalDateTime.of(next.date, next.course.start)
                    .atZone(now.getZone()).toInstant().toEpochMilli();
            chronoPrefix = "Dans ";
        } else {
            views.setTextViewText(R.id.status, "Aucun cours à venir");
            views.setTextViewText(R.id.details, "");
        }

        if (targetMillis > System.currentTimeMillis()) {
            long remaining = targetMillis - System.currentTimeMillis();
            long base = SystemClock.elapsedRealtime() + remaining;
            views.setViewVisibility(R.id.countdownRow, View.VISIBLE);
            views.setTextViewText(R.id.countdownPrefix, chronoPrefix);
            views.setChronometer(R.id.countdown, base, null, true);
            views.setBoolean(R.id.countdown, "setCountDown", true);
        } else {
            views.setViewVisibility(R.id.countdownRow, View.GONE);
        }

        Intent openIntent = new Intent(context, MainActivity.class);
        PendingIntent openPending = PendingIntent.getActivity(
                context, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widgetRoot, openPending);

        Intent refreshIntent = new Intent(context, ScheduleWidgetProvider.class)
                .setAction(ACTION_REFRESH);
        PendingIntent refreshPending = PendingIntent.getBroadcast(
                context, 1, refreshIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.refresh, refreshPending);

        return views;
    }

    public static void ensurePeriodicJob(Context context) {
        JobScheduler scheduler = context.getSystemService(JobScheduler.class);
        if (scheduler == null || scheduler.getPendingJob(JOB_ID) != null) return;
        JobInfo job = new JobInfo.Builder(JOB_ID,
                new ComponentName(context, WidgetUpdateJobService.class))
                .setPeriodic(15 * 60 * 1000L)
                .setPersisted(true)
                .build();
        scheduler.schedule(job);
    }

    private static void cancelPeriodicJob(Context context) {
        JobScheduler scheduler = context.getSystemService(JobScheduler.class);
        if (scheduler != null) scheduler.cancel(JOB_ID);
    }

    private static void scheduleNextBoundary(Context context, ZonedDateTime now) {
        AlarmManager alarmManager = context.getSystemService(AlarmManager.class);
        if (alarmManager == null) return;
        Intent intent = new Intent(context, ScheduleWidgetProvider.class).setAction(ACTION_BOUNDARY);
        PendingIntent pending = PendingIntent.getBroadcast(
                context, ALARM_REQUEST, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        alarmManager.cancel(pending);
        long triggerAt = ScheduleData.nextBoundaryMillis(now) + 1500L;
        alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending);
    }

    private static void cancelBoundaryAlarm(Context context) {
        AlarmManager alarmManager = context.getSystemService(AlarmManager.class);
        if (alarmManager == null) return;
        Intent intent = new Intent(context, ScheduleWidgetProvider.class).setAction(ACTION_BOUNDARY);
        PendingIntent pending = PendingIntent.getBroadcast(
                context, ALARM_REQUEST, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        alarmManager.cancel(pending);
    }
}
