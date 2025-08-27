
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Instagram, Youtube } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow, format } from 'date-fns';

interface ScheduledPost {
  id: string;
  platform: string;
  scheduled_for: string;
  status: string;
  drafts: {
    id: string;
    title: string;
    media_type: string;
  };
}

export const UpcomingPosts = () => {
  const { user } = useAuth();

  const { data: upcomingPosts, isLoading } = useQuery({
    queryKey: ['upcoming-posts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          id,
          platform,
          scheduled_for,
          status,
          drafts!inner(id, title, media_type, owner)
        `)
        .eq('drafts.owner', user.id)
        .eq('status', 'scheduled')
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data as ScheduledPost[];
    },
    enabled: !!user,
  });

  const platformIcons = {
    instagram: Instagram,
    tiktok: Youtube,
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!upcomingPosts || upcomingPosts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No posts scheduled yet. Schedule some content to see it here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingPosts.map((post) => {
            const Icon = platformIcons[post.platform as keyof typeof platformIcons] || Calendar;
            const scheduledDate = new Date(post.scheduled_for);
            const isToday = scheduledDate.toDateString() === new Date().toDateString();
            
            return (
              <div key={post.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-full">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {post.drafts.title || 'Untitled Post'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {post.platform}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {post.drafts.media_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isToday ? (
                      `Today at ${format(scheduledDate, 'HH:mm')}`
                    ) : (
                      `${format(scheduledDate, 'MMM d, HH:mm')} (${formatDistanceToNow(scheduledDate, { addSuffix: true })})`
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
