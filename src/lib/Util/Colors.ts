const Reset = "\x1b[0m";
const Bright = "\x1b[1m";
const Dim = "\x1b[2m";
const Underscore = "\x1b[4m";
const Blink = "\x1b[5m";
const Reverse = "\x1b[7m";
const Hidden = "\x1b[8m";

const FgBlack = "\x1b[30m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const FgMagenta = "\x1b[35m";
const FgCyan = "\x1b[36m";
const FgWhite = "\x1b[37m";

const BgBlack = "\x1b[40m";
const BgRed = "\x1b[41m";
const BgGreen = "\x1b[42m";
const BgYellow = "\x1b[43m";
const BgBlue = "\x1b[44m";
const BgMagenta = "\x1b[45m";
const BgCyan = "\x1b[46m";
const BgWhite = "\x1b[47m";

export const Colors = {
  Blue: 0x0000ff,
  Green: 0x78b159,
  Red: 0xff0000,
  DiscordDarkMode: 0x36393e,
  red(string: string) {
    return FgRed + string + Reset;
  },
  black(string: string) {
    return `${FgBlack}${string}${Reset}`;
  },
  green(string: string) {
    return FgGreen + string + Reset;
  },
  yellow(string: string) {
    return FgYellow + string + Reset;
  },
  blue(string: string) {
    return FgBlue + string + Reset;
  },
  magenta(string: string) {
    return FgMagenta + string + Reset;
  },
  cyan(string: string) {
    return FgCyan + string + Reset;
  },
  white(string: string) {
    return FgWhite + string + Reset;
  },
  DARK_GREEN: 0x1f8b4c,
  CHART_COLORS: {
    red: "rgb(255, 99, 132)",
    orange: "rgb(255, 159, 64)",
    yellow: "rgb(255, 205, 86)",
    green: "rgb(75, 192, 192)",
    blue: "rgb(54, 162, 235)",
    purple: "rgb(153, 102, 255)",
    grey: "rgb(201, 203, 207)",
  },
  CHART_COLORS_TRANSPARANT: {
    red: "rgba(255, 99, 132, 0.5)",
    orange: "rgba(255, 159, 64, 0.5)",
    yellow: "rgba(255, 205, 86, 0.5)",
    green: "rgba(75, 192, 192, 0.5)",
    blue: "rgba(54, 162, 235, 0.5)",
    purple: "rgba(153, 102, 255, 0.5)",
    grey: "rgba(201, 203, 207, 0.5)",
  },
};
