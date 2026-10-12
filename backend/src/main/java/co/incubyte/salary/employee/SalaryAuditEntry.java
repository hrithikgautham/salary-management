package co.incubyte.salary.employee;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record SalaryAuditEntry(
    UUID id,
    UUID employeeId,
    UUID changedBy,
    OffsetDateTime changedAt,
    BigDecimal oldSalaryAmount,
    BigDecimal newSalaryAmount,
    String oldSalaryCurrency,
    String newSalaryCurrency,
    String reason
) {}
