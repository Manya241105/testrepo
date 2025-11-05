import { AppShell } from "@/components/app-shell";
import { createServerClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import type { Post } from "@/lib/types";
import { PostCard } from "@/components/feed/post-card";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function UserPostsPage({ params }: { params: { username: string } }) {
  const supabase = createServerClient();
  const { username } = params;

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  const { data: privacySetting } = await supabase
    .from("privacy_settings")
    .select("profile_visibility")
    .eq("user_id", profile.id)
    .single();

  const isPrivate = privacySetting?.profile_visibility === "private";
  const isOwner = currentUser?.id === profile.id;
  let isFollowing = false;

  if (currentUser && !isOwner) {
    const { data: follow } = await supabase
      .from("follows")
      .select("status")
      .eq("follower_id", currentUser.id)
      .eq("following_id", profile.id)
      .eq("status", "accepted")
      .single();
    isFollowing = !!follow;
  }

  const canViewPosts = !isPrivate || isOwner || isFollowing;
  if (!canViewPosts) {
    redirect(`/profile/${username}`);
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post as unknown as Post} />
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <h3 className="text-xl font-semibold">No posts yet</h3>
            <p>Posts from this user will appear here.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}


