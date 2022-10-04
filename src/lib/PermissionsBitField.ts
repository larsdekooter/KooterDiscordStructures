import { PermissionFlagsBits } from "discord-api-types/v10";
import { BitField } from "./BitField.js";

export class PermissionsBitField extends BitField {
  static Flags = PermissionFlagsBits;
  static All = Object.values(PermissionFlagsBits).reduce(
    (all, p) => all | p,
    0n
  );
  static = BigInt(104324673);
  static StageModerator =
    PermissionFlagsBits.ManageChannels |
    PermissionFlagsBits.MuteMembers |
    PermissionFlagsBits.MoveMembers;

  static DefaultBit = BigInt(0);

  missing(bits: any, checkAdmin = true) {
    return checkAdmin && this.has(PermissionFlagsBits.Administrator)
      ? []
      : super.missing(bits);
  }
  any(permission: any, checkAdmin = true) {
    return (
      (checkAdmin && super.has(PermissionFlagsBits.Administrator)) ||
      super.any(permission)
    );
  }
  has(permission: any, checkAdmin = true) {
    return (
      (checkAdmin && super.has(PermissionFlagsBits.Administrator)) ||
      super.has(permission)
    );
  }
  toArray() {
    return super.toArray(false);
  }
}
