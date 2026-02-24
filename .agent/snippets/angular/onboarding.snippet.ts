export const onboardingComponentSnippet = `import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowDownOutline, arrowUpOutline } from 'ionicons/icons';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon],
  template: \`
<ion-content [scrollY]="false" [fullscreen]="true" class="onboarding-bg">
  <div class="slides-container" #slides (scroll)="onScroll($event)">
    
    <!-- Slide 1 -->
    <div class="slide">
      <div class="content">
        <img src="assets/skull_logo_white.svg" alt="SkullRender" class="main-logo" />
        <p class="tagline">"Generamos tu idea desde los huesos."</p>
        <div class="visual-element bone-structure"></div>
      </div>
    </div>

    <!-- Slide 2 -->
    <div class="slide">
      <div class="content">
        <h2>Bones + Brain</h2>
        <p class="subtitle">Rational Creativity</p>
        <p class="description">
          No creamos solo aplicaciones.<br>
          Construimos <strong>identidad</strong>, <strong>estructura</strong> y <strong>esencia</strong>.
        </p>
      </div>
    </div>

    <!-- Slide 3 -->
    <div class="slide">
      <div class="content">
        <h2>Tecnología con Esencia</h2>
        <p class="description">
          Desde el hueso hasta la personalidad final.
        </p>
        
        <div class="actions">
          <ion-button expand="block" color="primary" class="main-cta" (click)="goToHome()">
            EXPLORAR
          </ion-button>
          <ion-button expand="block" fill="outline" color="light" class="secondary-cta" (click)="goToQuote()">
            COTIZAR PROYECTO
          </ion-button>
        </div>
      </div>
    </div>

  </div>
  
  <div class="nav-arrow" (click)="nextSlide()">
    <ion-icon [name]="isLastSlide ? 'arrow-up-outline' : 'arrow-down-outline'"></ion-icon>
  </div>
</ion-content>
  \`,
  styles: [\`
    /* Add specific onboarding styles here or import from global */
    .onboarding-bg { --background: #000; color: #fff; }
    .slides-container { height: 100vh; overflow-y: auto; scroll-snap-type: y mandatory; }
    .slide { height: 100vh; scroll-snap-align: start; display: flex; align-items: center; justify-content: center; }
  \`]
})
export class OnboardingComponent implements OnInit {
  @ViewChild('slides') slides!: ElementRef;
  isLastSlide = false;

  constructor(private router: Router) {
    addIcons({ arrowDownOutline, arrowUpOutline });
  }

  ngOnInit() {
    if (this.slides?.nativeElement) {
      this.slides.nativeElement.scrollTop = 0;
    }
  }

  nextSlide() {
    const container = this.slides.nativeElement;
    if (this.isLastSlide) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const height = container.clientHeight;
      container.scrollBy({ top: height, behavior: 'smooth' });
    }
  }

  onScroll(event: any) {
    const container = event.target;
    const isBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50; 
    this.isLastSlide = isBottom;
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToQuote() {
    this.router.navigate(['/quote']);
  }
}
`;
