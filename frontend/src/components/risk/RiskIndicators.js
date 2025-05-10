import React from 'react';
import { Badge } from '../ui/UIComponents';
import { getRiskLevelClass, getRiskLevelText, formatRiskScore } from '../../utils/formatters';

// Simple risk indicator with color-coded badge
export const RiskBadge = ({ score }) => {
  return (
    <Badge variant={getRiskLevelClass(score).replace('badge-', '')}>
      {getRiskLevelText(score)}
    </Badge>
  );
};

// Risk indicator with score and color-coded badge
export const RiskScore = ({ score, label }) => {
  return (
    <div className="flex flex-col items-center">
      {label && <span className="text-xs text-secondary-500 mb-1">{label}</span>}
      <div className="flex items-center">
        <span className="text-lg font-semibold mr-2">{formatRiskScore(score)}</span>
        <RiskBadge score={score} />
      </div>
    </div>
  );
};

// Risk gauge visualization
export const RiskGauge = ({ score, size = 'md', label = 'Risk Score' }) => {
  // Size classes
  const sizes = {
    sm: { container: 'w-24 h-24', text: 'text-base' },
    md: { container: 'w-32 h-32', text: 'text-lg' },
    lg: { container: 'w-40 h-40', text: 'text-xl' }
  };

  // Calculate the rotation of the needle based on the score
  const rotation = score * 180;
  const badgeClass = getRiskLevelClass(score);

  return (
    <div className="flex flex-col items-center">
      {/* Gauge circle */}
      <div className={`${sizes[size].container} relative`}>
        {/* Gauge background */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {/* Semi-circle gradient */}
          <div className="w-full h-full bg-gradient-to-r from-success-500 via-warning-500 to-danger-500 rounded-full" 
              style={{ clipPath: 'polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)' }}></div>
        </div>
        
        {/* Needle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1/2 bg-secondary-800 origin-bottom rounded-t-full transform transition-transform duration-500"
               style={{ transform: `rotate(${rotation}deg)` }}></div>
        </div>
        
        {/* Needle center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-secondary-800"></div>
        </div>
        
        {/* Score display */}
        <div className="absolute inset-0 flex items-center justify-center mt-4">
          <div className="text-center">
            <div className={`font-bold ${sizes[size].text}`}>{formatRiskScore(score)}</div>
            <Badge variant={badgeClass.replace('badge-', '')}>{getRiskLevelText(score)}</Badge>
          </div>
        </div>
      </div>
      
      {/* Label */}
      {label && <div className="mt-2 text-sm text-secondary-600">{label}</div>}
    </div>
  );
};

// Risk comparison with multiple scores
export const RiskComparison = ({ scores }) => {
  return (
    <div className="w-full">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left text-secondary-600">Risk Type</th>
            <th className="text-center text-secondary-600">Score</th>
            <th className="text-right text-secondary-600">Level</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((item, index) => (
            <tr key={index} className="border-t border-secondary-200">
              <td className="py-2 text-left">{item.label}</td>
              <td className="py-2 text-center">{formatRiskScore(item.score)}</td>
              <td className="py-2 text-right">
                <RiskBadge score={item.score} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Risk trend indicator
export const RiskTrendIndicator = ({ currentScore, previousScore }) => {
  // Calculate the trend
  const diff = currentScore - previousScore;
  
  // Determine the icon and color based on the trend
  const getTrendInfo = () => {
    if (Math.abs(diff) < 0.05) {  // Less than 5% change is considered stable
      return {
        icon: "→",
        color: "text-secondary-600",
        text: "Stable"
      };
    } else if (diff > 0) {
      return {
        icon: "↑",
        color: "text-danger-600",
        text: "Increasing"
      };
    } else {
      return {
        icon: "↓",
        color: "text-success-600",
        text: "Decreasing"
      };
    }
  };
  
  const { icon, color, text } = getTrendInfo();
  
  return (
    <div className="flex items-center">
      <div className={`text-lg font-bold ${color}`}>
        {icon}
      </div>
      <span className={`ml-1 text-sm ${color}`}>
        {text} ({Math.abs(diff * 100).toFixed(1)}%)
      </span>
    </div>
  );
};

// Risk timeline with history
export const RiskTimeline = ({ history }) => {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-secondary-200"></div>
      
      {/* Timeline entries */}
      <div className="space-y-6">
        {history.map((item, index) => (
          <div key={index} className="relative pl-8">
            {/* Timeline marker */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${getRiskLevelClass(item.score)} bg-white border-2`}>
              <span className="text-xs font-medium">{item.score >= 0.7 ? 'H' : item.score >= 0.4 ? 'M' : 'L'}</span>
            </div>
            
            {/* Timeline content */}
            <div>
              <div className="flex justify-between items-baseline">
                <h4 className="text-sm font-medium text-secondary-900">
                  Risk Score: {formatRiskScore(item.score)}
                </h4>
                <time className="text-xs text-secondary-500">{item.timestamp}</time>
              </div>
              <p className="mt-1 text-xs text-secondary-600">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
