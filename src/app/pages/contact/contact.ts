import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import emailjs from 'emailjs-com';
import { CustomSnackbarComponent } from '../snackbar/custom-snackbar.component';
import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, CustomSnackbarComponent, RevealOnScrollDirective],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss'],
})
export class Contact {
  isSending = signal(false);

  snackBarType = signal<'success' | 'error'>('success');
  showSnackbar = signal(false);

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    // הגנת honeypot: אם השדה המוסתר מולא — כנראה בוט. נעצור בשקט.
    const honeypot = (form.elements.namedItem('company') as HTMLInputElement | null)?.value;
    if (honeypot) {
      form.reset();
      return;
    }

    if (this.isSending()) return;
    this.isSending.set(true);

    try {
      await emailjs.sendForm(
        'service_4flqi53',
        'template_rahm6gh',
        form,
        '-5mmTYNqLYdZmaKT4'
      );

      this.snackBarType.set('success');
      this.showSnackbar.set(true);
      form.reset();
    } catch (err) {
      console.error('FAILED...', err);
      this.snackBarType.set('error');
      this.showSnackbar.set(true);
    } finally {
      this.isSending.set(false);
    }
  }

  onDismissed(): void {
    this.showSnackbar.set(false);
  }
}
