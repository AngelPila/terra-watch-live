import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageCircle, Send, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

// TODO: Interfaces para posts y comentarios (cuando se integre con DB real)
interface Post {
  id: string;
  user_email: string;
  user_id: string;
  content: string;
  created_at: string;
  likes: string[]; // Array de user IDs que dieron like
}

interface Comment {
  id: string;
  post_id: string;
  user_email: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface EcoFeedModeProps {
  canDelete?: boolean; // God mode puede eliminar posts/comentarios
  currentUserEmail?: string; // Email del usuario actual
  currentUserId?: string; // ID del usuario actual
}

const EcoFeedMode = ({ canDelete = false, currentUserEmail = 'usuario@ejemplo.com', currentUserId = 'user1' }: EcoFeedModeProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({});
  const [newPostContent, setNewPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [loading, setLoading] = useState(false);

  // TODO: Fetch posts desde Supabase cuando se cree la tabla 'posts'
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    // TODO: Integrar con Supabase
    // const { data, error } = await supabase
    //   .from('posts')
    //   .select('*')
    //   .order('created_at', { ascending: false });
    
    // Por ahora, cargamos desde localStorage para demo
    const storedPosts = localStorage.getItem('ecofeed_posts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    } else {
      // Posts de ejemplo
      const examplePosts: Post[] = [
        {
          id: '1',
          user_email: 'eco.warrior@example.com',
          user_id: 'user1',
          content: '🌱 ¡Gran noticia! La calidad del aire en Madrid ha mejorado un 15% este mes gracias a las nuevas políticas de movilidad sostenible.',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: [],
        },
        {
          id: '2',
          user_email: 'green.planet@example.com',
          user_id: 'user2',
          content: '⚠️ Alerta: Niveles altos de contaminación detectados en Barcelona. Se recomienda evitar actividades al aire libre durante las próximas horas.',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          likes: ['user1'],
        },
      ];
      setPosts(examplePosts);
      localStorage.setItem('ecofeed_posts', JSON.stringify(examplePosts));
    }

    // Cargar comentarios
    const storedComments = localStorage.getItem('ecofeed_comments');
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPostContent.trim()) {
      toast.error('Escribe algo antes de publicar');
      return;
    }

    if (newPostContent.length > 500) {
      toast.error('La publicación no puede tener más de 500 caracteres');
      return;
    }

    setLoading(true);

    try {
      // TODO: Integrar con Supabase
      // const { data, error } = await supabase
      //   .from('posts')
      //   .insert([{
      //     user_id: currentUserId,
      //     user_email: currentUserEmail,
      //     content: newPostContent,
      //   }])
      //   .select()
      //   .single();

      const newPost: Post = {
        id: Date.now().toString(),
        user_email: currentUserEmail,
        user_id: currentUserId,
        content: newPostContent,
        created_at: new Date().toISOString(),
        likes: [],
      };

      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      localStorage.setItem('ecofeed_posts', JSON.stringify(updatedPosts));
      
      setNewPostContent('');
      toast.success('Publicación creada correctamente');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error al crear publicación');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    // TODO: Integrar con Supabase
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(currentUserId);
        return {
          ...post,
          likes: hasLiked
            ? post.likes.filter(id => id !== currentUserId)
            : [...post.likes, currentUserId]
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem('ecofeed_posts', JSON.stringify(updatedPosts));
  };

  const handleAddComment = async (postId: string) => {
    const commentContent = commentInputs[postId]?.trim();
    if (!commentContent) {
      toast.error('Escribe un comentario');
      return;
    }

    if (commentContent.length > 200) {
      toast.error('El comentario no puede tener más de 200 caracteres');
      return;
    }

    // TODO: Integrar con Supabase tabla 'post_comments'
    const newComment: Comment = {
      id: Date.now().toString(),
      post_id: postId,
      user_email: currentUserEmail,
      user_id: currentUserId,
      content: commentContent,
      created_at: new Date().toISOString(),
    };

    const updatedComments = {
      ...comments,
      [postId]: [...(comments[postId] || []), newComment]
    };
    
    setComments(updatedComments);
    localStorage.setItem('ecofeed_comments', JSON.stringify(updatedComments));
    
    setCommentInputs({ ...commentInputs, [postId]: '' });
    toast.success('Comentario agregado');
  };

  const handleDeletePost = async (postId: string) => {
    if (!canDelete) {
      toast.error('No tienes permisos para eliminar');
      return;
    }

    // TODO: Integrar con Supabase
    const updatedPosts = posts.filter(p => p.id !== postId);
    setPosts(updatedPosts);
    localStorage.setItem('ecofeed_posts', JSON.stringify(updatedPosts));
    
    // Eliminar también sus comentarios
    const updatedComments = { ...comments };
    delete updatedComments[postId];
    setComments(updatedComments);
    localStorage.setItem('ecofeed_comments', JSON.stringify(updatedComments));
    
    toast.success('Publicación eliminada');
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!canDelete) {
      toast.error('No tienes permisos para eliminar');
      return;
    }

    // TODO: Integrar con Supabase
    const updatedComments = {
      ...comments,
      [postId]: comments[postId].filter(c => c.id !== commentId)
    };
    
    setComments(updatedComments);
    localStorage.setItem('ecofeed_comments', JSON.stringify(updatedComments));
    toast.success('Comentario eliminado');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-card shadow-card-eco border-border">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">EcoFeed - Red Social Ambiental</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Comparte tus observaciones sobre calidad del aire y medio ambiente con la comunidad.
        </p>

        {/* Formulario para crear post */}
        <form onSubmit={handleCreatePost} className="space-y-3">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="¿Qué observas en tu entorno? Comparte información sobre la calidad del aire, contaminación o iniciativas ambientales..."
            className="w-full px-4 py-3 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newPostContent.length}/500 caracteres
            </span>
            <Button
              type="submit"
              disabled={loading || !newPostContent.trim()}
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Feed de publicaciones */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="p-8 bg-card shadow-card-eco border-border text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No hay publicaciones aún. ¡Sé el primero en compartir algo!
            </p>
          </Card>
        ) : (
          posts.map((post) => {
            const postComments = comments[post.id] || [];
            const hasLiked = post.likes.includes(currentUserId);
            const isCommentsVisible = showComments[post.id];

            return (
              <Card key={post.id} className="p-4 bg-card shadow-card-eco border-border hover:shadow-eco transition-shadow">
                {/* Header del post */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {post.user_email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{post.user_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Contenido del post */}
                <p className="text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>

                {/* Acciones: Like y Comentar */}
                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1 ${hasLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                    <span className="text-xs">{post.likes.length}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments({ ...showComments, [post.id]: !isCommentsVisible })}
                    className="flex items-center gap-1 text-muted-foreground"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{postComments.length}</span>
                  </Button>
                </div>

                {/* Sección de comentarios */}
                {isCommentsVisible && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    {/* Lista de comentarios */}
                    {postComments.map((comment) => (
                      <div key={comment.id} className="flex gap-2 bg-muted/50 p-3 rounded-md">
                        <div className="w-8 h-8 rounded-full bg-secondary/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-secondary-foreground">
                            {comment.user_email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {comment.user_email}
                            </p>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(comment.created_at)}
                              </span>
                              {canDelete && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteComment(post.id, comment.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-foreground mt-1 break-words">{comment.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Input para nuevo comentario */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder="Escribe un comentario..."
                        maxLength={200}
                        className="flex-1 px-3 py-2 text-sm border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentInputs[post.id]?.trim()}
                        className="bg-primary hover:bg-primary-hover text-primary-foreground"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Nota sobre integración futura */}
      <Card className="p-4 bg-accent/10 border-accent/20">
        <p className="text-xs text-muted-foreground">
          <strong>Nota de desarrollo:</strong> Esta es una versión demo usando localStorage. 
          TODO: Integrar con Supabase creando las tablas 'posts' (id, user_id, content, created_at, likes) 
          y 'post_comments' (id, post_id, user_id, content, created_at) para persistencia real.
        </p>
      </Card>
    </div>
  );
};

export default EcoFeedMode;
