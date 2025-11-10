"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Share2,
  Copy,
  Mail,
  MessageSquare,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Check,
} from "lucide-react";
import type { Post } from "@/lib/types";

interface ShareDialogProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export function ShareDialog({ post, isOpen, onClose, onShare }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const postUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/post/${post.id}`
    : "";
  const postText = post.text || "Check out this post!";
  const shareTitle = `Post by ${post.author.display_name || post.author.username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Post link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: postText,
          url: postUrl,
        });
        onShare?.();
        onClose();
      } catch (error: any) {
        // User cancelled or error occurred
        if (error.name !== "AbortError") {
          toast({
            title: "Share failed",
            description: "Unable to share. Please try another method.",
            variant: "destructive",
          });
        }
      }
    } else {
      // Fallback to copy if native share is not available
      handleCopyLink();
    }
  };

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedText = encodeURIComponent(`${postText} - ${shareTitle}`);
    
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    onShare?.();
    onClose();
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this post: ${shareTitle}`);
    const body = encodeURIComponent(`${postText}\n\n${postUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onShare?.();
    onClose();
  };

  const shareOptions = [
    {
      label: "Native Share",
      icon: Share2,
      onClick: handleNativeShare,
      description: "Share using your device's share menu",
      show: typeof navigator !== "undefined" && !!navigator.share,
    },
    {
      label: "Copy Link",
      icon: copied ? Check : Copy,
      onClick: handleCopyLink,
      description: "Copy post link to clipboard",
      show: true,
    },
    {
      label: "Twitter",
      icon: Twitter,
      onClick: () => handleSocialShare("twitter"),
      description: "Share on Twitter",
      show: true,
    },
    {
      label: "Facebook",
      icon: Facebook,
      onClick: () => handleSocialShare("facebook"),
      description: "Share on Facebook",
      show: true,
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      onClick: () => handleSocialShare("linkedin"),
      description: "Share on LinkedIn",
      show: true,
    },
    {
      label: "Email",
      icon: Mail,
      onClick: handleEmailShare,
      description: "Share via email",
      show: true,
    },
  ].filter(option => option.show);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>
            Share this post with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Link Preview */}
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
            <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={postUrl}
              readOnly
              className="flex-1 bg-background"
              onClick={handleCopyLink}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.label}
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-accent"
                  onClick={option.onClick}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
