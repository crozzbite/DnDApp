export const routerConfigSnippet = `import { Routes } from '@angular/router';

// SkullRender Standard Routing Architecture
export const routes: Routes = [
  // Genesis Entry Point
  { path: '', redirectTo: 'onboarding', pathMatch: 'full' },
  
  // Onboarding (Usually eager loaded or quickly lazy loaded)
  { 
    path: 'onboarding', 
    loadComponent: () => import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent) 
  },
  
  // Auth Flows
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) 
  },
  
  // Private / Core Application (Guarded)
  { 
    path: 'app', 
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
    // canActivate: [authGuard]
  },
  
  // Public Landings (Lazy loaded with @defer internally)
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  
  // Fallback
  { path: '**', redirectTo: 'onboarding' }
];
`;
