package co.incubyte.salary.employee;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import co.incubyte.salary.common.PageResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class EmployeeServiceTest {
    private EmployeeRepository repository;
    private EmployeeService service;

    @BeforeEach
    void setUp() {
        repository = mock(EmployeeRepository.class);
        service = new EmployeeService(repository);
    }

    @Test
    void rejectsNegativePage() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.search(null, null, null, null, -1, 25, "last_name", "asc"));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void rejectsPageSizeAboveLimit() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.search(null, null, null, null, 0, 101, "last_name", "asc"));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void rejectsUnsupportedStatus() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
            () -> service.search(null, null, null, "EVERYONE", 0, 25, "last_name", "asc"));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void normalizesCountryFilterAndDelegatesValidatedPage() {
        when(repository.search("Anu", "in", "Engineering", "ACTIVE", 0, 10, "last_name", "asc"))
            .thenReturn(PageResponse.of(List.of(), 0, 10, 0));
        service.search("Anu", "in", "Engineering", "ACTIVE", 0, 10, "last_name", "asc");
        verify(repository).search("Anu", "in", "Engineering", "ACTIVE", 0, 10, "last_name", "asc");
    }
}
