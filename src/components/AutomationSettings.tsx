
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Webhook, Link, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_BASE_URL = import.meta.env.VITE_WEB_APP_BASE_URL || 'http://localhost:8080';
const N8N_WEBHOOK_BASE = import.meta.env.VITE_N8N_WEBHOOK_BASE || 'https://your-n8n-instance.com/webhook';

export const AutomationSettings = () => {
  const callbackUrl = `${API_BASE_URL}/functions/v1/mark-posted`;
  
  const webhookEndpoints = [
    {
      name: 'Generate Caption',
      url: `${N8N_WEBHOOK_BASE}/generate-caption`,
      description: 'Generates captions using AI'
    },
    {
      name: 'Request Edit',
      url: `${N8N_WEBHOOK_BASE}/request-edit`,
      description: 'Processes video editing requests'
    },
    {
      name: 'Schedule Post',
      url: `${N8N_WEBHOOK_BASE}/schedule-post`,
      description: 'Handles post scheduling'
    },
    {
      name: 'Analyze Style',
      url: `${N8N_WEBHOOK_BASE}/analyze-style`,
      description: 'Analyzes content style patterns'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation (n8n - Coming Soon)
          </CardTitle>
          <CardDescription>
            Advanced automation workflows using n8n (currently in preparation)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              N8N integration is in development. The app currently uses local processing for all features.
              These settings show the planned automation endpoints.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                App Callback URL (for n8n to call back)
              </Label>
              <Input
                value={callbackUrl}
                readOnly
                className="bg-muted mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                n8n workflows will call this URL to report completion status
              </p>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                Planned n8n Webhook Endpoints
              </Label>
              
              {webhookEndpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{endpoint.name}</span>
                    <Badge variant="outline" className="text-xs">
                      Not Active
                    </Badge>
                  </div>
                  <Input
                    value={endpoint.url}
                    readOnly
                    className="bg-muted text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    {endpoint.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">HMAC Authentication</h4>
              <p className="text-xs text-muted-foreground mb-2">
                All webhook requests will include HMAC signature verification:
              </p>
              <code className="text-xs bg-background px-2 py-1 rounded">
                x-n8n-signature = HMAC_SHA256(rawBody, N8N_WEBHOOK_SECRET)
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                This ensures secure communication between n8n and the app.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
