import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptProvider } from './utils/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(HttpClientModule),
    authInterceptProvider
  ]
};