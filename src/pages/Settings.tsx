
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, User, Bell, Palette, Zap, Database } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { AutomationSettings } from '@/components/AutomationSettings';
import { useState } from 'react';
import { toast } from 'sonner';

const Settings = () => {
  const { settings, integrations, isLoading, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    low_content_alert: settings?.low_content_alert ?? true,
    low_content_threshold: settings?.low_content_threshold ?? 3,
  });

  const handleSaveSettings = async () => {
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and integrations
          </p>
        </div>

        <div className="grid gap-6">
          {/* Content Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Content Management
              </CardTitle>
              <CardDescription>
                Configure how content is handled and processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Content Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you're running low on drafts
                  </p>
                </div>
                <Switch
                  checked={formData.low_content_alert}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, low_content_alert: checked }))
                  }
                />
              </div>
              
              {formData.low_content_alert && (
                <div className="space-y-2">
                  <Label htmlFor="threshold">Alert Threshold</Label>
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.low_content_threshold}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, low_content_threshold: parseInt(e.target.value) }))
                    }
                    className="max-w-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Alert when you have fewer than this many drafts
                  </p>
                </div>
              )}
              
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Integrations Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Integrations
              </CardTitle>
              <CardDescription>
                Current status of connected services and APIs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Instagram</span>
                    <p className="text-xs text-muted-foreground">Social media platform</p>
                  </div>
                  <Badge variant={integrations?.instagram_connected ? 'default' : 'secondary'}>
                    {integrations?.instagram_connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">TikTok</span>
                    <p className="text-xs text-muted-foreground">Social media platform</p>
                  </div>
                  <Badge variant={integrations?.tiktok_connected ? 'default' : 'secondary'}>
                    {integrations?.tiktok_connected ? 'Connected' : 'Not Connected'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">OpenAI</span>
                    <p className="text-xs text-muted-foreground">AI caption generation</p>
                  </div>
                  <Badge variant={integrations?.openai_configured ? 'default' : 'secondary'}>
                    {integrations?.openai_configured ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Video Editing</span>
                    <p className="text-xs text-muted-foreground">{integrations?.video_edit_provider || 'Local simulation'}</p>
                  </div>
                  <Badge variant="outline">
                    {integrations?.video_edit_provider || 'Local'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Automation Settings */}
          <AutomationSettings />
        </div>
      </div>
    </div>
  );
};

export default Settings;
