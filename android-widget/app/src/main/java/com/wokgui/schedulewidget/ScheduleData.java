package com.wokgui.schedulewidget;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public final class ScheduleData {
    private ScheduleData() {}

    public static final class Course {
        public final LocalTime start;
        public final LocalTime end;
        public final String group;
        public final String room;

        Course(String start, String end, String group, String room) {
            this.start = LocalTime.parse(start);
            this.end = LocalTime.parse(end);
            this.group = group;
            this.room = room;
        }
    }

    public static final class NextCourse {
        public final Course course;
        public final LocalDate date;

        NextCourse(Course course, LocalDate date) {
            this.course = course;
            this.date = date;
        }
    }

    public static List<Course> coursesFor(DayOfWeek day) {
        switch (day) {
            case MONDAY:
                return Arrays.asList(
                    new Course("08:00", "09:00", "4G1 ALL · 4G2 ALL", "217"),
                    new Course("10:00", "11:00", "6G3BIL · 6G4BIL", "217"),
                    new Course("11:00", "12:00", "4G3 ALL · 4G4 ALL", "217"),
                    new Course("13:00", "14:00", "5G1-2-3 ALL", "216")
                );
            case TUESDAY:
                return Arrays.asList(
                    new Course("08:00", "09:00", "5G4 ALL", "217"),
                    new Course("09:00", "10:00", "4G3 ALL · 4G4 ALL", "217"),
                    new Course("14:00", "15:00", "3G3 ALL · 3G4 ALL", "216"),
                    new Course("16:00", "17:00", "3G1 ALL · 3G2 ALL", "216")
                );
            case WEDNESDAY:
                return Collections.emptyList();
            case THURSDAY:
                return Arrays.asList(
                    new Course("08:00", "09:00", "3G1 ALL · 3G2 ALL", "216"),
                    new Course("09:00", "10:00", "3G3 ALL · 3G4 ALL", "216"),
                    new Course("10:00", "11:00", "6G3BIL · 6G4BIL", "216"),
                    new Course("11:00", "12:00", "5G4 ALL", "216"),
                    new Course("13:00", "14:00", "6G3BIL · 6G4BIL", "216"),
                    new Course("14:00", "15:00", "4G1 ALL · 4G2 ALL", "215"),
                    new Course("16:00", "17:00", "5G1-2-3 ALL", "217")
                );
            case FRIDAY:
                return Arrays.asList(
                    new Course("11:00", "12:00", "5G1-2-3 ALL", "217"),
                    new Course("13:00", "14:00", "5G4 ALL", "217"),
                    new Course("14:00", "15:00", "3G3 ALL · 3G4 ALL", "217"),
                    new Course("15:00", "16:00", "4G3 ALL · 4G4 ALL", "217"),
                    new Course("16:00", "17:00", "4G1 ALL · 4G2 ALL", "217")
                );
            default:
                return Collections.emptyList();
        }
    }

    public static Course currentCourse(ZonedDateTime now) {
        for (Course c : coursesFor(now.getDayOfWeek())) {
            if (!now.toLocalTime().isBefore(c.start) && now.toLocalTime().isBefore(c.end)) {
                return c;
            }
        }
        return null;
    }

    public static NextCourse nextCourse(ZonedDateTime now) {
        LocalDate base = now.toLocalDate();
        for (int offset = 0; offset <= 7; offset++) {
            LocalDate date = base.plusDays(offset);
            for (Course c : coursesFor(date.getDayOfWeek())) {
                if (offset > 0 || now.toLocalTime().isBefore(c.start)) {
                    return new NextCourse(c, date);
                }
            }
        }
        return null;
    }

    public static int completedToday(ZonedDateTime now) {
        int done = 0;
        for (Course c : coursesFor(now.getDayOfWeek())) {
            if (!now.toLocalTime().isBefore(c.end)) done++;
        }
        return done;
    }

    public static int courseProgressPercent(ZonedDateTime now) {
        List<Course> list = coursesFor(now.getDayOfWeek());
        if (list.isEmpty()) return 0;
        double units = 0.0;
        LocalTime t = now.toLocalTime();
        for (Course c : list) {
            if (!t.isBefore(c.end)) {
                units += 1.0;
            } else if (!t.isBefore(c.start) && t.isBefore(c.end)) {
                long total = Duration.between(c.start, c.end).toSeconds();
                long elapsed = Duration.between(c.start, t).toSeconds();
                units += Math.max(0.0, Math.min(1.0, elapsed / (double) total));
            }
        }
        return (int) Math.round(100.0 * units / list.size());
    }

    public static int dayProgressPercent(ZonedDateTime now) {
        LocalTime start = LocalTime.of(8, 0);
        LocalTime end = LocalTime.of(18, 0);
        LocalTime t = now.toLocalTime();
        if (t.isBefore(start)) return 0;
        if (!t.isBefore(end)) return 100;
        long total = Duration.between(start, end).toMinutes();
        long elapsed = Duration.between(start, t).toMinutes();
        return (int) Math.max(0, Math.min(100, Math.round(elapsed * 100.0 / total)));
    }

    public static long nextBoundaryMillis(ZonedDateTime now) {
        List<ZonedDateTime> candidates = new ArrayList<>();
        ZoneId zone = now.getZone();
        LocalDate base = now.toLocalDate();
        for (int offset = 0; offset <= 7; offset++) {
            LocalDate date = base.plusDays(offset);
            for (Course c : coursesFor(date.getDayOfWeek())) {
                candidates.add(LocalDateTime.of(date, c.start).atZone(zone));
                candidates.add(LocalDateTime.of(date, c.end).atZone(zone));
            }
        }
        long best = Long.MAX_VALUE;
        for (ZonedDateTime candidate : candidates) {
            if (candidate.isAfter(now) && candidate.toInstant().toEpochMilli() < best) {
                best = candidate.toInstant().toEpochMilli();
            }
        }
        return best == Long.MAX_VALUE ? now.plusHours(6).toInstant().toEpochMilli() : best;
    }
}
