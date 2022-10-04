export class Snowflake {
  #epoch;
  constructor(epoch: string | number | bigint | boolean | Date) {
    this.#epoch = BigInt(epoch instanceof Date ? epoch.getTime() : epoch);
  }
  timestampFrom(id: string | number | bigint | boolean) {
    return Number((BigInt(id) >> 22n) + this.#epoch);
  }
}
