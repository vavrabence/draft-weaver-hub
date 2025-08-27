
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Wand2, Scissors, Calendar, Play } from 'lucide-react';
import { useDraft, useDrafts } from '@/hooks/useDrafts';
import { useState, useEffect } from 'react';

const DraftEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: draft, isLoading } = useDraft(id!);
  const { updateDraft } = useDrafts();

  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    hashtags: '',
    target_instagram: true,
    target_tiktok: false,
    desired_publish_at: '',
  });

  useEffect(() => {
    if (draft) {
      setFormData({
        title: draft.title || '',
        caption: draft.caption || '',
        hashtags: draft.hashtags || '',
        target_instagram: draft.target_instagram,
        target_tiktok: draft.target_tiktok,
        desired_publish_at: draft.desired_publish_at ? 
          new Date(draft.desired_publish_at).toISOString().slice(0, 16) : '',
      });
    }
  }, [draft]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading draft...</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Draft not found</h2>
          <p className="text-muted-foreground mb-4">The draft you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/drafts')}>
            Back to Drafts
          </Button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateDraft({
        id: draft.id,
        title: formData.title || null,
        caption: formData.caption || null,
        hashtags: formData.hashtags || null,
        target_instagram: formData.target_instagram,
        target_tiktok: formData.target_tiktok,
        desired_publish_at: formData.desired_publish_at || null,
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleGenerateCaption = () => {
    // TODO: Implement real caption generation
    console.log('Generate caption for draft:', draft.id);
  };

  const handleRequestEdit = () => {
    // TODO: Implement real video editing request
    console.log('Request edit for draft:', draft.id);
  };

  const handleSchedule = () => {
    // TODO: Implement real scheduling
    console.log('Schedule draft:', draft.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/drafts')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Drafts
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Draft</h1>
            <p className="text-muted-foreground">
              Customize your content before publishing
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Media Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                {draft.media_type === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <Play className="h-16 w-16 text-white" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                ) : (
                  <img 
                    src="/placeholder.svg"
                    alt={draft.title || 'Draft'}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge>{draft.media_type}</Badge>
                <Badge variant="outline">{draft.status}</Badge>
              </div>

              {draft.media_type === 'video' && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleRequestEdit}
                  disabled
                >
                  <Scissors className="h-4 w-4" />
                  Request Video Edit
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a title for this post"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={formData.caption}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Write your post caption..."
                  rows={4}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formData.caption.length} characters</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="gap-2"
                    onClick={handleGenerateCaption}
                    disabled
                  >
                    <Wand2 className="h-3 w-3" />
                    Generate with AI
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input
                  id="hashtags"
                  value={formData.hashtags}
                  onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                  placeholder="Comma-separated hashtags"
                />
              </div>

              <div className="space-y-3">
                <Label>Target Platforms</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instagram"
                      checked={formData.target_instagram}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, target_instagram: !!checked }))
                      }
                    />
                    <Label htmlFor="instagram">Instagram</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tiktok"
                      checked={formData.target_tiktok}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, target_tiktok: !!checked }))
                      }
                    />
                    <Label htmlFor="tiktok">TikTok</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="publish-time">Desired Publish Time (Optional)</Label>
                <Input
                  id="publish-time"
                  type="datetime-local"
                  value={formData.desired_publish_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, desired_publish_at: e.target.value }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSchedule}
                  disabled
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DraftEditor;
