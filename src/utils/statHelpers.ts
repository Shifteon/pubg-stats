/**
 * Calculates the kill stealing percentage for a player.
 * Kill Stealing = (% of team kills) - (% of team damage)
 * 
 * @param playerKills The player's kills in the given timeframe/scope
 * @param playerDamage The player's damage in the given timeframe/scope
 * @param teamKills The team's total kills in the given timeframe/scope
 * @param teamDamage The team's total damage in the given timeframe/scope
 * @returns The kill stealing percentage (e.g. 15.5 for 15.5%)
 */
export function calculateKillStealing(
  playerKills: number,
  playerDamage: number,
  teamKills: number,
  teamDamage: number
): number {
  if (teamKills > 0 && teamDamage > 0) {
    const killRatio = playerKills / teamKills;
    const damageRatio = playerDamage / teamDamage;
    return (killRatio - damageRatio) * 100;
  }
  return 0;
}
