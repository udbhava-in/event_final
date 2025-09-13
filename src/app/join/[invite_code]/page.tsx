"use client";
import "./join.css";

import { SignIn, useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  GraduationCap,
  School,
  Trophy,
  Users,
  UserX,
} from "lucide-react";

export default function JoinTeamPage() {
  const { invite_code } = useParams() as { invite_code: string };
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isJoining, setIsJoining] = useState(false);
  const [teamExists, setTeamExists] = useState(true);

  const team = useQuery(api.queries.getTeamByInviteCode, { invite_code });
  const members = useQuery(
    api.queries.getTeamMembers,
    team ? { team_id: team._id } : "skip",
  );
  const addTeamMember = useMutation(api.mutations.addTeamMember);

  useEffect(() => {
    if (team === null) {
      setTeamExists(false);
    }
  }, [team]);

  async function handleJoin() {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to join this team.",
        variant: "destructive",
      });
      return;
    }
    if (!team) return;

    setIsJoining(true);

    try {
      await addTeamMember({
        team_id: team._id,
        user_id: user.id,
        user_name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      });

      toast({
        title: "Join request sent!",
        description:
          "Your request has been sent to the team leader for approval.",
      });

      setTimeout(() => router.push("/profile"), 2000);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to send join request.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  }

  if (!isLoaded || team === undefined) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4">
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Checking invite link...
          </p>
        </div>
      </div>
    );
  }

  if (!teamExists || !team) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">Invalid Invite</h1>
          <p className="text-sm sm:text-base text-gray-400 mb-6">
            This invite link is invalid or has expired.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="text-sm sm:text-base"
            >
              Go Home
            </Button>
            <Button
              onClick={() => router.push("/profile")}
              className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
            >
              My Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const approvedMembers = members?.filter((m) => m.status === "approved") || [];
  const currentUserMember = members?.find((m) => m.user_id === user?.id);
  const isTeamFull = approvedMembers.length >= team.members;

  return (
    <main className="min-h-screen bg-[#0b0f17] pt-12 pb-8 text-white">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
              Join Team
            </h1>
            <p className="text-sm sm:text-base text-zinc-400">
              Review the team details and send a join request
            </p>
          </div>

          <div className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6">
            {/* Team Info Card */}
            <div className="bg-gray-900/50 rounded-lg p-4 sm:p-6 border border-white/5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-blue-400">
                    {team.team_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Team Leader Invite
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-300">
                      Event Category
                    </p>
                    <p className="font-medium text-sm sm:text-base truncate">
                      {team.event_choice}
                    </p>
                  </div>
                </div>

                {team.specific_event && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-300">
                        Specific Event
                      </p>
                      <p className="font-medium text-sm sm:text-base truncate">
                        {team.specific_event}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <School className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-300">College</p>
                    <p className="font-medium text-sm sm:text-base truncate">
                      {team.college}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-300">
                      Team Size
                    </p>
                    <p className="font-medium text-sm sm:text-base">
                      {approvedMembers.length} / {team.members} members
                    </p>
                  </div>
                </div>

                {team.student_type && (
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-300">
                        Student Category
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {team.student_type === "UG"
                          ? "Under Graduate"
                          : "Pre University"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {team.notes && (
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs sm:text-sm text-gray-300 mb-2 font-medium">
                    Additional Notes:
                  </p>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-zinc-300 break-words">
                      {team.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {currentUserMember && (
              <div className="mb-6 p-4 rounded-lg bg-yellow-900/30 border border-yellow-600/30">
                <div className="flex items-center gap-2 mb-2">
                  {currentUserMember.status === "pending"
                    ? (
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    )
                    : (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    )}
                  <span className="text-sm sm:text-base font-medium text-yellow-300">
                    {currentUserMember.status === "pending"
                      ? "Request Pending"
                      : "Already a Member"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-yellow-200">
                  {currentUserMember.status === "pending"
                    ? "Your join request is pending approval from the team leader."
                    : "You are already a member of this team!"}
                </p>
              </div>
            )}

            {isTeamFull && !currentUserMember && (
              <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-600/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                  <span className="text-sm sm:text-base font-medium text-red-300">
                    Team Full
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-red-200">
                  This team has reached its maximum capacity.
                </p>
              </div>
            )}

            {/* Action Section */}
            {!isSignedIn
              ? (
                <div className="text-center">
                  <p className="mb-4 text-sm sm:text-base text-zinc-300">
                    Please sign in to join this team.
                  </p>
                  <div className="max-w-md mx-auto">
                    <SignIn fallbackRedirectUrl={`/join/${invite_code}`} />
                  </div>
                </div>
              )
              : (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  {!currentUserMember && !isTeamFull && (
                    <Button
                      onClick={handleJoin}
                      disabled={isJoining}
                      className="bg-blue-600 hover:bg-blue-700 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base order-1"
                    >
                      {isJoining
                        ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin">
                            </div>
                            Sending Request...
                          </div>
                        )
                        : (
                          "Request to Join Team"
                        )}
                    </Button>
                  )}

                  <Button
                    onClick={() => router.push("/profile")}
                    variant="outline"
                    className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base order-2"
                  >
                    Go to Profile
                  </Button>
                </div>
              )}

            {/* Team Members Preview */}
            {approvedMembers.length > 0 && (
              <div className="mt-6 sm:mt-8 border-t border-white/10 pt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Team Members ({approvedMembers.length})
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {approvedMembers.map((member, index) => (
                    <div
                      key={member.user_id}
                      className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 sm:p-4 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm sm:text-base text-white">
                            Member {index + 1}
                            {member.user_id === team.user_id && (
                              <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                                Leader
                              </span>
                            )}
                          </span>
                          <p className="text-xs text-gray-400">
                            Joined{" "}
                            {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
