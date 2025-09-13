"use client";
import "./manage.css";
import { SignIn, useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  Crown,
  GraduationCap,
  Hash,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function ManageTeamPage() {
  const { teamId } = useParams() as { teamId: string };
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const team = useQuery(api.queries.getTeamById, {
    team_id: teamId as Id<"registrations">,
  });
  const members = useQuery(api.queries.getTeamMembers, {
    team_id: teamId as Id<"registrations">,
  });

  const approveTeamMember = useMutation(api.mutations.approveTeamMember);
  const removeTeamMember = useMutation(api.mutations.removeTeamMember);

  // Loading state - show when user/auth is loading OR when team/members data is loading
  if (!isLoaded || team === undefined || members === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f17] via-[#1a1f2e] to-[#0b0f17] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto">
          </div>
          <p className="text-zinc-300">Loading your team...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f17] via-[#1a1f2e] to-[#0b0f17] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-zinc-300">Please sign in to manage your team</p>
          </div>
          <SignIn fallbackRedirectUrl={`/manage/${teamId}`} />
        </div>
      </div>
    );
  }

  // Now check if team exists (after loading is complete)
  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f17] via-[#1a1f2e] to-[#0b0f17] text-white flex items-center justify-center px-4">
        <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">
              Team Not Found
            </h2>
            <p className="text-zinc-300 mb-6">
              The team you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => router.push("/profile")}
              variant="outline"
              className="border-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check authorization after we know team exists
  if (team.user_id !== user?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f17] via-[#1a1f2e] to-[#0b0f17] text-white flex items-center justify-center px-4">
        <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">
              Access Denied
            </h2>
            <p className="text-zinc-300 mb-6">
              Only the team leader can manage this team.
            </p>
            <Button
              onClick={() => router.push("/profile")}
              variant="outline"
              className="border-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function approve(memberUserId: string) {
    try {
      await approveTeamMember({
        team_id: teamId as Id<"registrations">,
        member_user_id: memberUserId,
        leader_user_id: user!.id,
      });

      toast({
        title: "✅ Member approved",
        description: "Team member has been approved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to approve member",
        variant: "destructive",
      });
    }
  }

  async function removeMember(memberUserId: string) {
    try {
      await removeTeamMember({
        team_id: teamId as Id<"registrations">,
        member_user_id: memberUserId,
        leader_user_id: user!.id,
      });

      toast({
        title: "✅ Member removed",
        description: "Team member has been removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    }
  }

  const pendingMembers = members?.filter((m) => m.status === "pending") || [];
  const approvedMembers = members?.filter((m) => m.status === "approved") || [];

  const getEventIcon = (eventChoice: string) => {
    switch (eventChoice) {
      case "Tech":
        return "💻";
      case "Non Tech":
        return "🎯";
      case "Gaming":
        return "🎮";
      default:
        return "🏆";
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join/${team.invite_code}`;
    navigator.clipboard.writeText(inviteUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <div className="min-h-screen bg-transparent pt-20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                {team.team_name}
              </h1>
              <div className="flex items-center gap-2 text-sm sm:text-base text-zinc-300">
                <Crown className="h-4 w-4 text-yellow-400" />
                <span>Team Leader Dashboard</span>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-blue-400/50 text-blue-300 w-fit"
            >
              <Hash className="h-3 w-3 mr-1" />
              {team.invite_code}
            </Badge>
          </div>

          {/* Team Info Card */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Team Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="text-lg">
                      {getEventIcon(team.event_choice)}
                    </span>
                    Event Category
                  </div>
                  <p className="text-white font-medium">{team.event_choice}</p>
                </div>

                {team.specific_event && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Trophy className="h-4 w-4" />
                      Specific Event
                    </div>
                    <p className="text-white font-medium">
                      {team.specific_event}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <GraduationCap className="h-4 w-4" />
                    College
                  </div>
                  <p
                    className="text-white font-medium truncate"
                    title={team.college}
                  >
                    {team.college}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Users className="h-4 w-4" />
                    Team Size
                  </div>
                  <p className="text-white font-medium">
                    {approvedMembers.length} / {team.members}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        <Card className="bg-white/5 border-white/20 backdrop-blur-sm mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Pending Requests
                <Badge variant="secondary" className="ml-2">
                  {pendingMembers.length}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingMembers.length === 0
              ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400 text-lg">No pending requests</p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Share your invite code to get team members!
                  </p>
                </div>
              )
              : (
                <div className="space-y-3 sm:space-y-4">
                  {pendingMembers.map((member) => (
                    <div
                      key={member.user_id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {(member.user_name || member.user_id).charAt(0)
                                .toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <p
                                className="text-white font-medium text-sm sm:text-base truncate max-w-[200px] sm:max-w-[300px]"
                                title={member.user_name || member.user_id}
                              >
                                {member.user_name || member.user_id}
                              </p>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                                <Calendar className="h-3 w-3 flex-shrink-0" />
                                <span>
                                  Requested: {new Date(member.joined_at)
                                    .toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            onClick={() => approve(member.user_id)}
                            className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => removeMember(member.user_id)}
                            variant="destructive"
                            size="sm"
                            className="flex-1 sm:flex-none"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="bg-white/5 border-white/20 backdrop-blur-sm mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-400" />
              Team Members
              <Badge variant="secondary" className="ml-2">
                {approvedMembers.length}/{team.members}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {approvedMembers.length === 0
              ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400 text-lg">No team members yet</p>
                  <p className="text-zinc-500 text-sm mt-1">
                    Start by approving pending requests or sharing your invite
                    code
                  </p>
                </div>
              )
              : (
                <div className="space-y-3 sm:space-y-4">
                  {approvedMembers.map((member) => (
                    <div
                      key={member.user_id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                              {member.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium text-sm sm:text-base">
                                {member.user_name}
                              </p>
                              {member.user_id === team.user_id && (
                                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Leader
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                            <Calendar className="h-3 w-3" />
                            Joined:{" "}
                            {new Date(member.joined_at).toLocaleDateString()}
                          </div>
                        </div>
                        {member.user_id !== team.user_id && (
                          <Button
                            onClick={() => removeMember(member.user_id)}
                            variant="destructive"
                            size="sm"
                            className="w-full sm:w-auto"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            onClick={() => router.push("/profile")}
            variant="outline"
            className="border-white/20 hover:bg-white/10 order-2 sm:order-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <Button
            onClick={copyInviteLink}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 sm:flex-none order-1 sm:order-2"
          >
            {isCopied
              ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              )
              : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invite Link
                </>
              )}
          </Button>
        </div>
      </div>
    </div>
  );
}
