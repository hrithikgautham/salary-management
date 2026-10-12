package co.incubyte.salary.common;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ApiExceptionHandlerTest {
    @Test
    void statusErrorsKeepTheirHttpStatusAndReason() {
        ApiExceptionHandler handler = new ApiExceptionHandler();
        var response = handler.status(new ResponseStatusException(HttpStatus.CONFLICT, "Stale version"));
        assertEquals(409, response.getStatusCode().value());
        assertTrue(response.getBody().getDetail().contains("Stale version"));
    }
}
