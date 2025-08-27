
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileImage, FileVideo, Edit, Wand2, Scissors, Calendar, Trash2, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrafts } from '@/hooks/useDrafts';
import MediaPreview from '@/components/MediaPreview';

const Drafts = () => {
  const navigate = useNavigate();
  const { drafts, isLoading, deleteDraft } = useDrafts();
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading drafts...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'editing': return 'default';
      case 'caption_ready': return 'default';
      case 'scheduled': return 'outline';
      case 'posted': return 'default';
      default: return 'secondary';
    }
  };

  const toggleDraftSelection = (draftId: string) => {
    setSelectedDrafts(prev => 
      prev.includes(draftId) 
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedDrafts.map(id => deleteDraft(id)));
      setSelectedDrafts([]);
    } catch (error) {
      console.error('Error deleting drafts:', error);
    }
  };

  const filteredDrafts = drafts?.filter(draft => {
    const matchesStatus = statusFilter === 'all' || draft.status === statusFilter;
    const matchesSearch = draft.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Draft Posts</h1>
          <p className="text-muted-foreground">
            Manage and edit your content drafts
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search drafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="editing">Editing</SelectItem>
                  <SelectItem value="caption_ready">Caption Ready</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedDrafts.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedDrafts.length} drafts selected
                  </p>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="gap-2"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredDrafts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileImage className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No drafts found</h3>
              <p className="text-muted-foreground mb-4">
                {drafts?.length === 0 
                  ? "Upload some content to get started" 
                  : "Try adjusting your search or filters"}
              </p>
              <Button onClick={() => navigate('/upload')}>
                Upload Content
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDrafts.map((draft) => (
              <Card key={draft.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="w-full h-48">
                    <MediaPreview 
                      mediaPath={draft.media_path}
                      mediaType={draft.media_type}
                      alt={draft.title || 'Draft'}
                    />
                  </div>
                  <div className="absolute top-3 left-3">
                    {draft.media_type === 'image' ? (
                      <FileImage className="h-6 w-6 text-white bg-black/50 rounded p-1" />
                    ) : (
                      <FileVideo className="h-6 w-6 text-white bg-black/50 rounded p-1" />
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <Checkbox
                      checked={selectedDrafts.includes(draft.id)}
                      onCheckedChange={() => toggleDraftSelection(draft.id)}
                      className="bg-white"
                    />
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold truncate">{draft.title || 'Untitled Draft'}</h3>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(draft.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={getStatusColor(draft.status)}>
                      {draft.status.replace('_', ' ')}
                    </Badge>
                    {draft.target_instagram && <Badge variant="outline">IG</Badge>}
                    {draft.target_tiktok && <Badge variant="outline">TT</Badge>}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 gap-2"
                      onClick={() => navigate(`/drafts/${draft.id}`)}
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled
                      title="Coming soon - Generate captions with AI"
                    >
                      <Wand2 className="h-3 w-3" />
                    </Button>
                    
                    {draft.media_type === 'video' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        disabled
                        title="Coming soon - Auto-edit video"
                      >
                        <Scissors className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled
                      title="Coming soon - Schedule post"
                    >
                      <Calendar className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Drafts;
