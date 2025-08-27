
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Instagram, Youtube, BarChart3, TrendingUp, Clock, Hash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { webhooks } from '@/lib/webhooks';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Style = () => {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Query for user's style profile
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleAnalyzeStyle = async (source?: 'instagram' | 'tiktok') => {
    setIsAnalyzing(true);
    try {
      const result = await webhooks.analyzeStyle(source);
      if (result.ok) {
        toast.success('Style analysis initiated!');
        // Refetch profile to get updated style data
        await refetch();
      } else {
        toast.error('Failed to analyze style');
      }
    } catch (error) {
      console.error('Error analyzing style:', error);
      toast.error('Failed to analyze style');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading style profile...</p>
        </div>
      </div>
    );
  }

  const styleProfile = profile?.style_profile;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Style Profile</h1>
          <p className="text-muted-foreground">
            Analyze your content style and get insights for better engagement
          </p>
        </div>

        <div className="grid gap-6">
          {/* Analysis Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Content Analysis
              </CardTitle>
              <CardDescription>
                Analyze your posting patterns and content style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={() => handleAnalyzeStyle('instagram')} 
                  disabled={isAnalyzing}
                  className="gap-2"
                >
                  <Instagram className="h-4 w-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Instagram Style'}
                </Button>
                <Button 
                  onClick={() => handleAnalyzeStyle('tiktok')} 
                  disabled={isAnalyzing}
                  variant="outline"
                  className="gap-2"
                >
                  <Youtube className="h-4 w-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze TikTok Style'}
                </Button>
                <Button 
                  onClick={() => handleAnalyzeStyle()} 
                  disabled={isAnalyzing}
                  variant="outline"
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze All Content'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Style Profile Results */}
          {styleProfile ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Posting Analysis
                  </CardTitle>
                  <CardDescription>
                    Your content creation patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={styleProfile.status === 'placeholder' ? 'secondary' : 'default'}>
                      {styleProfile.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Source</span>
                    <Badge variant="outline">
                      {styleProfile.source || 'manual'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Analyzed</span>
                    <span className="text-sm text-muted-foreground">
                      {styleProfile.analyzed_at ? 
                        new Date(styleProfile.analyzed_at).toLocaleDateString() : 
                        'Not analyzed'}
                    </span>
                  </div>

                  {styleProfile.insights && (
                    <div className="space-y-3 pt-2 border-t">
                      <div>
                        <span className="text-sm font-medium">Posting Frequency</span>
                        <p className="text-sm text-muted-foreground">
                          {styleProfile.insights.posting_frequency}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Content Insights
                  </CardTitle>
                  <CardDescription>
                    Themes and engagement patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {styleProfile.insights ? (
                    <>
                      <div>
                        <span className="text-sm font-medium">Common Themes</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {styleProfile.insights.common_themes?.map((theme: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Engagement Pattern</span>
                        <p className="text-sm text-muted-foreground">
                          {styleProfile.insights.engagement_patterns}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm font-medium">Best Posting Times</span>
                        <div className="flex gap-2 mt-1">
                          {styleProfile.insights.best_posting_times?.map((time: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No insights available yet. Run an analysis to get started.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Style Profile Yet</CardTitle>
                <CardDescription>
                  Run an analysis to discover your content style and get personalized insights
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Click one of the analysis buttons above to get started with understanding your content style.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Coming Soon Features */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Coming soon: More detailed insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Performance Tracking</h4>
                  <p className="text-xs text-muted-foreground">
                    Track engagement metrics across platforms
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Content Optimization</h4>
                  <p className="text-xs text-muted-foreground">
                    AI-powered suggestions for better reach
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Timing Analysis</h4>
                  <p className="text-xs text-muted-foreground">
                    Optimal posting schedule recommendations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Style;
