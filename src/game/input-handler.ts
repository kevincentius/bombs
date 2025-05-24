
export class InputHandler {
  downKeys = new Set<string>();

  constructor() {
    console.log('input');
    window.addEventListener('keydown', (event) => {
      console.log(`Key down: ${event.key}`); // Debugging log
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
