package co.incubyte.salary.employee;

import java.math.BigDecimal;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SalaryUpdateRequest(
    @NotNull @DecimalMin(value = "0.00", inclusive = true) BigDecimal salaryAmount,
    @NotBlank @Pattern(regexp = "[A-Z]{3}") String salaryCurrency,
    @NotNull Long expectedVersion,
    @NotBlank @Size(max = 500) String reason
) {}
