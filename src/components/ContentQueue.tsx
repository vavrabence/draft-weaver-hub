
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Calendar, CheckCircle } from 'lucide-react';
import { useDrafts } from '@/hooks/useDrafts';

export const ContentQueue = () => {
  const { drafts, isLoading } = useDrafts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-8 bg-muted rounded w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = drafts?.reduce((acc, draft) => {
    acc[draft.status] = (acc[draft.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const statusConfig = {
    draft: { icon: FileText, label: 'Drafts', color: 'bg-gray-100 text-gray-800' },
    editing: { icon: Clock, label: 'Editing', color: 'bg-orange-100 text-orange-800' },
    caption_ready: { icon: FileText, label: 'Ready', color: 'bg-green-100 text-green-800' },
    scheduled: { icon: Calendar, label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    posted: { icon: CheckCircle, label: 'Posted', color: 'bg-emerald-100 text-emerald-800' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Content Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = statusCounts[status] || 0;
            const Icon = config.icon;
            
            return (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${config.color} mb-2`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{config.label}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
