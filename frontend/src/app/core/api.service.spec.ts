import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends search, filter, and pagination parameters to the server', async () => {
    const resultPromise = service.employees({ q: 'Aarav', country: 'IN', department: 'Engineering', page: 2, size: 10 });
    const request = http.expectOne(req => req.url === `${environment.apiBaseUrl}/employees`);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('q')).toBe('Aarav');
    expect(request.request.params.get('country')).toBe('IN');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('size')).toBe('10');
    request.flush({ items: [], page: 2, size: 10, totalItems: 25, totalPages: 3 });
    expect((await resultPromise).totalItems).toBe(25);
  });

  it('omits empty optional filters', async () => {
    const resultPromise = service.employees({ q: '', country: '', department: '', page: 0, size: 25 });
    const request = http.expectOne(req => req.url === `${environment.apiBaseUrl}/employees`);
    expect(request.request.params.has('q')).toBeFalse();
    expect(request.request.params.has('country')).toBeFalse();
    request.flush({ items: [], page: 0, size: 25, totalItems: 0, totalPages: 0 });
    expect((await resultPromise).items).toEqual([]);
  });
});
