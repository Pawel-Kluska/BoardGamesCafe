package com.reservationmicroservice.schedulers;

import com.reservationmicroservice.entities.Reservation;
import com.reservationmicroservice.repositories.ReservationRepository;
import com.reservationmicroservice.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ReservationReminderScheduler {

    private final ReservationRepository reservationRepository;
    private final EmailService emailService;

    // Runs every hour (cron: sec min hour day month weekday)
    @Scheduled(cron = "0 0 * * * *")
    public void sendReminderEmails() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetTimeStart = now.plusHours(24).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime targetTimeEnd = targetTimeStart.plusHours(1);

        LocalDate targetDate = targetTimeStart.toLocalDate();
        LocalTime windowStart = targetTimeStart.toLocalTime();
        LocalTime windowEnd = targetTimeEnd.toLocalTime();

        List<Reservation> reservations = reservationRepository.findByDateAndStartTimeBetween(targetDate, windowStart, windowEnd);

        for (Reservation res : reservations) {
            emailService.sendEmail(
                    res.getEmail(),
                    "Guest",
                    "Reservation Reminder",
                    "This is a reminder: You have a reservation on " + res.getDate() + " at " + res.getStartTime(),
                    "<p>This is a reminder: You have a reservation on <strong>" + res.getDate() + "</strong> at <strong>" + res.getStartTime() + "</strong>.</p>"
            );
        }
    }
}
