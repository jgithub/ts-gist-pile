export function rollOneDie(numSides: number): number { // min and max included 
  return Math.floor(Math.random() * (numSides) + 1)
}

export function xTimesRollDie(numRolls: number, numSides: number): number { // min and max included 
  let total: number = 0;
  for( let ii = 0; ii < numRolls; ii++) {
    total = total + rollOneDie(numSides)
  }
  return total
}

export function beTrueXPercentOfTheTime(percent: number): boolean { // min and max included 
  const roll = rollOneDie(100)
  return (roll <= percent) ? true : false
}