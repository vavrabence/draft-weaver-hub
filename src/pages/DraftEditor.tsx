
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Wand2, Scissors, Calendar } from 'lucide-react';
import { useDraft, useDrafts } from '@/hooks/useDrafts';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { webhooks } from '@/lib/webhooks';
import MediaPreview from '@/components/MediaPreview';

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

  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isRequestingEdit, setIsRequestingEdit] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

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
        updates: {
          title: formData.title || null,
          caption: formData.caption || null,
          hashtags: formData.hashtags || null,
          target_instagram: formData.target_instagram,
          target_tiktok: formData.target_tiktok,
          desired_publish_at: formData.desired_publish_at || null,
        }
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleGenerateCaption = async () => {
    if (!draft) return;
    
    setIsGeneratingCaption(true);
    try {
      const result = await webhooks.generateCaption(draft.id);
      if (result.ok) {
        toast.success('Caption generation initiated!');
        // Refresh the page to see updated status
        window.location.reload();
      } else {
        toast.error('Failed to generate caption');
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      toast.error('Failed to generate caption');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleRequestEdit = async () => {
    if (!draft) return;
    
    setIsRequestingEdit(true);
    try {
      const result = await webhooks.requestEdit(draft.id, 'silence-cut+captions');
      if (result.ok) {
        toast.success('Edit request submitted!');
        // Refresh the page to see updated status
        window.location.reload();
      } else {
        toast.error('Failed to request edit');
      }
    } catch (error) {
      console.error('Error requesting edit:', error);
      toast.error('Failed to request edit');
    } finally {
      setIsRequestingEdit(false);
    }
  };

  const handleSchedule = async () => {
    if (!draft || (!formData.target_instagram && !formData.target_tiktok) || !formData.desired_publish_at) {
      toast.error('Please select at least one platform and set a publish time');
      return;
    }
    
    setIsScheduling(true);
    try {
      const platforms = [];
      if (formData.target_instagram) platforms.push('instagram');
      if (formData.target_tiktok) platforms.push('tiktok');

      const result = await webhooks.schedulePost(
        draft.id, 
        platforms, 
        formData.desired_publish_at
      );
      
      if (result.ok) {
        toast.success('Post scheduled successfully!');
        // Save current form data first
        await handleSave();
        // Refresh to see updated status
        window.location.reload();
      } else {
        toast.error('Failed to schedule post');
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast.error('Failed to schedule post');
    } finally {
      setIsScheduling(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'editing': return 'default';
      case 'caption_ready': return 'default';
      case 'scheduled': return 'outline';
      case 'posted': return 'default';
      default: return 'secondary';
    }
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
                <MediaPreview 
                  mediaPath={draft.media_path}
                  mediaType={draft.media_type}
                  alt={draft.title || 'Draft'}
                />
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge>{draft.media_type}</Badge>
                <Badge variant={getStatusBadgeVariant(draft.status)}>
                  {draft.status.replace('_', ' ')}
                </Badge>
              </div>

              {draft.media_type === 'video' && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={handleRequestEdit}
                  disabled={isRequestingEdit}
                >
                  <Scissors className="h-4 w-4" />
                  {isRequestingEdit ? 'Requesting...' : 'Request Video Edit'}
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
                    disabled={isGeneratingCaption}
                  >
                    <Wand2 className="h-3 w-3" />
                    {isGeneratingCaption ? 'Generating...' : 'Generate with AI'}
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
                  className="gap-2"
                  onClick={handleSchedule}
                  disabled={isScheduling || (!formData.target_instagram && !formData.target_tiktok) || !formData.desired_publish_at}
                >
                  <Calendar className="h-4 w-4" />
                  {isScheduling ? 'Scheduling...' : 'Schedule'}
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
