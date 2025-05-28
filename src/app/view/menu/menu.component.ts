import { Component } from '@angular/core';
import { credits } from '../../credits';
import { CommonModule } from '@angular/common';
import { GameRule } from '../../../game/game-rule';
import { gameOptions } from './game-options';
import { GameRuleService } from '../../service/game-rule.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  credits = credits;

  gameOptions = gameOptions.map(opt => ({
    ...opt,
    value: opt.values[opt.defaultIndex].value,
  }));

  showAdvanced = false;
  useJson = false;

  r: GameRule;
  
  gameOptionsJson = '';

  constructor(
    private gameRuleService: GameRuleService,
    private router: Router,
  ) {
    this.gameRuleService.applyDefaultGameRule();
    this.r = this.gameRuleService.gameRule!;

    this.gameOptionsJson = JSON.stringify(this.r, null, 2);
  }

  onPlayClick() {
    const r = this.r;
    
    this.gameOptions.forEach(opt => opt.applier(r, opt.value));
    this.router.navigate(['/game']);
  }

  debug(e: any) {
    this.r.fourPlayers = e;
  }
}
