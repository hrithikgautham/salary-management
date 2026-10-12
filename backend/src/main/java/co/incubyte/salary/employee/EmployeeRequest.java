package co.incubyte.salary.employee;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EmployeeRequest(
    @NotBlank @Size(max = 32) String employeeNumber,
    @NotBlank @Size(max = 100) String firstName,
    @NotBlank @Size(max = 100) String lastName,
    @NotBlank @Email @Size(max = 254) String email,
    @NotBlank @Pattern(regexp = "[A-Z]{2}") String countryCode,
    @NotBlank @Size(max = 100) String countryName,
    @NotBlank @Size(max = 100) String department,
    @NotBlank @Size(max = 120) String jobTitle,
    @NotBlank @Pattern(regexp = "ACTIVE|ON_LEAVE|TERMINATED") String employmentStatus,
    @NotNull LocalDate hireDate,
    @NotNull @DecimalMin(value = "0.00", inclusive = true) @Digits(integer = 12, fraction = 2) BigDecimal salaryAmount,
    @NotBlank @Pattern(regexp = "[A-Z]{3}") String salaryCurrency
) {}
