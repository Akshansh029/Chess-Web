package com.akshansh.chessweb.service;

import com.akshansh.chessweb.exception.ResendEmailException;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import static com.akshansh.chessweb.utils.LoggingUtil.maskEmail;


@Service
@Slf4j
public class ResendEmailService {
    private static final DateTimeFormatter EMAIL_DATE_FORMATTER = 
            DateTimeFormatter.ofPattern("MMMM dd, yyyy, hh:mm a 'UTC'")
                    .withZone(ZoneId.of("UTC"))
                    .withLocale(Locale.ENGLISH);

    private final Resend resend;

    @Value("${resend.from.email}")
    private String fromEmail;

    public ResendEmailService(Resend resend) {
        this.resend = resend;
    }

    public void sendVerificationEmail(String toEmail, String verificationCode) {
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(toEmail)
                    .subject("ChessWeb: Verify your email")
                    .html(buildVerificationHtml(verificationCode))
                    .build();

            resend.emails().send(params);

            log.info("event=verificationCodeEmailSent userId={}", MDC.get("userId"));
        } catch (ResendException e) {
            log.error("event=verificationEmailFailed userId={} recipient={} provider=Resend status={} message=\"{}\"",
                    MDC.get("userId"),
                    maskEmail(toEmail),
                    e.getStatusCode(),
                    e.getMessage(), e
            );
            throw new ResendEmailException("Failed to send verification email");
        }
    }

    private String buildVerificationHtml(String verificationCode) {
        return """
                <h2>Hi</h2>
                <p>Thanks for registering. Your verification code is: %s.</p>
                <p>If you didn't register, ignore this email.</p>
                """.formatted(verificationCode);
    }
}
