import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'game',
    loadComponent: () => import('./view/game/game.component').then(m => m.GameComponent)
  },
  {
    path: 'credits',
    loadComponent: () => import('./view/credits/credits.component').then(m => m.CreditsComponent)
  },
  {
    path: '',
    loadComponent: () => import('./view/menu/menu.component').then(m => m.MenuComponent)
  },
];
