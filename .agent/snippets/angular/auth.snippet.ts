export const loginComponentSnippet = `import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { IonContent, IonCard, IonIcon, IonText, IonButton, IonSpinner, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';
import { UserRole } from '../../../core/auth/user.model';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterLink,
    IonContent, IonCard, IonIcon, IonText, IonButton, IonSpinner, IonGrid, IonRow, IonCol
  ],
  template: \`
    <!-- Login HTML Structure goes here (refer to SkullRender standard) -->
  \`,
  styles: [\`
    /* Minimalist Dark Theme Auth Styles */
  \`]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  
  isLoading = signal(false);
  
  // Registration Integrated Form (Optional)
  registerForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  constructor() {
    addIcons({ logoGoogle });
  }

  async login(role: UserRole) {
    this.isLoading.set(true);
    try {
      await this.authService.loginWithGoogle(role);
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    
    try {
      const { fullName, email, password } = this.registerForm.getRawValue();
      
      await this.authService.register({
        email: email!,
        fullName: fullName!,
        password: password!
      });
    } catch (error) {
      console.error('Registration failed', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
`;
