class Factory<R = any> {
  private args = [];

  constructor(...args) {
    this.args = args;
  }

  create<T extends R>(type: new (args?) => T): T {
    return new type(...this.args);
  }
}

function createInstance<T = any>(instanceToCreate, args) {
  return new Factory<T>(args).create(instanceToCreate);
}

export { createInstance };
