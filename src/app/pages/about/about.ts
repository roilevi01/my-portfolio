import { Component, inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ScrollService } from '../../services/scroll.service';
import { IntersectionObserverService } from '../../services/intersection-observer.service';

@Component({
  selector: 'app-about',
  standalone: true,
  styleUrls: ['./about.scss'],
  templateUrl: './about.html',
})
export class About implements AfterViewInit {
  private scroll = inject(ScrollService);
  private intersectionObserver = inject(IntersectionObserverService);

  @ViewChild('aboutImage', { static: false }) aboutImage?: ElementRef<HTMLImageElement>;
  @ViewChild('aboutText', { static: false }) aboutText?: ElementRef<HTMLDivElement>;

  scrollToContactSlowly(event: Event) {
    event.preventDefault();
    this.scroll.scrollToElementSlowly('contact');
  }

  ngAfterViewInit() {
    // Animate image
    if (this.aboutImage?.nativeElement) {
      this.intersectionObserver.observeElement(
        this.aboutImage.nativeElement,
        (entry: IntersectionObserverEntry) => {
          entry.target.classList.add('visible');
        }
      );
    }

    // Animate text
    if (this.aboutText?.nativeElement) {
      this.intersectionObserver.observeElement(
        this.aboutText.nativeElement,
        (entry: IntersectionObserverEntry) => {
          entry.target.classList.add('visible');
        }
      );
    }
  }
}
