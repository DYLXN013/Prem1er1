import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Check, X, Upload, Eye, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { useModeration } from '../../hooks/useModeration';
import { useAuth } from '../../hooks/useAuth';

export const ModerationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'upload'>('pending');
  const [pendingContent, setPendingContent] = useState<any>({ videos: [], highlights: [] });
  const [uploadForm, setUploadForm] = useState({
    type: 'video' as 'video' | 'highlight',
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: 0,
    tags: ''
  });

  const { 
    loading, 
    error, 
    moderateContent, 
    deleteContent, 
    uploadContent, 
    getPendingContent,
    checkModerationPermissions 
  } = useModeration();
  
  const { user } = useAuth();
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermissions = await checkModerationPermissions();
      setIsModerator(hasPermissions);
      
      if (hasPermissions) {
        loadPendingContent();
      }
    };

    checkPermissions();
  }, [user]);

  const loadPendingContent = async () => {
    try {
      const content = await getPendingContent();
      setPendingContent(content);
    } catch (err) {
      console.error('Error loading pending content:', err);
    }
  };

  const handleModerate = async (
    contentType: 'video' | 'highlight',
    contentId: string,
    action: 'approve' | 'reject'
  ) => {
    try {
      await moderateContent({
        contentType,
        contentId,
        action,
        notes: action === 'reject' ? 'Content rejected by moderator' : undefined
      });
      
      await loadPendingContent();
    } catch (err) {
      console.error('Moderation error:', err);
    }
  };

  const handleDelete = async (contentType: 'video' | 'highlight', contentId: string) => {
    if (confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      try {
        await deleteContent(contentType, contentId);
        await loadPendingContent();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const contentData = {
        title: uploadForm.title,
        description: uploadForm.description,
        video_url: uploadForm.video_url,
        thumbnail_url: uploadForm.thumbnail_url,
        duration: uploadForm.duration,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      await uploadContent(uploadForm.type, contentData);
      
      // Reset form
      setUploadForm({
        type: 'video',
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
        duration: 0,
        tags: ''
      });
      
      alert('Content uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have moderator permissions to access this panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Moderation Panel
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage content, moderate discussions, and upload new videos
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'pending', name: 'Pending Content', icon: Eye },
                { id: 'upload', name: 'Upload Content', icon: Upload }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'pending' && (
          <div className="space-y-8">
            {/* Pending Videos */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pending Videos ({pendingContent.videos.length})
              </h2>
              
              {pendingContent.videos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending videos to review</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingContent.videos.map((video: any) => (
                    <div key={video.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700">
                        <img
                          src={video.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          By: {video.user?.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {video.description}
                        </p>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleModerate('video', video.id, 'approve')}
                            icon={Check}
                            disabled={loading}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleModerate('video', video.id, 'reject')}
                            icon={X}
                            disabled={loading}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete('video', video.id)}
                            icon={Trash2}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Pending Highlights */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pending Highlights ({pendingContent.highlights.length})
              </h2>
              
              {pendingContent.highlights.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending highlights to review</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingContent.highlights.map((highlight: any) => (
                    <div key={highlight.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <div className="aspect-video bg-gray-200 dark:bg-gray-700">
                        <img
                          src={highlight.thumbnail_url || 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop'}
                          alt={highlight.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {highlight.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          By: {highlight.user?.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {highlight.description}
                        </p>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleModerate('highlight', highlight.id, 'approve')}
                            icon={Check}
                            disabled={loading}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleModerate('highlight', highlight.id, 'reject')}
                            icon={X}
                            disabled={loading}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete('highlight', highlight.id)}
                            icon={Trash2}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Upload New Content
            </h2>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Type
                </label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as 'video' | 'highlight' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="video">Video</option>
                  <option value="highlight">Highlight</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={uploadForm.video_url}
                  onChange={(e) => setUploadForm({ ...uploadForm, video_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={uploadForm.thumbnail_url}
                  onChange={(e) => setUploadForm({ ...uploadForm, thumbnail_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={uploadForm.duration}
                  onChange={(e) => setUploadForm({ ...uploadForm, duration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="goals, highlights, premier-league"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                icon={Upload}
                className="w-full"
              >
                {loading ? 'Uploading...' : 'Upload Content'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};