import React, { useState } from 'react';
import { Send, Heart, Reply, Pin, MoreVertical } from 'lucide-react';
import { useComments, Comment } from '../../hooks/useComments';
import { Button } from '../ui/Button';

interface CommentSectionProps {
  videoId?: string;
  highlightId?: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ videoId, highlightId }) => {
  const { comments, loading, addComment, getTimeAgo } = useComments(videoId, highlightId);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      await addComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (replyContent.trim()) {
      await addComment(replyContent.trim(), parentId);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-12 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="flex space-x-3">
        <img
          src={comment.user.avatar_url || `https://ui-avatars.com/api/?name=${comment.user.username}&background=3b82f6&color=fff`}
          alt={comment.user.username}
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900 dark:text-white">
              {comment.user.username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {getTimeAgo(comment.created_at)}
            </span>
            {comment.is_pinned && (
              <Pin className="w-3 h-3 text-blue-500" />
            )}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {comment.content}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
              <Heart className="w-3 h-3" />
              <span>{comment.likes}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}
            <button className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <MoreVertical className="w-3 h-3" />
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${comment.user.username}...`}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                  <Send className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex space-x-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <div className="flex space-x-3">
          <img
            src="https://ui-avatars.com/api/?name=You&background=3b82f6&color=fff"
            alt="Your avatar"
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <Button type="submit" disabled={!newComment.trim()} icon={Send}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
        
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};