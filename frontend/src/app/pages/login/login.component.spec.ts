import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  it('creates the email/password authentication screen', async () => {
    await TestBed.configureTestingModule({ imports: [LoginComponent], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.mode).toBe('signin');
    expect(fixture.nativeElement.querySelector('input[type="email"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('input[type="password"]')).not.toBeNull();
  });
});
