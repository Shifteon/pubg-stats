import { Game, TeamOverview, TeamHallOfFame, TeamPersonalBest } from '@/types';

export function getTeamOverviewStats(periodGames: Game[]) {
  let wins = 0;
  let losses = 0;
  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let currentStreak = 0;

  for (const game of periodGames) {
    if (game.isWin) {
      wins++;
      currentStreak++;
      if (currentStreak > maxWinStreak) {
        maxWinStreak = currentStreak;
      }
    } else {
      losses++;
      currentStreak = 0;
    }
  }
  
  // To get current win streak we would have to loop backwards from the end if periodGames is chronological.
  // Wait, periodGames is chronological (oldest to newest). So currentWinStreak is just currentStreak at the end.
  currentWinStreak = currentStreak;

  const totalGames = periodGames.length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  return {
    totalGames,
    wins,
    losses,
    winRate,
    winStreak: currentWinStreak,
    longestWinStreak: maxWinStreak
  };
}

export function getTeamHallOfFame(periodGames: Game[], players: TeamOverview['players']): TeamHallOfFame {
  // Returns the best stat across ALL players for [kills, assists, damage, rescues, recalls]
  const hallOfFame: TeamHallOfFame = {};
  
  const statsToTrack = ['kills', 'assists', 'damage', 'rescues', 'recalls'] as const;
  for (const stat of statsToTrack) {
    hallOfFame[stat] = { 
      playerId: '', 
      gameId: '', 
      statPair: { stat: stat as TeamHallOfFame[string]['statPair']['stat'], statValue: -1 } 
    };
  }

  for (const game of periodGames) {
    for (const pStat of game.stats) {
      if (pStat.kills > hallOfFame['kills'].statPair.statValue) {
        hallOfFame['kills'] = { playerId: pStat.playerId, gameId: game.id, statPair: { stat: 'kills', statValue: pStat.kills } };
      }
      if (pStat.assists > hallOfFame['assists'].statPair.statValue) {
        hallOfFame['assists'] = { playerId: pStat.playerId, gameId: game.id, statPair: { stat: 'assists', statValue: pStat.assists } };
      }
      if (pStat.damage > hallOfFame['damage'].statPair.statValue) {
        hallOfFame['damage'] = { playerId: pStat.playerId, gameId: game.id, statPair: { stat: 'damage', statValue: pStat.damage } };
      }
      if (pStat.rescues > hallOfFame['rescues'].statPair.statValue) {
        hallOfFame['rescues'] = { playerId: pStat.playerId, gameId: game.id, statPair: { stat: 'rescues', statValue: pStat.rescues } };
      }
      if (pStat.recalls > hallOfFame['recalls'].statPair.statValue) {
        hallOfFame['recalls'] = { playerId: pStat.playerId, gameId: game.id, statPair: { stat: 'recalls', statValue: pStat.recalls } };
      }
    }
  }

  return hallOfFame;
}

export function getTeamPersonalBests(periodGames: Game[], players: TeamOverview['players']): TeamPersonalBest {
  // Returns personal bests FOR EACH player
  const personalBests: TeamPersonalBest = {};

  for (const p of players) {
    personalBests[p.id] = {
      kills: { stat: 'kills', statValue: -1, gameId: '' },
      assists: { stat: 'assists', statValue: -1, gameId: '' },
      damage: { stat: 'damage', statValue: -1, gameId: '' },
      rescues: { stat: 'rescues', statValue: -1, gameId: '' },
      recalls: { stat: 'recalls', statValue: -1, gameId: '' },
    };
  }

  for (const game of periodGames) {
    for (const pStat of game.stats) {
      if (!personalBests[pStat.playerId]) continue;
      const pb = personalBests[pStat.playerId];

      if (pStat.kills > pb.kills.statValue) {
        pb.kills = { stat: 'kills', statValue: pStat.kills, gameId: game.id };
      }
      if (pStat.assists > pb.assists.statValue) {
        pb.assists = { stat: 'assists', statValue: pStat.assists, gameId: game.id };
      }
      if (pStat.damage > pb.damage.statValue) {
        pb.damage = { stat: 'damage', statValue: pStat.damage, gameId: game.id };
      }
      if (pStat.rescues > pb.rescues.statValue) {
        pb.rescues = { stat: 'rescues', statValue: pStat.rescues, gameId: game.id };
      }
      if (pStat.recalls > pb.recalls.statValue) {
        pb.recalls = { stat: 'recalls', statValue: pStat.recalls, gameId: game.id };
      }
    }
  }

  return personalBests;
}

export function getTeamCurrentForm(periodGames: Game[]) {
  let kills = 0;
  let damage = 0;
  let gamesPlayed = 0; // Number of player-games (total stats)
  
  for (const game of periodGames) {
    for (const stat of game.stats) {
      kills += stat.kills || 0;
      damage += stat.damage || 0;
      gamesPlayed++;
    }
  }

  return {
    avgKills: gamesPlayed > 0 ? (kills / gamesPlayed) : 0,
    avgDamage: gamesPlayed > 0 ? (damage / gamesPlayed) : 0
  };
}

import { calculateKillStealing } from '@/utils/statHelpers';

export function getTeamKillStealStats(periodGames: Game[], players: TeamOverview['players']) {
  let teamKills = 0;
  let teamDamage = 0;
  const playerStats: Record<string, { kills: number; damage: number }> = {};

  for (const p of players) {
    playerStats[p.id] = { kills: 0, damage: 0 };
  }

  for (const game of periodGames) {
    for (const stat of game.stats) {
      teamKills += stat.kills || 0;
      teamDamage += stat.damage || 0;
      if (playerStats[stat.playerId]) {
        playerStats[stat.playerId].kills += stat.kills || 0;
        playerStats[stat.playerId].damage += stat.damage || 0;
      }
    }
  }

  const results = [];

  for (const p of players) {
    const stats = playerStats[p.id];
    const ks = calculateKillStealing(stats.kills, stats.damage, teamKills, teamDamage);
    results.push({ playerId: p.id, ksPercentage: ks });
  }

  // Sort descending by KS percentage
  results.sort((a, b) => b.ksPercentage - a.ksPercentage);

  return results;
}
