import { Component } from '@angular/core';

import { Header } from '../../shared/header/header';
import { Hero } from './sections/hero/hero';
import { About } from '../about/about';
import { Projects } from '../projects/projects';
import { Services } from './sections/services/services';

import { Footer } from '../footer/footer';

import { RevealOnScrollDirective } from '../../shared/directives/reveal-on-scroll.directive';
import { Contact } from '../contact/contact';
import { AiChatWidgetComponent } from '../../shared/ai-chat-widget/ai-chat-widget.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Header,
    Hero,
    About,
    Projects,
    Services,
    Contact,
    Footer,
    RevealOnScrollDirective,
    AiChatWidgetComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {}
