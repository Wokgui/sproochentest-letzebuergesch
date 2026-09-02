package com.wokgui.schedulewidget;

import android.app.job.JobParameters;
import android.app.job.JobService;

public class WidgetUpdateJobService extends JobService {
    @Override
    public boolean onStartJob(JobParameters params) {
        ScheduleWidgetProvider.updateAllWidgets(this);
        jobFinished(params, false);
        return false;
    }

    @Override
    public boolean onStopJob(JobParameters params) {
        return true;
    }
}
