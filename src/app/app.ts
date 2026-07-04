import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollProgressBar } from './shared/scroll-progress-bar/scroll-progress-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ScrollProgressBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'portfolio';
}
