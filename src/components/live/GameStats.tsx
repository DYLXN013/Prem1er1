import React from 'react';
import { GameStats as GameStatsType } from '../../types';

interface GameStatsProps {
  stats: GameStatsType;
  homeTeam: string;
  awayTeam: string;
}

export const GameStats: React.FC<GameStatsProps> = ({ stats, homeTeam, awayTeam }) => {
  const StatRow: React.FC<{ 
    label: string; 
    homeValue: number | string; 
    awayValue: number | string;
    isPercentage?: boolean;
  }> = ({ label, homeValue, awayValue, isPercentage = false }) => {
    const homePercent = isPercentage ? homeValue : 
      (Number(homeValue) / (Number(homeValue) + Number(awayValue))) * 100;
    const awayPercent = isPercentage ? awayValue : 100 - Number(homePercent);

    return (
      <div className="py-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-blue-600">{homeValue}</span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </span>
          <span className="text-sm font-medium text-red-600">{awayValue}</span>
        </div>
        <div className="flex h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 transition-all duration-300"
            style={{ width: `${homePercent}%` }}
          />
          <div 
            className="bg-red-600 transition-all duration-300"
            style={{ width: `${awayPercent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Match Stats</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">{homeTeam}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">{awayTeam}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
        <StatRow 
          label="Possession" 
          homeValue={`${stats.possession.home}%`}
          awayValue={`${stats.possession.away}%`}
          isPercentage={true}
        />
        
        <StatRow 
          label="Shots" 
          homeValue={stats.shots.home}
          awayValue={stats.shots.away}
        />
        
        <StatRow 
          label="Shots on Target" 
          homeValue={stats.shotsOnTarget.home}
          awayValue={stats.shotsOnTarget.away}
        />
        
        <StatRow 
          label="Fouls" 
          homeValue={stats.fouls.home}
          awayValue={stats.fouls.away}
        />
        
        <StatRow 
          label="Corners" 
          homeValue={stats.corners.home}
          awayValue={stats.corners.away}
        />
        
        <StatRow 
          label="Yellow Cards" 
          homeValue={stats.yellowCards.home}
          awayValue={stats.yellowCards.away}
        />
        
        {(stats.redCards.home > 0 || stats.redCards.away > 0) && (
          <StatRow 
            label="Red Cards" 
            homeValue={stats.redCards.home}
            awayValue={stats.redCards.away}
          />
        )}
      </div>
    </div>
  );
};