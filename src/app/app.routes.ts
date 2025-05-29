import { Routes } from '@angular/router';
import { GameComponent } from './view/game/game.component';

export const routes: Routes = [
  {
    path: 'game',
    component: GameComponent,
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
