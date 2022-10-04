export class BitField {
  static Flags = {};
  static DefaultBit: any = 0;
  bitfield;
  //@ts-ignore
  constructor(bits = this.constructor.DefaultBit) {
    //@ts-ignore
    this.bitfield = this.constructor.resolve(bits);
  }
  any(bit: any) {
    //@ts-ignore
    return (
      //@ts-ignore
      (this.bitfield & this.constructor.resolve(bit)) !==
      //@ts-ignore
      this.constructor.DefaultBit
    );
  }

  equals(bit: any) {
    //@ts-ignore
    return this.bitfield === this.constructor.resolve(bit);
  }

  has(bit: any) {
    //@ts-ignore
    bit = this.constructor.resolve(bit);
    return (this.bitfield & bit) === bit;
  }

  missing(bits: any, ...hasParams: any) {
    //@ts-ignore
    return new this.constructor(bits).remove(this).toArray(...hasParams);
  }

  freeze() {
    return Object.freeze(this);
  }

  add(...bits: any[]) {
    //@ts-ignore
    let total = this.constructor.DefaultBit;
    for (const bit of bits) {
      //@ts-ignore
      total |= this.constructor.resolve(bit);
    }
    if (Object.isFrozen(this))
      //@ts-ignore
      return new this.constructor(this.bitfield | total);
    this.bitfield |= total;
    return this;
  }

  remove(...bits: any[]) {
    //@ts-ignore
    let total = this.constructor.DefaultBit;
    for (const bit of bits) {
      //@ts-ignore
      total |= this.constructor.resolve(bit);
    }
    if (Object.isFrozen(this))
      //@ts-ignore
      return new this.constructor(this.bitfield & ~total);
  }

  serialize(...hasParams: any[]) {
    const serialized = {};
    //@ts-ignore
    for (const [flag, bit] of Object.entries(this.constructor.Flags)) {
      //@ts-ignore
      serialized[flag] = this.has(bit, ...hasParams);
    }
  }

  toArray(...hasParams: any[]) {
    //@ts-ignore
    return Object.keys(this.constructor.Flags).filter((bit) =>
      //@ts-ignore
      this.has(bit, ...hasParams)
    );
  }

  toJSON() {
    return typeof this.bitfield === "number"
      ? this.bitfield
      : this.bitfield.toString();
  }

  valueOf() {
    return this.bitfield;
  }

  *[Symbol.iterator]() {
    yield* this.toArray();
  }

  static resolve(bit: any): any {
    const { DefaultBit } = this;
    if (typeof DefaultBit === typeof bit && bit >= DefaultBit) return bit;
    if (bit instanceof BitField) return bit.bitfield;
    if (Array.isArray(bit))
      return bit
        .map((p) => this.resolve(p))
        .reduce((prev, p) => prev | p, DefaultBit);
    if (typeof bit === "string") {
      //@ts-ignore
      if (typeof this.Flags[bit] !== "undefined") return this.Flags[bit];
      //@ts-ignore
      if (!isNaN(bit))
        return typeof DefaultBit === "bigint" ? BigInt(bit) : Number(bit);
    }
  }
}
