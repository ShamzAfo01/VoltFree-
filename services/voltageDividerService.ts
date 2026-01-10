
import { STANDARD_RESISTORS } from '../constants';
import { CalculationResult, ResistorPair } from '../types';

export const formatResistor = (r: number): string => {
  if (r >= 1000000) return (r / 1000000).toFixed(1).replace(/\.0$/, '') + "MΩ";
  if (r >= 1000) return (r / 1000).toFixed(1).replace(/\.0$/, '') + "kΩ";
  return r.toFixed(0) + "Ω";
};

export const calculateBestDivider = (vIn: number, targetVOut: number): CalculationResult => {
  if (targetVOut >= vIn) {
    return { bestPair: null, error: "Whoops! Output voltage cannot be higher than Input voltage." };
  }

  if (vIn <= 0 || targetVOut <= 0) {
    return { bestPair: null, error: "Please enter positive voltage values." };
  }

  let bestPair: ResistorPair | null = null;
  let minError = Infinity;

  // We prioritize R2 (GND resistor) between 100 and 1M for practical use
  // but the prompt suggested 1k to 100k for ADC stability.
  const validR2Values = STANDARD_RESISTORS.filter(r => r >= 1000 && r <= 100000);

  for (let r2 of validR2Values) {
    // Ideal R1 calculation: Vout = Vin * (R2 / (R1 + R2)) => R1 = R2 * (Vin/Vout - 1)
    let idealR1 = r2 * ((vIn / targetVOut) - 1);

    // Find nearest standard resistor for R1
    let r1 = STANDARD_RESISTORS.reduce((prev, curr) => 
      Math.abs(curr - idealR1) < Math.abs(prev - idealR1) ? curr : prev
    );

    let actualVOut = vIn * (r2 / (r1 + r2));
    let error = Math.abs(targetVOut - actualVOut);

    // Prefer pairs that are slightly under target or have minimum error
    if (error < minError) {
      minError = error;
      
      const totalR = r1 + r2;
      const current = vIn / totalR;
      const pR1 = current * current * r1;
      const pR2 = current * current * r2;
      const parallelImpedance = (r1 * r2) / (r1 + r2);
      const deviation = ((actualVOut - targetVOut) / targetVOut) * 100;

      // "Free Spirit" messaging
      const isSafe = actualVOut <= targetVOut + 0.05;
      const message = isSafe 
        ? `Success! You are free to build. Use ${formatResistor(r1)} and ${formatResistor(r2)} for a hassle-free ${actualVOut.toFixed(2)}V.`
        : `Caution: This is the best match, but it runs a bit high (${actualVOut.toFixed(2)}V). Watch your pins!`;

      bestPair = {
        r1,
        r2,
        r1Formatted: formatResistor(r1),
        r2Formatted: formatResistor(r2),
        actualVOut,
        deviation,
        powerR1: pR1,
        powerR2: pR2,
        impedance: parallelImpedance,
        isSafe,
        message
      };
    }
  }

  return { bestPair };
};
