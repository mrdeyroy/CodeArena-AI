'use client';

import * as React from 'react';
import { MessageSquare, Heart, Share2, Search, PlusCircle, BrainCircuit, Users, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useUserStore } from '@/store/user-store';
import { mockCommunityPosts } from '@/lib/mock-data';

export default function CommunityPage() {
  const { user } = useUserStore();
  const [posts, setPosts] = React.useState(mockCommunityPosts);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newContent, setNewContent] = React.useState('');
  const [newType, setNewType] = React.useState<'Discussion' | 'Question'>('Discussion');
  const [newTags, setNewTags] = React.useState('');

  const handleLike = (id: string) => {
    setPosts(prev => prev.map((post) => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
    const newPostItem = {
      id: `post_${Date.now()}`,
      author: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        rating: user.rating
      },
      title: newTitle,
      content: newContent,
      tags: tagsArray.length ? tagsArray : ['General'],
      type: newType,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      isLiked: false
    };

    setPosts([newPostItem, ...posts]);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setCreateOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> Developer Community
          </h1>
          <p className="text-xs text-slate-500 font-semibold">Share design patterns, explain algorithm optimizations, or seek code review mentoring.</p>
        </div>
        <Button size="sm" icon={PlusCircle} onClick={() => setCreateOpen(true)}>
          Create Post
        </Button>
      </div>

      {/* Post list */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="bg-slate-900/60 border-slate-800 p-5 space-y-4">
            
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={post.author.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80"} alt={post.author.name} className="w-8.5 h-8.5 rounded-lg object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200 text-xs">{post.author.name}</span>
                    <Badge variant="primary" className="text-[9px] font-bold">Rating: {post.author.rating}</Badge>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">@{post.author.username} · {new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Badge variant={post.type === 'Discussion' ? 'primary' : 'warning'}>{post.type}</Badge>
            </div>

            {/* Content body */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-200">{post.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((t) => (
                <span key={t} className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] text-slate-500 font-bold border border-slate-850">#{t}</span>
              ))}
            </div>

            {/* Metrics Action row */}
            <div className="flex gap-4 pt-3 border-t border-slate-850 text-xs font-semibold text-slate-500">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 cursor-pointer transition-colors
                  ${post.isLiked ? 'text-indigo-400' : 'hover:text-slate-350'}`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-indigo-400/20 text-indigo-400' : ''}`} />
                <span>{post.likes}</span>
              </button>
              
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>{post.comments} Comments</span>
              </div>
            </div>

          </Card>
        ))}
      </div>

      {/* Create Post Dialog Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Compose Community Post">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Post Type</label>
            <select
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/80"
              value={newType}
              onChange={(e: any) => setNewType(e.target.value)}
            >
              <option value="Discussion">Discussion</option>
              <option value="Question">Question / Help Needed</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Post Title</label>
            <input
              type="text"
              placeholder="How would you design..."
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Content Body</label>
            <textarea
              placeholder="State your ideas or include code details..."
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-150 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 h-32 resize-none"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-505 uppercase tracking-wider">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="Algorithms, Python, DP"
              className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-850 pt-4">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <Button type="submit" size="sm">
              Publish Post
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
