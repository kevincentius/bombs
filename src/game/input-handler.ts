
export class InputHandler {
  downKeys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (event) => {
      this.downKeys.add(event.key);
    });

    window.addEventListener('keyup', (event) => {
      this.downKeys.delete(event.key);
    });
  }

  isDown(key: string): boolean {
    return this.downKeys.has(key);
  }
}
