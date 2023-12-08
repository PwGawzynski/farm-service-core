/**
 * This FN is used to print warning to console, using centralized for this app pattern
 * @param warn - string which represent warn cause
 * @param warnLocation - string that contain warn location e.g. User-controller
 */
export const printWarnToConsole = (warn: string, warnLocation: string) => {
  console.warn(
    '\n',
    '\x1b[33m WARNING  \x1b[0m',
    `\x1b[35m ${warn} \x1b[0m \n`,
    `\x1b[33m Warn location: ${warnLocation} \x1b[0m \n`,
  );
};
