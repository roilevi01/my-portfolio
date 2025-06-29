import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-snackbar.component.html',
  styleUrls: ['./custom-snackbar.component.scss'],
})
export class CustomSnackbarComponent implements OnInit {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  @Output() dismissed = new EventEmitter<void>();

  isExiting: boolean = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.isExiting = true;

      setTimeout(() => {
        this.dismissed.emit();
      }, 1200);
    }, 2500);
  }
}
