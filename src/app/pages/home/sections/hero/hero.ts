import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeHeroBgComponent } from '../../../shared/three-hero-bg/three-hero-bg.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, ThreeHeroBgComponent],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements AfterViewInit {
  nameChars = Array.from('Roi Levi');

  @ViewChild('heroTitle', { static: false })
  heroTitle?: ElementRef<HTMLElement>;
  @ViewChild('heroButton', { static: false })
  heroButton?: ElementRef<HTMLElement>;

  ngAfterViewInit(): void {
    const greeting = this.heroTitle?.nativeElement.querySelector('.greeting');
    greeting?.classList.add('animate-in');

    const title = this.heroTitle?.nativeElement.querySelector('.title');
    setTimeout(() => title?.classList.add('animate-in'), 900);

    setTimeout(
      () => this.heroButton?.nativeElement.classList.add('animate-in'),
      1400
    );
  }
}
