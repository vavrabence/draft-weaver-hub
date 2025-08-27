
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Calendar, Palette, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '@/hooks/useDrafts';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { drafts, isLoading } = useDrafts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    drafts: drafts?.length || 0,
    scheduled: drafts?.filter(d => d.status === 'scheduled').length || 0,
    posted: drafts?.filter(d => d.status === 'posted').length || 0
  };

  const isFirstLogin = stats.drafts === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email?.split('@')[0] || 'there'}! Manage your content creation workflow
          </p>
        </div>

        {isFirstLogin ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-muted/50 rounded-full p-6 mb-6">
              <Upload className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome to Draft Weaver!</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by uploading your first piece of content. We'll help you manage and schedule your posts across platforms.
            </p>
            <Button onClick={() => navigate('/upload')} size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Content
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/drafts')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Queue</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.drafts}</div>
                <p className="text-xs text-muted-foreground">
                  drafts ready for editing
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">Draft</Badge>
                  <Badge variant="outline">Caption Ready</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Posts</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.scheduled}</div>
                <p className="text-xs text-muted-foreground">
                  posts scheduled for this week
                </p>
                <div className="mt-2">
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow" onClick={() => navigate('/style')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Style Profile</CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Not Set</div>
                <p className="text-xs text-muted-foreground">
                  analyze your posting style
                </p>
                <div className="mt-2">
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => navigate('/upload')} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Content
            </Button>
            <Button variant="outline" onClick={() => navigate('/drafts')} className="gap-2">
              <FileText className="h-4 w-4" />
              View Drafts
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')} className="gap-2">
              <Calendar className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
