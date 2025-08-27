
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Palette, Wand2, Scissors, Calendar, CheckCircle } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { formatDistanceToNow } from 'date-fns';

const eventIcons = {
  'style.built': Palette,
  'caption.request': Wand2,
  'caption.ready': Wand2,
  'edit.request': Scissors,
  'edit.ready': Scissors,
  'schedule.created': Calendar,
  'posted': CheckCircle,
};

const eventLabels = {
  'style.built': 'Style Profile Built',
  'caption.request': 'Caption Generation Started',
  'caption.ready': 'Caption Generated',
  'edit.request': 'Video Edit Requested',
  'edit.ready': 'Video Edit Completed',
  'schedule.created': 'Post Scheduled',
  'posted': 'Post Published',
};

const eventColors = {
  'style.built': 'bg-purple-100 text-purple-800',
  'caption.request': 'bg-blue-100 text-blue-800',
  'caption.ready': 'bg-green-100 text-green-800',
  'edit.request': 'bg-orange-100 text-orange-800',
  'edit.ready': 'bg-green-100 text-green-800',
  'schedule.created': 'bg-indigo-100 text-indigo-800',
  'posted': 'bg-emerald-100 text-emerald-800',
};

export const RecentActivity = () => {
  const { data: events, isLoading } = useEvents(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
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

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recent activity yet. Start creating content to see your activity here!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => {
            const Icon = eventIcons[event.kind as keyof typeof eventIcons] || Clock;
            const label = eventLabels[event.kind as keyof typeof eventLabels] || event.kind;
            const colorClass = eventColors[event.kind as keyof typeof eventColors] || 'bg-gray-100 text-gray-800';
            
            return (
              <div key={event.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{label}</span>
                    <Badge variant="outline" className="text-xs">
                      {event.kind}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </p>
                  {event.payload && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {event.kind === 'style.built' && event.payload.tone && (
                        <span>Tone: {event.payload.tone}</span>
                      )}
                      {event.kind === 'posted' && event.payload.platform && (
                        <span>Platform: {event.payload.platform}</span>
                      )}
                      {event.kind === 'schedule.created' && event.payload.platform_count && (
                        <span>{event.payload.platform_count} platform(s)</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
