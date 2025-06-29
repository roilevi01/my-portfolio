import { Component, signal } from '@angular/core';
import emailjs from 'emailjs-com';
import { CustomSnackbarComponent } from '../snackbar/custom-snackbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, CustomSnackbarComponent],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss'],
})
export class Contact {
  snackBarType = signal<'success' | 'error'>('success');
  showSnackbar = signal(false);

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
