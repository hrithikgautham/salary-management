package co.incubyte.salary.employee;

import java.util.List;
import java.util.UUID;

import co.incubyte.salary.common.PageResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService service;
    public EmployeeController(EmployeeService service) { this.service = service; }

    @GetMapping
    public PageResponse<Employee> search(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String country,
        @RequestParam(required = false) String department,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "25") int size,
        @RequestParam(defaultValue = "last_name") String sort,
        @RequestParam(defaultValue = "asc") String direction) {
        return service.search(q, country, department, status, page, size, sort, direction);
    }

    @GetMapping("/filters")
    public FilterOptions filters() { return new FilterOptions(service.countries(), service.departments()); }

    @GetMapping("/{id}")
    public Employee get(@PathVariable UUID id) { return service.get(id); }

    @PostMapping
    public Employee create(@Valid @RequestBody EmployeeRequest request) { return service.create(request); }

    @PutMapping("/{id}/salary")
    public Employee updateSalary(@PathVariable UUID id, @Valid @RequestBody SalaryUpdateRequest request,
                                 @AuthenticationPrincipal Jwt jwt) {
        String subject = jwt.getSubject();
        UUID actor;
        try { actor = UUID.fromString(subject); }
        catch (IllegalArgumentException ex) { throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Invalid token subject"); }
        return service.updateSalary(id, request, actor);
    }

    @GetMapping("/{id}/salary-audit")
    public List<SalaryAuditEntry> audit(@PathVariable UUID id) { return service.audit(id); }

    public record FilterOptions(List<String> countries, List<String> departments) {}
}
