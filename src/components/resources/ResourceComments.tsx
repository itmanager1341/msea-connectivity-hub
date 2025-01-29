import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
}

interface ResourceCommentsProps {
  resourceId: string;
}

export const ResourceComments = ({ resourceId }: ResourceCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
    subscribeToComments();
  }, [resourceId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("resource_comments")
      .select("*")
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return;
    }

    setComments(data);
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "resource_comments",
          filter: `resource_id=eq.${resourceId}`,
        },
        (payload) => {
          console.log("Change received!", payload);
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.from("resource_comments").insert({
      resource_id: resourceId,
      content: newComment.trim(),
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setNewComment("");
    toast({
      title: "Success",
      description: "Comment posted successfully",
    });
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from("resource_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Comment deleted successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MessageSquare className="h-4 w-4" />
        <span>Comments</span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !newComment.trim()}
            className="w-full"
          >
            Post Comment
          </Button>
        </div>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg border p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                    {comment.user_id.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                {comment.user_id === supabase.auth.getUser()?.data?.user?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(comment.id)}
                    className="h-6 w-6"
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};