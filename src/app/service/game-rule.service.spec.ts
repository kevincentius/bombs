import { TestBed } from '@angular/core/testing';

import { GameRuleService } from './game-rule.service';

describe('GameRuleService', () => {
  let service: GameRuleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameRuleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
