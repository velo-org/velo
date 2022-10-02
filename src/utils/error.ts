export class Inaccessible extends Error {
  constructor() {
    super();
    this.name = "Inaccessible";
  }
}
