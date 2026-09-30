import { describe, expect, it } from 'vitest';
import { getClubActual } from './get-club-actual.js';

describe('getClubActual', () => {
  it('returns null when trayectoria is empty', () => {
    expect(getClubActual([])).toBeNull();
    expect(getClubActual(undefined)).toBeNull();
  });

  it('returns the entry without anioFin (still there)', () => {
    const trayectoria = [
      { clubId: 'parma', anioInicio: 1995, anioFin: 2001 },
      { clubId: 'juventus', anioInicio: 2001 },
    ];
    expect(getClubActual(trayectoria)?.clubId).toBe('juventus');
  });

  it('picks the most recent anioInicio among open-ended entries', () => {
    const trayectoria = [
      { clubId: 'parma', anioInicio: 1995 },
      { clubId: 'juventus', anioInicio: 2001 },
    ];
    expect(getClubActual(trayectoria)?.clubId).toBe('juventus');
  });

  it('returns null when every entry has anioFin (no current club)', () => {
    const trayectoria = [
      { clubId: 'parma', anioInicio: 1995, anioFin: 2001 },
      { clubId: 'juventus', anioInicio: 2001, anioFin: 2018 },
      { clubId: 'psg', anioInicio: 2018, anioFin: 2019 },
    ];
    expect(getClubActual(trayectoria)).toBeNull();
  });
});
