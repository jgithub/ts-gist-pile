import { v6 } from 'uuid';
import { v7 } from 'uuid';

export function generateV6(): string {
  return v6()
}

export function generateV7(): string {
  return v7()
}

