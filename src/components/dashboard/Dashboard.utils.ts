import { Game, PlayerAverages } from '@/types';

export function getClutchScore(weekGames: Game[], playerId: string) {
  let rescues = 0;
  let recalls = 0;

  for (const game of weekGames) {
    const stat = game.stats.find(s => s.playerId === playerId);
    if (stat) {
      rescues += stat.rescues || 0;
      recalls += stat.recalls || 0;
    }
  }

  return (rescues * 2) + recalls;
}

export function getWeeklyTrends(weekGames: Game[], playerId: string) {
  let kills = 0;
  let damage = 0;
  let assists = 0;
  let rescues = 0;
  let recalls = 0;
  let winRate = 0;
  let gamesPlayed = 0;

  for (const game of weekGames) {
    const stat = game.stats.find(s => s.playerId === playerId);
    if (stat) {
      kills += stat.kills || 0;
      damage += stat.damage || 0;
      assists += stat.assists || 0;
      rescues += stat.rescues || 0;
      recalls += stat.recalls || 0;
      winRate += game.isWin ? 1 : 0;
      gamesPlayed++;
    }
  }

  return {
    avgKills: gamesPlayed > 0 ? (kills / gamesPlayed) : 0,
    avgDamage: gamesPlayed > 0 ? (damage / gamesPlayed) : 0,
    avgAssists: gamesPlayed > 0 ? (assists / gamesPlayed) : 0,
    avgRescues: gamesPlayed > 0 ? (rescues / gamesPlayed) : 0,
    avgRecalls: gamesPlayed > 0 ? (recalls / gamesPlayed) : 0,
    winRate: gamesPlayed > 0 ? (winRate / gamesPlayed) * 100 : 0,
    gamesPlayed
  };
}

export function getRivalry(weekGames: Game[], playerId: string) {
  // Aggregate stats for other players
  const otherPlayers: Record<string, { kills: number, damage: number, games: number, name: string }> = {};

  let myKills = 0;
  let myDamage = 0;
  let myGames = 0;

  for (const game of weekGames) {
    let playedInGame = false;
    for (const stat of game.stats) {
      if (stat.playerId === playerId) {
        playedInGame = true;
        myKills += stat.kills || 0;
        myDamage += stat.damage || 0;
        myGames++;
        break;
      }
    }

    if (playedInGame) {
      for (const stat of game.stats) {
        if (stat.playerId !== playerId) {
          if (!otherPlayers[stat.playerId]) {
            otherPlayers[stat.playerId] = { kills: 0, damage: 0, games: 0, name: stat.playerName };
          }
          otherPlayers[stat.playerId].kills += stat.kills || 0;
          otherPlayers[stat.playerId].damage += stat.damage || 0;
          otherPlayers[stat.playerId].games++;
        }
      }
    }
  }

  const myAvgTotal = myGames > 0 ? (myKills / myGames) + ((myDamage / myGames) / 100) : 0;

  let closestFriend = null;
  let minDiff = Infinity;

  // Find the friend with the closest impact score (kills + damage/100)
  for (const pId in otherPlayers) {
    const p = otherPlayers[pId];
    if (p.games > 0) {
      const pAvgTotal = (p.kills / p.games) + ((p.damage / p.games) / 100);
      const diff = Math.abs(myAvgTotal - pAvgTotal);

      if (diff < minDiff) {
        minDiff = diff;
        closestFriend = {
          name: p.name,
          avgKills: p.kills / p.games,
          avgDamage: p.damage / p.games,
          diff
        };
      }
    }
  }

  return closestFriend; // Can be null
}

export function getSquadSynergy(weekGames: Game[], playerId: string) {
  // Find which teammate you have the highest win rate with
  const teammateStats: Record<string, { wins: number, games: number, name: string }> = {};

  for (const game of weekGames) {
    let playedInGame = false;
    for (const stat of game.stats) {
      if (stat.playerId === playerId) {
        playedInGame = true;
        break;
      }
    }

    if (playedInGame) {
      for (const stat of game.stats) {
        if (stat.playerId !== playerId) {
          if (!teammateStats[stat.playerId]) {
            teammateStats[stat.playerId] = { wins: 0, games: 0, name: stat.playerName };
          }
          teammateStats[stat.playerId].games++;
          if (game.isWin) {
            teammateStats[stat.playerId].wins++;
          }
        }
      }
    }
  }

  let bestTeammate = null;
  let bestScore = -1; // Score combines win rate and game count slightly so 1 game 100% win isn't strictly better than 10 games 90%

  for (const pId in teammateStats) {
    const t = teammateStats[pId];
    if (t.games > 0) {
      const winRate = t.wins / t.games;
      // Heuristic: win rate * log of games played to reward consistency slightly
      const score = winRate * Math.max(1, Math.log10(t.games + 1));

      if (score > bestScore) {
        bestScore = score;
        bestTeammate = {
          name: t.name,
          winRate: Math.round(winRate * 100),
          games: t.games
        };
      }
    }
  }

  return bestTeammate;
}

export function getDynamicRole(weekGames: Game[], playerId: string) {
  let rescues = 0;
  let recalls = 0;
  let kills = 0;
  let damage = 0;
  let assists = 0;

  for (const game of weekGames) {
    const stat = game.stats.find(s => s.playerId === playerId);
    if (stat) {
      rescues += stat.rescues || 0;
      recalls += stat.recalls || 0;
      kills += stat.kills || 0;
      damage += stat.damage || 0;
      assists += stat.assists || 0;
    }
  }

  // Determine role
  if (kills > 15 && kills >= damage / 100) return { role: 'The Slayer', statValue: `${kills} Kills` };
  if ((rescues + recalls) > 5) return { role: 'The Medic', statValue: `${rescues + recalls} Rescues/Recalls` };
  if (damage > 3000) return { role: 'The Bruiser', statValue: `${Math.round(damage)} Damage` };
  if (assists > kills && assists > 10) return { role: 'The Tactician', statValue: `${assists} Assists` };
  return { role: 'The Survivor', statValue: `${weekGames.length} Games Survived` };
}
