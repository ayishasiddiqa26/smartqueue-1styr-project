import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePrintQueue } from '@/hooks/usePrintQueue';

interface AdminCommentDialogProps {
  jobId: string;
  studentEmail: string;
}

const AdminCommentDialog: React.FC<AdminCommentDialogProps> = ({ jobId, studentEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [requiresAction, setRequiresAction] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addAdminComment } = usePrintQueue();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "Empty Comment",
        description: "Please enter a comment before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addAdminComment(jobId, comment.trim(), requiresAction);
      
      toast({
        title: "Comment Added",
        description: requiresAction 
          ? "Comment sent to student with action required flag"
          : "Comment sent to student",
      });

      setComment('');
      setRequiresAction(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          Comment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogDescription>
            Send a message to the student ({studentEmail})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="comment">Message</Label>
            <Textarea
              id="comment"
              placeholder="Enter your message to the student..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 characters
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="requires-action"
              checked={requiresAction}
              onCheckedChange={(checked) => setRequiresAction(checked as boolean)}
            />
            <Label htmlFor="requires-action" className="text-sm">
              Requires student action (will highlight the message)
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !comment.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary-foreground border-t-transparent mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-3 w-3 mr-2" />
                  Send Comment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCommentDialog;