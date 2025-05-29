import { Component } from '@angular/core';
import { credits } from '../../credits';
import { CommonModule } from '@angular/common';
import { gameOptions } from './game-options';
import { GameRuleService } from '../../service/game-rule.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { GameContext, test } from '../../../game/game-context'; // preload

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

  get r() { return this.gameRuleService.gameRule!; }
  
  gameOptionsJson = '';

  showAcknowledgements = false;
  showHowTo = false;

  constructor(
    private gameRuleService: GameRuleService,
    private router: Router,
  ) {
    this.gameRuleService.applyDefaultGameRule();

    this.gameOptionsJson = JSON.stringify(this.r, null, 2);

    test();
  }

  onPlayClick() {
    
    if (this.useJson) {
      this.gameRuleService.applyGameRuleFromJson(this.gameOptionsJson);
    } else {
      this.gameOptions.forEach(opt => opt.applier(this.r, opt.value));
    }
    this.router.navigate(['/game']);
  }

  debug(e: any) {
    this.r.fourPlayers = e;
  }

  toggleAcknowledgements() {
    this.showAcknowledgements = !this.showAcknowledgements;
  }

  toggleHowTo() {
    this.showHowTo = !this.showHowTo;
  }
}
