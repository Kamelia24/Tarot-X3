export type GameState = "IDLE" | "ROUND_START" | "REVEAL" | "RESULT" | "BACK";

export class StateMachine {
  private state: GameState = "IDLE";

  public getState() {
    return this.state;
  }

  private setState(newState: GameState) {
    this.state = newState;
    console.log("Game State:", newState);
  }

  public async run(steps: (() => Promise<void>)[]) {
    for (const step of steps) {
      await step();
    }
  }

  public async enterState(state: GameState, callback?: () => Promise<void>) {
    this.setState(state);
    if (callback) {
      await callback();
    }
  }
}
