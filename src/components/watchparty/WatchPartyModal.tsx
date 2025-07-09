import React, { useState } from 'react';
import { X, Users, Clock, Globe, Lock, Play, Video, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useWatchParty } from '../../hooks/useWatchParty';

interface WatchPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId?: string;
  contentType?: 'video' | 'highlight' | 'match';
  contentTitle?: string;
}

export const WatchPartyModal: React.FC<WatchPartyModalProps> = ({
  isOpen,
  onClose,
  contentId,
  contentType,
  contentTitle
}) => {
  const [formData, setFormData] = useState({
    name: contentTitle ? `Watch "${contentTitle}" together` : '',
    description: '',
    is_public: true,
    max_participants: 10,
    scheduled_start: ''
  });
  const [loading, setLoading] = useState(false);

  const { createWatchParty } = useWatchParty();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId || !contentType) return;

    try {
      setLoading(true);
      const partyData = {
        ...formData,
        [`${contentType}_id`]: contentId
      };

      const party = await createWatchParty(partyData);
      
      // Redirect to the watch party
      window.location.href = `/watch-party/${party.id}`;
    } catch (error) {
      console.error('Error creating watch party:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Watch Party</h2>
              <p className="text-sm text-gray-400">Watch together with friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Content Preview */}
          {contentTitle && (
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  {contentType === 'video' && <Video className="w-4 h-4 text-white" />}
                  {contentType === 'highlight' && <Zap className="w-4 h-4 text-white" />}
                  {contentType === 'match' && <Play className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="text-sm text-gray-400 capitalize">{contentType}</p>
                  <p className="font-medium text-white">{contentTitle}</p>
                </div>
              </div>
            </div>
          )}

          {/* Party Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Party Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              placeholder="Enter party name..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
                              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 resize-none"
              placeholder="Tell people what this party is about..."
            />
          </div>

          {/* Privacy & Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Privacy
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    checked={formData.is_public}
                    onChange={() => setFormData({ ...formData, is_public: true })}
                    className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white">Public</span>
                  </div>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    checked={!formData.is_public}
                    onChange={() => setFormData({ ...formData, is_public: false })}
                    className="w-4 h-4 text-blue-500 bg-gray-800 border-gray-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white">Private</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Participants
              </label>
              <select
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value={5}>5 people</option>
                <option value={10}>10 people</option>
                <option value={20}>20 people</option>
                <option value={50}>50 people</option>
              </select>
            </div>
          </div>

          {/* Scheduled Start */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Schedule Start (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_start}
              onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
            >
              {loading ? 'Creating...' : 'Create Party'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};