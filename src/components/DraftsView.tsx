import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, FileEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Draft {
  id: string;
  campaign_data: any;
  created_at: string;
  updated_at: string;
}

interface DraftsViewProps {
  onLoadDraft: (draftData: any, draftId: string) => void;
}

export const DraftsView = ({ onLoadDraft }: DraftsViewProps) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDrafts = async () => {
    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (error: any) {
      console.error('Error fetching drafts:', error);
      toast({
        title: "Error",
        description: "Failed to load drafts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (id: string) => {
    try {
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Draft Deleted",
        description: "Draft removed successfully",
      });

      fetchDrafts();
    } catch (error: any) {
      console.error('Error deleting draft:', error);
      toast({
        title: "Error",
        description: "Failed to delete draft",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileEdit className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-heading font-bold mb-2">No Drafts Yet</h3>
        <p className="text-muted-foreground">
          Your auto-saved campaign drafts will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Saved Drafts</h2>
        <Badge variant="outline">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</Badge>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drafts.map((draft) => {
          const data = draft.campaign_data;
          return (
            <Card key={draft.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div>
                  <h4 className="font-heading font-semibold mb-1">
                    {data.businessDescription?.substring(0, 50) || 'Untitled Draft'}
                    {data.businessDescription?.length > 50 && '...'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Last saved: {new Date(draft.updated_at).toLocaleString()}
                  </p>
                </div>

                {data.budget && (
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      ${data.budget}/day
                    </Badge>
                    {data.targetAudience && (
                      <Badge variant="outline" className="text-xs">
                        Target set
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => onLoadDraft(data, draft.id)}
                    className="flex-1"
                  >
                    <FileEdit className="w-4 h-4 mr-1" />
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteDraft(draft.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
