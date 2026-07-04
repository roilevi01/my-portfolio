import { Component } from '@angular/core';

import { Header } from '../../shared/header/header';
import { Journey } from '../journey/journey';

import { Footer } from '../footer/footer';

import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { Contact } from '../contact/contact';
import { AiChatWidgetComponent } from '../../shared/ai-chat-widget/ai-chat-widget.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Header,
    Journey,
    Contact,
    Footer,
    RevealOnScrollDirective,
    AiChatWidgetComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {}
