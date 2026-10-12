package co.incubyte.salary.employee;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import co.incubyte.salary.common.PageResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class EmployeeRepository {
    private final JdbcTemplate jdbc;
    private final NamedParameterJdbcTemplate named;

    public EmployeeRepository(JdbcTemplate jdbc, NamedParameterJdbcTemplate named) {
        this.jdbc = jdbc;
        this.named = named;
    }

    private static final RowMapper<Employee> EMPLOYEE_MAPPER = (rs, row) -> mapEmployee(rs);

    private static Employee mapEmployee(ResultSet rs) throws SQLException {
        return new Employee(
            rs.getObject("id", UUID.class), rs.getString("employee_number"), rs.getString("first_name"),
            rs.getString("last_name"), rs.getString("email"), rs.getString("country_code"),
            rs.getString("country_name"), rs.getString("department"), rs.getString("job_title"),
            rs.getString("employment_status"), rs.getObject("hire_date", LocalDate.class),
            rs.getBigDecimal("salary_amount"), rs.getString("salary_currency").trim(), rs.getLong("version"),
            rs.getObject("created_at", OffsetDateTime.class), rs.getObject("updated_at", OffsetDateTime.class));
    }

    public PageResponse<Employee> search(String query, String country, String department, String status,
                                          int page, int size, String sort, String direction) {
        StringBuilder where = new StringBuilder(" where 1=1 ");
        MapSqlParameterSource params = new MapSqlParameterSource();
        if (query != null && !query.isBlank()) {
            where.append(" and (employee_number ilike :q or first_name ilike :q or last_name ilike :q or email ilike :q or job_title ilike :q) ");
            params.addValue("q", "%" + query.trim() + "%");
        }
        if (country != null && !country.isBlank()) { where.append(" and country_code = :country "); params.addValue("country", country.toUpperCase()); }
        if (department != null && !department.isBlank()) { where.append(" and department = :department "); params.addValue("department", department); }
        if (status != null && !status.isBlank()) { where.append(" and employment_status = :status "); params.addValue("status", status); }
        Long count = named.queryForObject("select count(*) from public.employees" + where, params, Long.class);
        List<String> columns = List.of("employee_number", "first_name", "last_name", "department", "country_code", "salary_amount", "hire_date", "updated_at");
        String orderBy = columns.contains(sort) ? sort : "last_name";
        String orderDirection = "desc".equalsIgnoreCase(direction) ? "desc" : "asc";
        params.addValue("limit", size).addValue("offset", (long) page * size);
        List<Employee> employees = named.query("select * from public.employees" + where + " order by " + orderBy + " " + orderDirection + ", id asc limit :limit offset :offset", params, EMPLOYEE_MAPPER);
        return PageResponse.of(employees, page, size, count == null ? 0 : count);
    }

    public Optional<Employee> findById(UUID id) {
        return jdbc.query("select * from public.employees where id = ?", EMPLOYEE_MAPPER, id).stream().findFirst();
    }

    public Employee create(EmployeeRequest request) {
        UUID id = UUID.randomUUID();
        jdbc.update("""
            insert into public.employees(id, employee_number, first_name, last_name, email, country_code, country_name,
              department, job_title, employment_status, hire_date, salary_amount, salary_currency)
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, id, request.employeeNumber().trim(), request.firstName().trim(), request.lastName().trim(),
            request.email().trim().toLowerCase(), request.countryCode(), request.countryName().trim(), request.department().trim(),
            request.jobTitle().trim(), request.employmentStatus(), request.hireDate(), request.salaryAmount(), request.salaryCurrency());
        return findById(id).orElseThrow();
    }

    @org.springframework.transaction.annotation.Transactional
    public Employee updateSalary(UUID id, SalaryUpdateRequest request, UUID actor) {
        Employee before = jdbc.query("select * from public.employees where id = ? for update", EMPLOYEE_MAPPER, id)
            .stream().findFirst().orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Employee not found"));
        if (before.version() != request.expectedVersion()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                "This record changed since you opened it. Reload and retry.");
        }
        int updated = jdbc.update("""
            update public.employees set salary_amount = ?, salary_currency = ?, version = version + 1
            where id = ? and version = ?
            """, request.salaryAmount(), request.salaryCurrency(), id, request.expectedVersion());
        if (updated == 0) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                "This record changed since you opened it. Reload and retry.");
        }
        if (before.salaryAmount().compareTo(request.salaryAmount()) != 0 || !before.salaryCurrency().equals(request.salaryCurrency())) {
            jdbc.update("""
                insert into public.salary_audit(employee_id, changed_by, old_salary_amount, new_salary_amount,
                  old_salary_currency, new_salary_currency, reason)
                values (?, ?, ?, ?, ?, ?, ?)
                """, id, actor, before.salaryAmount(), request.salaryAmount(), before.salaryCurrency(), request.salaryCurrency(), request.reason().trim());
        }
        return findById(id).orElseThrow();
    }

    public List<SalaryAuditEntry> audit(UUID employeeId) {
        return jdbc.query("""
            select id, employee_id, changed_by, changed_at, old_salary_amount, new_salary_amount,
              old_salary_currency, new_salary_currency, reason
            from public.salary_audit where employee_id = ? order by changed_at desc limit 100
            """, (rs, row) -> new SalaryAuditEntry(rs.getObject("id", UUID.class), rs.getObject("employee_id", UUID.class),
              rs.getObject("changed_by", UUID.class), rs.getObject("changed_at", OffsetDateTime.class),
              rs.getBigDecimal("old_salary_amount"), rs.getBigDecimal("new_salary_amount"),
              rs.getString("old_salary_currency").trim(), rs.getString("new_salary_currency").trim(), rs.getString("reason")), employeeId);
    }

    public List<String> countries() { return jdbc.queryForList("select distinct country_code from public.employees order by country_code", String.class); }
    public List<String> departments() { return jdbc.queryForList("select distinct department from public.employees order by department", String.class); }
    public long countEmployees() { Long value = jdbc.queryForObject("select count(*) from public.employees", Long.class); return value == null ? 0 : value; }
}
