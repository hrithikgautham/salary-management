package co.incubyte.salary.dashboard;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final JdbcTemplate jdbc;
    public DashboardController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @GetMapping("/summary")
    public Summary summary() {
        Map<String, Object> counts = jdbc.queryForMap("""
            select count(*) as total,
              count(*) filter (where employment_status = 'ACTIVE') as active,
              count(*) filter (where employment_status = 'ON_LEAVE') as on_leave,
              count(*) filter (where employment_status = 'TERMINATED') as terminated
            from public.employees
            """);
        List<CurrencySummary> compensation = jdbc.query("""
            select salary_currency as currency, count(*) as employees,
              round(avg(salary_amount), 2) as average_salary,
              round(min(salary_amount), 2) as min_salary,
              round(max(salary_amount), 2) as max_salary,
              round(sum(salary_amount), 2) as total_salary
            from public.employees where employment_status <> 'TERMINATED'
            group by salary_currency order by salary_currency
            """, (rs, row) -> new CurrencySummary(rs.getString("currency").trim(), rs.getLong("employees"),
                rs.getBigDecimal("average_salary"), rs.getBigDecimal("min_salary"), rs.getBigDecimal("max_salary"), rs.getBigDecimal("total_salary")));
        List<SegmentSummary> byCountry = jdbc.query("""
            select country_code, country_name, salary_currency as currency, count(*) as employees,
              round(avg(salary_amount), 2) as average_salary, round(sum(salary_amount), 2) as total_salary
            from public.employees where employment_status <> 'TERMINATED'
            group by country_code, country_name, salary_currency order by country_name, salary_currency
            """, (rs, row) -> new SegmentSummary(rs.getString("country_code").trim(), rs.getString("country_name"),
                rs.getString("currency").trim(), rs.getLong("employees"), rs.getBigDecimal("average_salary"), rs.getBigDecimal("total_salary")));
        List<SegmentSummary> byDepartment = jdbc.query("""
            select department as segment, salary_currency as currency, count(*) as employees,
              round(avg(salary_amount), 2) as average_salary, round(sum(salary_amount), 2) as total_salary
            from public.employees where employment_status <> 'TERMINATED'
            group by department, salary_currency order by department, salary_currency
            """, (rs, row) -> new SegmentSummary(rs.getString("segment"), rs.getString("segment"),
                rs.getString("currency").trim(), rs.getLong("employees"), rs.getBigDecimal("average_salary"), rs.getBigDecimal("total_salary")));
        return new Summary(number(counts.get("total")), number(counts.get("active")), number(counts.get("on_leave")), number(counts.get("terminated")), compensation, byCountry, byDepartment);
    }

    private long number(Object n) { return n instanceof Number value ? value.longValue() : 0L; }
    public record Summary(long totalEmployees, long activeEmployees, long employeesOnLeave, long terminatedEmployees,
                          List<CurrencySummary> compensationByCurrency, List<SegmentSummary> byCountry,
                          List<SegmentSummary> byDepartment) {}
    public record CurrencySummary(String currency, long employees, BigDecimal averageSalary, BigDecimal minSalary,
                                  BigDecimal maxSalary, BigDecimal totalSalary) {}
    public record SegmentSummary(String segment, String label, String currency, long employees,
                                 BigDecimal averageSalary, BigDecimal totalSalary) {}
}
