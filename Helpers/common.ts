export const enumNumbers = (enumObject: any) =>
  Object.keys(enumObject).filter((k) => !Number.isNaN(Number(k)));

export const doesntContains = (enum1: number, enum2: any) =>
  !enumNumbers(enum2).includes(enum1.toString());
