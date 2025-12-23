export class StateMachine<S extends string> {
    private currentState!: S;
    private running = false;
  
    constructor(
      private readonly states: Record<S, () => Promise<S | void>>
    ) {}
  
    async start(initialState: S) {
      this.running = true;
      this.currentState = initialState;
  
      while (this.running) {
        const next = await this.states[this.currentState]();
  
        if (!next) {
          this.running = false;
          return;
        }
  
        this.currentState = next;
      }
    }
  
    stop() {
      this.running = false;
    }
  }
  