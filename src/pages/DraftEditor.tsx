
import { useState } from 'react';
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
import { toast } from 'sonner';

const DraftEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - will be replaced with real queries
  const [draft, setDraft] = useState({
    id: id,
    title: 'Summer Vibes Photo',
    caption: 'Enjoying the beautiful summer weather! ☀️',
    hashtags: '#summer, #vibes, #sunshine, #photography',
    targetInstagram: true,
    targetTiktok: false,
    desiredPublishAt: '',
    language: 'en',
    mediaType: 'image' as 'image' | 'video',
    mediaUrl: '/placeholder.svg',
    status: 'draft'
  });

  const handleSave = () => {
    // TODO: Implement real save to Supabase
    console.log('Saving draft:', draft);
    toast.success('Draft saved successfully!');
  };

  const handleGenerateCaption = () => {
    // TODO: Implement real caption generation
    toast.info('Caption generation coming soon!');
  };

  const handleRequestEdit = () => {
    // TODO: Implement real video editing request
    toast.info('Video editing coming soon!');
  };

  const handleSchedule = () => {
    // TODO: Implement real scheduling
    toast.info('Post scheduling coming soon!');
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
          {/* Media Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Media Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                {draft.mediaType === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <Play className="h-16 w-16 text-white" />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                ) : (
                  <img 
                    src={draft.mediaUrl} 
                    alt={draft.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Badge>{draft.mediaType}</Badge>
                <Badge variant="outline">{draft.status}</Badge>
              </div>

              {draft.mediaType === 'video' && (
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

          {/* Edit Form */}
          <Card>
            <CardHeader>
              <CardTitle>Content Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(e) => setDraft(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a title for this post"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  value={draft.caption}
                  onChange={(e) => setDraft(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Write your post caption..."
                  rows={4}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{draft.caption.length} characters</span>
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
                  value={draft.hashtags}
                  onChange={(e) => setDraft(prev => ({ ...prev, hashtags: e.target.value }))}
                  placeholder="Comma-separated hashtags"
                />
              </div>

              <div className="space-y-3">
                <Label>Target Platforms</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instagram"
                      checked={draft.targetInstagram}
                      onCheckedChange={(checked) => 
                        setDraft(prev => ({ ...prev, targetInstagram: !!checked }))
                      }
                    />
                    <Label htmlFor="instagram">Instagram</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tiktok"
                      checked={draft.targetTiktok}
                      onCheckedChange={(checked) => 
                        setDraft(prev => ({ ...prev, targetTiktok: !!checked }))
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
                  value={draft.desiredPublishAt}
                  onChange={(e) => setDraft(prev => ({ ...prev, desiredPublishAt: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={draft.language} onValueChange={(value) => 
                  setDraft(prev => ({ ...prev, language: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
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
