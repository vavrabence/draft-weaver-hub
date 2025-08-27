
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, ExternalLink, Instagram, Youtube } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/useSettings';
import { useState, useEffect } from 'react';

const Settings = () => {
  const { settings, integrations, isLoading, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    low_content_alert: true,
    low_content_threshold: 3
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        low_content_alert: settings.low_content_alert,
        low_content_threshold: settings.low_content_threshold
      });
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Mock webhook URLs - will be generated based on actual deployment
  const webhookUrls = {
    generateCaption: 'https://your-app.com/api/hooks/generate-caption',
    requestEdit: 'https://your-app.com/api/hooks/request-edit', 
    schedulePost: 'https://your-app.com/api/hooks/schedule-post',
    markPosted: 'https://your-app.com/api/hooks/mark-posted',
    analyzeStyle: 'https://your-app.com/api/hooks/analyze-style'
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure integrations and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Platform Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Integrations</CardTitle>
              <CardDescription>
                Connect your social media accounts for automated posting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instagram */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Instagram</h3>
                    <p className="text-sm text-muted-foreground">
                      Meta Business API for content publishing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={integrations?.instagram_connected ? 'default' : 'secondary'}>
                    {integrations?.instagram_connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                  <Button disabled variant="outline">
                    Connect
                  </Button>
                </div>
              </div>

              <Separator />

              {/* TikTok */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black rounded-lg">
                    <Youtube className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">TikTok</h3>
                    <p className="text-sm text-muted-foreground">
                      TikTok for Business API for video publishing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={integrations?.tiktok_connected ? 'default' : 'secondary'}>
                    {integrations?.tiktok_connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                  <Button disabled variant="outline">
                    Connect
                  </Button>
                </div>
              </div>

              {!integrations?.instagram_connected && !integrations?.tiktok_connected && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Coming Soon:</strong> Platform integrations will be enabled once you set up 
                    the required OAuth credentials and API keys. Scopes needed:
                  </p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• Instagram: Content Publishing, Business Discovery, Insights</li>
                    <li>• TikTok: Video Upload, Content Management, Analytics</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Services */}
          <Card>
            <CardHeader>
              <CardTitle>API Services</CardTitle>
              <CardDescription>
                Configure external services for content automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <Input 
                    type="password" 
                    placeholder="sk-..." 
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    For AI caption generation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Video Editing Service</Label>
                  <Input 
                    placeholder="Wisecut API Key" 
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    For automated video editing
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Coming Soon:</strong> API integrations will be enabled in future updates.
                  These services will power automated caption generation and video editing features.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure alerts and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="low-content-alert">Low Content Alert</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you're running low on scheduled content
                  </p>
                </div>
                <Switch
                  id="low-content-alert"
                  checked={formData.low_content_alert}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, low_content_alert: checked }))
                  }
                />
              </div>

              {formData.low_content_alert && (
                <div className="space-y-2">
                  <Label htmlFor="threshold">Alert Threshold</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="threshold"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.low_content_threshold}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, low_content_threshold: parseInt(e.target.value) }))
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">
                      unscheduled drafts remaining
                    </span>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveSettings} className="w-full">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook URLs</CardTitle>
              <CardDescription>
                Use these URLs to connect with automation tools like Make.com, Zapier, or n8n
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(webhookUrls).map(([name, url]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <Label className="text-sm font-medium capitalize">
                      {name.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Label>
                    <Input 
                      value={url} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(url)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Automation Setup</p>
                    <p className="text-xs text-muted-foreground">
                      Copy these webhook URLs and use them in your automation workflows. 
                      They'll handle caption generation, video editing, and post scheduling once configured.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
