import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss'
})
export class Hero implements AfterViewInit {
  @ViewChild('heroTitle', { static: false }) heroTitle?: ElementRef<HTMLElement>;
  @ViewChild('heroName', { static: false }) heroName?: ElementRef<HTMLElement>;
  @ViewChild('heroButton', { static: false }) heroButton?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    // Add entrance animations with proper timing
    const greeting = this.heroTitle?.nativeElement.querySelector('.greeting');
    if (greeting) {
      requestAnimationFrame(() => {
        greeting.classList.add('animate-in');
      });
    }

    if (this.heroName?.nativeElement) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          this.heroName?.nativeElement.classList.add('animate-in');
        });
      }, 300);
    }

    const title = this.heroTitle?.nativeElement.querySelector('.title');
    if (title) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          title.classList.add('animate-in');
        });
      }, 600);
    }

    if (this.heroButton?.nativeElement) {
      setTimeout(() => {
        requestAnimationFrame(() => {
          this.heroButton?.nativeElement.classList.add('animate-in');
        });
      }, 900);
    }
  }
}
