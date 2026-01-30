/**
 * Simple logger with color support
 */
import pc from "picocolors";
let verboseMode = false;
export const logger = {
    setVerbose(enabled) {
        verboseMode = enabled;
    },
    info(message) {
        console.log(pc.blue("info"), message);
    },
    success(message) {
        console.log(pc.green("success"), message);
    },
    warning(message) {
        console.log(pc.yellow("warning"), message);
    },
    error(message) {
        console.error(pc.red("error"), message);
    },
    verbose(message, data) {
        if (verboseMode) {
            console.log(pc.dim("verbose"), message);
            if (data) {
                console.log(pc.dim(JSON.stringify(data, null, 2)));
            }
        }
    },
    step(message) {
        console.log(pc.cyan("->"), message);
    },
};
//# sourceMappingURL=logger.js.map