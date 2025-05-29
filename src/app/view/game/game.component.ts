import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  scale = 1;

  get score0() { return this.ctx!.displayData.teams[0].score; }
  get score1() { return this.ctx!.displayData.teams[1].score; }

  rect: { x: number, y: number, width: number, height: number } = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

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
    await this.ctx.init();

    this.onResize();
  }

  // auto resize canvas (800x400) to fit screen, while preserving aspect ratio
  @HostListener('window:resize')
  onResize() {
    if (!this.ctx) return;

    const canvas = this.canvas.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // calculate scale to fit screen
    const scaleX = width / 800;
    const scaleY = height / 400;
    this.scale = Math.min(scaleX, scaleY);

    // set canvas size
    canvas.width = 800 * this.scale;
    canvas.height = 400 * this.scale;

    // // update pixi app
    
    // Apply scale to stage
    this.ctx.appPixi.rescale(this.scale);

    setTimeout(() => {
      this.rect = {
        x: canvas.offsetLeft,
        y: canvas.offsetTop,
        width: canvas.offsetWidth,
        height: canvas.offsetHeight
      }
    });
  }
}
