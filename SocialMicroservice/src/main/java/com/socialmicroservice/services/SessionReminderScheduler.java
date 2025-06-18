package com.socialmicroservice.schedulers;

import com.socialmicroservice.entities.Session;
import com.socialmicroservice.entities.SessionUser;
import com.socialmicroservice.respositories.SocialRepository;
import com.socialmicroservice.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SessionReminderScheduler {

    private final SocialRepository socialRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 * * * *")
    public void sendSessionReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetStart = now.plusHours(24).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime targetEnd = targetStart.plusHours(1);

        LocalDate targetDate = targetStart.toLocalDate();
        LocalTime windowStart = targetStart.toLocalTime();
        LocalTime windowEnd = targetEnd.toLocalTime();

        List<Session> sessions = socialRepository.findByDate(targetDate)
                .stream()
                .filter(session ->
                        !session.getStartTime().isBefore(windowStart) &&
                                session.getStartTime().isBefore(windowEnd)
                )
                .toList();

        for (Session session : sessions) {
            for (SessionUser user : session.getSessionUsers()) {
                emailService.sendEmail(
                        user.getEmail(),
                        "Guest",
                        "Session Reminder",
                        "Reminder: You have a session on " + session.getDate() + " at " + session.getStartTime(),
                        "<p>This is a friendly reminder: You have a session on <strong>" + session.getDate() + "</strong> at <strong>" + session.getStartTime() + "</strong>.</p>"
                );
            }
        }
    }
}
