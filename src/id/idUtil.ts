import { v7 } from 'uuid';
import * as radixUtil from '../radix/radixUtil';

export function generateTimeOrderedBase62Id(): string {
  return radixUtil.convertHexToBase62(v7().toLowerCase().replace(/-/g, ''))
}