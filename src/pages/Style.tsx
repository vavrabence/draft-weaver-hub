
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Palette, Instagram, Youtube, BarChart3, TrendingUp, Clock, Hash, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StyleProfile, isStyleProfile } from '@/types/style';

const Style = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [samples, setSamples] = useState('');
  const [isBuildingProfile, setIsBuildingProfile] = useState(false);

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

  const buildStyleProfile = useMutation({
    mutationFn: async (samples: string) => {
      const { data, error } = await supabase.functions.invoke('style-build', {
        body: { samples }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Style profile built successfully!');
      setSamples('');
    },
    onError: (error) => {
      console.error('Error building style profile:', error);
      toast.error('Failed to build style profile');
    }
  });

  const handleBuildProfile = async () => {
    if (!samples.trim() || samples.trim().length < 50) {
      toast.error('Please provide at least 50 characters of sample content');
      return;
    }

    setIsBuildingProfile(true);
    try {
      await buildStyleProfile.mutateAsync(samples);
    } finally {
      setIsBuildingProfile(false);
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

  // Type guard and extract style profile
  const styleProfile: StyleProfile | null = profile?.style_profile && isStyleProfile(profile.style_profile) 
    ? profile.style_profile 
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Style Profile Builder</h1>
          <p className="text-muted-foreground">
            Build your unique content style profile using AI analysis of your past posts
          </p>
        </div>

        <div className="grid gap-6">
          {/* Style Profile Builder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Build Your Style Profile
              </CardTitle>
              <CardDescription>
                Paste 10-30 of your past captions or posts to generate a personalized style profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="samples">Past Captions/Posts</Label>
                <Textarea
                  id="samples"
                  placeholder="Paste your previous social media posts here, one per line or separated by blank lines..."
                  value={samples}
                  onChange={(e) => setSamples(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{samples.length} characters</span>
                  <span>Minimum 50 characters recommended</span>
                </div>
              </div>
              
              <Button 
                onClick={handleBuildProfile}
                disabled={isBuildingProfile || samples.trim().length < 50}
                className="gap-2"
              >
                <Palette className="h-4 w-4" />
                {isBuildingProfile ? 'Building Profile...' : 'Generate Style Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Style Profile Results */}
          {styleProfile ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Style Analysis
                  </CardTitle>
                  <CardDescription>
                    Your content creation patterns and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium">Tone</span>
                      <p className="text-sm text-muted-foreground capitalize">
                        {styleProfile.tone || 'Not analyzed'}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Sentence Length</span>
                      <p className="text-sm text-muted-foreground capitalize">
                        {styleProfile.sentence_length || 'Not analyzed'}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Emoji Usage</span>
                      <p className="text-sm text-muted-foreground capitalize">
                        {styleProfile.emoji_usage || 'Not analyzed'}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Language Style</span>
                      <p className="text-sm text-muted-foreground capitalize">
                        {styleProfile.language_mix || 'Not analyzed'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <div>
                      <span className="text-sm font-medium">Hashtag Strategy</span>
                      <Badge variant="outline" className="ml-2">
                        {styleProfile.hashtag_strategy || 'Not defined'}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Last Updated</span>
                      <p className="text-sm text-muted-foreground">
                        {styleProfile.analyzed_at ? 
                          new Date(styleProfile.analyzed_at).toLocaleDateString() : 
                          'Not analyzed'}
                      </p>
                    </div>

                    {styleProfile.sample_count && (
                      <div>
                        <span className="text-sm font-medium">Samples Analyzed</span>
                        <p className="text-sm text-muted-foreground">
                          {styleProfile.sample_count} posts
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Content Guidelines
                  </CardTitle>
                  <CardDescription>
                    Patterns and recommendations based on your style
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {styleProfile.structure && Array.isArray(styleProfile.structure) && (
                    <div>
                      <span className="text-sm font-medium">Content Structure</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {styleProfile.structure.map((item: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {styleProfile.cta_patterns && Array.isArray(styleProfile.cta_patterns) && (
                    <div>
                      <span className="text-sm font-medium">Call-to-Action Patterns</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {styleProfile.cta_patterns.map((cta: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {cta}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {styleProfile.do_nots && Array.isArray(styleProfile.do_nots) && (
                    <div>
                      <span className="text-sm font-medium">Style Guidelines</span>
                      <div className="space-y-1 mt-1">
                        {styleProfile.do_nots.map((dont: string, index: number) => (
                          <p key={index} className="text-xs text-muted-foreground">
                            • {dont}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <Badge variant={styleProfile.status === 'analyzed' ? 'default' : 'secondary'}>
                      {styleProfile.status}
                    </Badge>
                    <span className="ml-2 text-xs text-muted-foreground">
                      Source: {styleProfile.source || 'manual'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Style Profile Yet</CardTitle>
                <CardDescription>
                  Create your first style profile by pasting sample content above
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  A style profile helps generate captions that match your unique voice and tone.
                </p>
                <p className="text-sm text-muted-foreground">
                  Paste 10-30 of your past posts above and click "Generate Style Profile" to get started.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Raw Profile Data (for debugging) */}
          {styleProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Data</CardTitle>
                <CardDescription>
                  Raw style profile data (for reference)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
                  {JSON.stringify(styleProfile, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Style;
