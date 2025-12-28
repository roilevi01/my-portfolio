import { Component, signal, AfterViewInit, inject } from '@angular/core';
import emailjs from 'emailjs-com';
import { CustomSnackbarComponent } from '../snackbar/custom-snackbar.component';
import { CommonModule } from '@angular/common';
import { IntersectionObserverService } from '../../services/intersection-observer.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, CustomSnackbarComponent],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss'],
})
export class Contact implements AfterViewInit {
  snackBarType = signal<'success' | 'error'>('success');
  showSnackbar = signal(false);
  private intersectionObserver = inject(IntersectionObserverService);

  ngAfterViewInit(): void {
    const form = document.querySelector('.contact-form');
    if (form) {
      this.intersectionObserver.observeElement(form, (entry: IntersectionObserverEntry) => {
        entry.target.classList.add('visible');
      });
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();

    emailjs
      .sendForm(
        'service_4flqi53',
        'template_rahm6gh',
        event.target as HTMLFormElement,
        '-5mmTYNqLYdZmaKT4'
      )
      .then(
        () => {
          this.snackBarType.set('success');
          this.showSnackbar.set(true);
          (event.target as HTMLFormElement).reset();
        },
        (error: any) => {
          console.error('FAILED...', error);
          this.snackBarType.set('error');
          this.showSnackbar.set(true);
        }
      );
  }

  onDismissed() {
    this.showSnackbar.set(false);
  }
}
