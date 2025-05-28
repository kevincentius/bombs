import { Component, ElementRef, ViewChild } from '@angular/core';
import { AppPixi } from '../../../pixi/app-pixi';
import { GameContext } from '../../../game/game-context';
import { CommonModule } from '@angular/common';
import { GameRuleService } from '../../service/game-rule.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  ctx?: GameContext;

  get score0() { return this.ctx!.displayData.teams[0].score; }
  get score1() { return this.ctx!.displayData.teams[1].score; }
  getColor(team0: boolean) {
    if (team0) {
      return (this.score0 >= this.score1) ? '#ff0' : '#fff';
    } else {
      return (this.score1 >= this.score0) ? '#ff0' : '#fff';
    }
  }

  constructor(
    private gameRuleService: GameRuleService,
  ) {
    if (!this.gameRuleService.gameRule) {
      window.location.href = '/';
    }
  }

  async ngOnInit() {
    this.ctx = new GameContext(this.canvas.nativeElement, this.gameRuleService.gameRule!);
    await this.ctx.init();  }
}
