/**
 * Simple logger with color support
 */

import pc from "picocolors";

let verboseMode = false;

export const logger = {
  setVerbose(enabled: boolean) {
    verboseMode = enabled;
  },

  info(message: string) {
    console.log(pc.blue("info"), message);
  },

  success(message: string) {
    console.log(pc.green("success"), message);
  },

  warning(message: string) {
    console.log(pc.yellow("warning"), message);
  },

  error(message: string) {
    console.error(pc.red("error"), message);
  },

  verbose(message: string, data?: unknown) {
    if (verboseMode) {
      console.log(pc.dim("verbose"), message);
      if (data) {
        console.log(pc.dim(JSON.stringify(data, null, 2)));
      }
    }
  },

  step(message: string) {
    console.log(pc.cyan("->"), message);
  },
};
