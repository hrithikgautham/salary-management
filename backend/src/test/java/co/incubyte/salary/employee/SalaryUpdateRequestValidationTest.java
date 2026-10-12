package co.incubyte.salary.employee;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.Set;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class SalaryUpdateRequestValidationTest {
    private static Validator validator;
    private static jakarta.validation.ValidatorFactory factory;

    @BeforeAll
    static void setUpValidator() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void closeValidator() { factory.close(); }

    @Test
    void acceptsNonNegativeCurrencyAmountWithReason() {
        var request = new SalaryUpdateRequest(new BigDecimal("125000.25"), "USD", 4L, "Annual review");
        assertTrue(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsNegativeSalary() {
        var request = new SalaryUpdateRequest(new BigDecimal("-1.00"), "USD", 4L, "Annual review");
        Set<String> fields = validator.validate(request).stream().map(v -> v.getPropertyPath().toString()).collect(java.util.stream.Collectors.toSet());
        assertTrue(fields.contains("salaryAmount"));
    }

    @Test
    void rejectsAmountsWithMoreThanTwoDecimalPlaces() {
        var request = new SalaryUpdateRequest(new BigDecimal("1200.999"), "USD", 4L, "Annual review");
        assertFalse(validator.validate(request).isEmpty());
    }

    @Test
    void rejectsTooShortReason() {
        var request = new SalaryUpdateRequest(new BigDecimal("1200.00"), "USD", 4L, "ok");
        Set<String> fields = validator.validate(request).stream().map(v -> v.getPropertyPath().toString()).collect(java.util.stream.Collectors.toSet());
        assertTrue(fields.contains("reason"));
    }
}
