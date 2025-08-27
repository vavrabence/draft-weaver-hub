
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, TrendingUp, Hash, Clock, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const Style = () => {
  const handleAnalyzeStyle = () => {
    // TODO: Implement real style analysis
    toast.info('Style analysis coming soon!');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Style Profile</h1>
          <p className="text-muted-foreground">
            Analyze your posting patterns to maintain consistent branding
          </p>
        </div>

        <div className="grid gap-6">
          {/* Main Style Profile Card */}
          <Card className="text-center">
            <CardContent className="pt-16 pb-16">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Palette className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Style Profile Not Generated</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Connect your Instagram or TikTok account and analyze your past posts to 
                  create a personalized style profile for consistent content creation.
                </p>
              </div>
              
              <Button 
                onClick={handleAnalyzeStyle}
                disabled
                size="lg"
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analyze Past Posts
              </Button>
              
              <div className="mt-4">
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Feature Preview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tone Analysis
                </CardTitle>
                <CardDescription>
                  Identify your unique voice and writing style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Friendly</span>
                    <span>85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Professional</span>
                    <span>60%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Casual</span>
                    <span>75%</span>
                  </div>
                </div>
                <Badge variant="secondary" className="mt-3">Preview</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Hashtag Patterns
                </CardTitle>
                <CardDescription>
                  Most used hashtags and trending topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {['#photography', '#lifestyle', '#travel', '#nature', '#art'].map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Badge variant="secondary" className="mt-3">Preview</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Posting Schedule
                </CardTitle>
                <CardDescription>
                  Optimal times based on your audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Day</span>
                    <span>Tuesday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Best Time</span>
                    <span>6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <span>3x/week</span>
                  </div>
                </div>
                <Badge variant="secondary" className="mt-3">Preview</Badge>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How Style Analysis Works</CardTitle>
              <CardDescription>
                Here's what happens when you run the analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Fetch Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze your recent Instagram and TikTok posts, captions, and engagement
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Use AI to identify patterns in tone, topics, hashtags, and posting times
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Generate Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a style guide for consistent future content creation
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
