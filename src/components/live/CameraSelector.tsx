import React, { useState } from 'react';
import { Video, Grid3X3, User, MapPin } from 'lucide-react';

interface CameraSelectorProps {
  onCameraChange?: (camera: string) => void;
}

export const CameraSelector: React.FC<CameraSelectorProps> = ({ onCameraChange }) => {
  const [selectedCamera, setSelectedCamera] = useState('main');

  const cameras = [
    {
      id: 'main',
      name: 'Main Camera',
      icon: Video,
      description: 'Primary match view'
    },
    {
      id: 'tactical',
      name: 'Tactical View',
      icon: Grid3X3,
      description: 'Wide tactical angle'
    },
    {
      id: 'player-cam',
      name: 'Player Cam',
      icon: User,
      description: 'Follow key players'
    },
    {
      id: 'stadium',
      name: 'Stadium View',
      icon: MapPin,
      description: 'Full stadium perspective'
    }
  ];

  const handleCameraChange = (cameraId: string) => {
    setSelectedCamera(cameraId);
    onCameraChange?.(cameraId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Camera Angles
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {cameras.map((camera) => {
          const Icon = camera.icon;
          const isSelected = selectedCamera === camera.id;
          
          return (
            <button
              key={camera.id}
              onClick={() => handleCameraChange(camera.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon className={`w-5 h-5 ${
                  isSelected ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'
                }`} />
                <span className={`font-medium text-sm ${
                  isSelected 
                    ? 'text-blue-900 dark:text-blue-100' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {camera.name}
                </span>
              </div>
              <p className={`text-xs ${
                isSelected 
                  ? 'text-blue-700 dark:text-blue-300' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {camera.description}
              </p>
              
              {isSelected && (
                <div className="mt-2 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-600 font-medium">Live</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quality Selector */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Stream Quality
        </label>
        <select className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
          <option value="auto">Auto (1080p)</option>
          <option value="1080p">1080p HD</option>
          <option value="720p">720p</option>
          <option value="480p">480p</option>
        </select>
      </div>
    </div>
  );
};