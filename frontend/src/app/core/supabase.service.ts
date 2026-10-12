import { Injectable } from '@angular/core';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly client: SupabaseClient = createClient(environment.supabaseUrl, environment.supabasePublishableKey, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  });
  private readonly sessionSubject = new BehaviorSubject<Session | null>(null);
  readonly session$ = this.sessionSubject.asObservable();

  constructor() {
    this.client.auth.getSession().then(({ data }) => this.sessionSubject.next(data.session));
    this.client.auth.onAuthStateChange((_event, session) => this.sessionSubject.next(session));
  }

  get currentSession(): Session | null { return this.sessionSubject.value; }
  get currentUser(): User | null { return this.sessionSubject.value?.user ?? null; }
  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.sessionSubject.next(data.session);
    return data;
  }
  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({ email, password });
    if (error) throw error;
    this.sessionSubject.next(data.session);
    return data;
  }
  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
    this.sessionSubject.next(null);
  }
  async accessToken(): Promise<string | null> {
    // getSession() is local/session-storage backed. AccessToken interceptor only forwards
    // the token to our own API; Spring validates it cryptographically.
    const { data, error } = await this.client.auth.getSession();
    if (error) throw error;
    this.sessionSubject.next(data.session);
    return data.session?.access_token ?? null;
  }
}
