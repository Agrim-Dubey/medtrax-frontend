import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, Eye, Send, ArrowLeft, Plus, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { communityAPI } from '../api/community';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';

export default function Community() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [createForm, setCreateForm] = useState({ title: '', content: '', category: '', status: 'published' });

  const filteredPosts = useMemo(() => {
    if (!debouncedSearch) return posts;
    const q = debouncedSearch.toLowerCase();
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.author_name?.toLowerCase().includes(q)
    );
  }, [posts, debouncedSearch]);

  const loadPosts = async (cat?: string) => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([communityAPI.getPosts(cat), communityAPI.getCategories()]);
      setPosts(p.data?.results || p.data || []);
      setCategories(c.data || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { loadPosts(); }, []);

  const openPost = async (slug: string) => {
    try {
      const [p, c] = await Promise.all([communityAPI.getPostDetail(slug), communityAPI.getComments(slug)]);
      setSelectedPost(p.data);
      setComments(c.data?.results || c.data || []);
      setView('detail');
    } catch { toast.error('Failed to load post'); }
  };

  const handleLike = async (slug: string) => {
    try {
      const res = await communityAPI.likePost(slug);
      if (view === 'detail') setSelectedPost((p: any) => ({ ...p, total_likes: res.data.total_likes, is_liked: res.data.is_liked }));
      loadPosts(activeCategory);
    } catch { /* silent */ }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !selectedPost) return;
    try {
      await communityAPI.createComment(selectedPost.slug, { content: newComment });
      const c = await communityAPI.getComments(selectedPost.slug);
      setComments(c.data?.results || c.data || []);
      setNewComment('');
      toast.success('Comment posted!');
    } catch { toast.error('Failed'); }
  };

  const handleDeletePost = async (slug: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await communityAPI.deletePost(slug);
      toast.success('Post deleted successfully');
      setView('list');
      setSelectedPost(null);
      loadPosts(activeCategory);
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.content) return toast.error('Fill title and content');
    try {
      const fd = new FormData();
      fd.append('title', createForm.title);
      fd.append('content', createForm.content);
      fd.append('status', createForm.status);
      if (createForm.category) fd.append('category', createForm.category);
      await communityAPI.createPost(fd);
      toast.success('Post created!');
      setCreateForm({ title: '', content: '', category: '', status: 'published' });
      setView('list');
      loadPosts();
    } catch (err: any) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (view === 'create') {
    return (
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div><h1>New Post</h1></div>
          <button className="btn btn-secondary btn-sm" onClick={() => setView('list')}><ArrowLeft size={16} /> Back</button>
        </div>
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleCreate}>
            <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={createForm.category} onChange={e => setCreateForm(p => ({ ...p, category: e.target.value }))}>
                <option value="">None</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Content</label><textarea className="form-textarea" rows={8} value={createForm.content} onChange={e => setCreateForm(p => ({ ...p, content: e.target.value }))} /></div>
            <button className="btn btn-primary btn-full btn-lg" type="submit">Publish Post</button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (view === 'detail' && selectedPost) {
    const isAuthor = selectedPost.author === user?.user_id;

    return (
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>{selectedPost.title}</h1>
            <p>
              By {selectedPost.author_name || selectedPost.author?.username || 'Unknown'}{' '}
              {selectedPost.author_role ? `(${selectedPost.author_role})` : ''} • Category: {selectedPost.category?.name || 'General'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isAuthor && (
              <button className="btn btn-danger btn-sm" onClick={() => handleDeletePost(selectedPost.slug)}>
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => { setView('list'); setSelectedPost(null); }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selectedPost.content}</div>
          <div className="post-actions">
            <button className={`post-action-btn ${selectedPost.is_liked ? 'liked' : ''}`} onClick={() => handleLike(selectedPost.slug)}><ThumbsUp size={16} /> {selectedPost.total_likes || 0}</button>
            <span className="post-action-btn"><Eye size={16} /> {selectedPost.views_count || 0}</span>
            <span className="post-action-btn"><MessageSquare size={16} /> {comments.length}</span>
          </div>
        </motion.div>
        <motion.div className="glass-card" style={{ marginTop: 16 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Comments</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input className="form-input" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." onKeyDown={e => e.key === 'Enter' && handleComment()} />
            <button className="btn btn-primary" onClick={handleComment}><Send size={16} /></button>
          </div>
          {comments.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No comments yet</p> :
            comments.map((c: any) => (
              <div key={c.id} style={{ padding: 12, marginBottom: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <strong style={{ fontSize: '0.85rem' }}>{c.author_name || c.author?.username || 'User'}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.created_at?.split('T')[0]}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{c.content}</p>
              </div>
            ))
          }
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1>Community Forum</h1>
          <p>Clinical discussions, health guidelines & peer articles</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search articles & tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '0.8rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          {isDoctor && (
            <button className="btn btn-primary btn-sm" onClick={() => setView('create')}>
              <Plus size={16} /> New Post
            </button>
          )}
        </div>
      </div>
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className={`btn btn-sm ${!activeCategory ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 100, padding: '4px 14px', fontSize: '0.8rem' }}
            onClick={() => { setActiveCategory(''); loadPosts(); }}
          >
            All Topics ({posts.length})
          </button>
          {categories.map(c => {
            const count = posts.filter(p => p.category?.slug === c.slug || p.category_name === c.name).length;
            const isSelected = activeCategory === c.slug;

            return (
              <button
                key={c.id}
                type="button"
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  borderRadius: 100,
                  padding: '4px 14px',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={() => { setActiveCategory(c.slug); loadPosts(c.slug); }}
              >
                <span>{c.name}</span>
                {count > 0 && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: 100,
                      background: isSelected ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.1)',
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
      {loading ? <div className="loading-container"><div className="spinner" /></div> :
        filteredPosts.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={48} />
            <h3>{searchQuery ? 'No articles match your search' : 'No posts yet'}</h3>
            <p>{searchQuery ? 'Try broader keywords or reset category filter' : 'Be the first to start a clinical conversation'}</p>
          </div>
        ) : (
          filteredPosts.map((p: any, i: number) => (
            <motion.div key={p.id} className="post-card" onClick={() => openPost(p.slug)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="post-meta">
                <span>{p.author_name || p.author?.username || 'Unknown'}</span>
                <span>{p.published_at?.split('T')[0] || p.created_at?.split('T')[0]}</span>
                {p.category_name && <span className="badge badge-confirmed">{p.category_name}</span>}
              </div>
              <h3>{p.title}</h3>
              <p className="post-excerpt">{p.excerpt || p.content?.slice(0, 150)}</p>
              <div className="post-actions">
                <span className="post-action-btn"><ThumbsUp size={14} /> {p.total_likes || p.likes_count || 0}</span>
                <span className="post-action-btn"><Eye size={14} /> {p.views_count || 0}</span>
                <span className="post-action-btn"><MessageSquare size={14} /> {p.comments_count || 0}</span>
              </div>
            </motion.div>
          ))
        )
      }
    </div>
  );
}
