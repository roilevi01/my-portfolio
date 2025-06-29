import { Component } from '@angular/core';
import { Hero } from './sections/hero/hero';
import { About } from '../about/about';
import { Projects } from '../projects/projects';
import { Services } from './sections/services/services';
import { Contact } from '../contact/contact';
import { Footer } from '../footer/footer';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, About, Projects, Services, Footer, Header, Contact],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {}
