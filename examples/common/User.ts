export class User {
  private name: string;
  private email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }

  public getDisplayName(): string {
    return this.name;
  }

  getmail(): string {
    return this.email;
  }
}
