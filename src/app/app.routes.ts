import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CommandBuilderComponent } from './components/command-builder/command-builder.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'command/:id', component: CommandBuilderComponent },
  { path: '**', redirectTo: '' }
];
