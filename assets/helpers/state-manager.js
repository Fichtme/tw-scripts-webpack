export default class StateManager {
  #state;
  #callbacks = [];

  constructor(state) {
    this.#state = state;
  }

  listen(name, callback) {
    if (!this.#callbacks[name]) {
      this.#callbacks[name] = [callback];
    } else {
      this.#callbacks[name].push(callback);
    }
  }

  #call(name) {
    const callbacks = this.#callbacks[name];
    if (callbacks) {
      callbacks.forEach(callback => callback(this.#state));
    }
  }

  get all() {
    return this.#state;
  }

  set(state) {
    for (let key in state) {
      if (state.hasOwnProperty(key)) {
        this.#state[key] = state[key];
        this.#call(key);
      }
    }
  }

  get(state) {
    return this.#state[state];
  }
}
