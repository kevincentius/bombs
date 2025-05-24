import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./view/game/game.component').then(m => m.GameComponent)
  }
];
