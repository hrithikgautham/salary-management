package co.incubyte.salary.employee;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record Employee(
    UUID id,
    String employeeNumber,
    String firstName,
    String lastName,
    String email,
    String countryCode,
    String countryName,
    String department,
    String jobTitle,
    String employmentStatus,
    LocalDate hireDate,
    BigDecimal salaryAmount,
    String salaryCurrency,
    long version,
    java.time.Instant createdAt,
    java.time.Instant updatedAt
) {
    public String fullName() { return firstName + " " + lastName; }
}
