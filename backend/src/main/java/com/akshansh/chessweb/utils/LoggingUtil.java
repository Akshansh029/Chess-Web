package com.akshansh.chessweb.utils;

import org.springframework.stereotype.Component;

@Component
public class LoggingUtil {

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "invalid-email";

        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];

        // jo**@gmail.com  — first 2 chars visible, rest masked
        String maskedLocal = local.length() <= 2
                ? "*".repeat(local.length())
                : local.substring(0, 2) + "*".repeat(local.length() - 2);

        return maskedLocal + "@" + domain;
    }
}
