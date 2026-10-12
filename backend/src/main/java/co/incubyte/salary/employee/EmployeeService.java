package co.incubyte.salary.employee;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

import co.incubyte.salary.common.PageResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class EmployeeService {
    private final EmployeeRepository repository;
    public EmployeeService(EmployeeRepository repository) { this.repository = repository; }

    public PageResponse<Employee> search(String query, String country, String department, String status,
                                         int page, int size, String sort, String direction) {
        if (page < 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page must be zero or greater");
        if (size < 1 || size > 100) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size must be between 1 and 100");
        if (status != null && !status.isBlank() && !List.of("ACTIVE", "ON_LEAVE", "TERMINATED").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported employment status");
        }
        if (country != null && !country.isBlank() && !country.matches("[A-Za-z]{2}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Country must be a two-letter ISO code");
        }
        if (sort != null && !sort.isBlank() && !List.of("employee_number", "first_name", "last_name", "department", "country_code", "salary_amount", "hire_date", "updated_at").contains(sort)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sort field");
        }
        if (direction != null && !direction.isBlank() && !List.of("asc", "desc").contains(direction.toLowerCase(Locale.ROOT))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sort direction must be asc or desc");
        }
        return repository.search(query, country == null ? null : country.toUpperCase(Locale.ROOT), department, status, page, size, sort, direction);
    }

    public Employee get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
    }

    @Transactional
    public Employee create(EmployeeRequest request) { return repository.create(request); }

    @Transactional
    public Employee updateSalary(UUID id, SalaryUpdateRequest request, UUID actor) {
        return repository.updateSalary(id, request, actor);
    }

    public List<SalaryAuditEntry> audit(UUID id) {
        get(id);
        return repository.audit(id);
    }

    public List<String> countries() { return repository.countries(); }
    public List<String> departments() { return repository.departments(); }
    public long countEmployees() { return repository.countEmployees(); }
}
