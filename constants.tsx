
export const BASE_E24 = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 
  3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1
];

export const MULTIPLIERS = [1, 10, 100, 1000, 10000, 100000, 1000000];

export const generateStandardResistors = () => {
  const resistors: number[] = [];
  MULTIPLIERS.forEach(mult => {
    BASE_E24.forEach(val => resistors.push(val * mult));
  });
  return resistors.sort((a, b) => a - b);
};

export const STANDARD_RESISTORS = generateStandardResistors();
