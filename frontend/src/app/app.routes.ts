import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { ArchitectureComponent } from './features/architecture/architecture';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'architecture', component: ArchitectureComponent },
  { path: '**', redirectTo: '' }
];
