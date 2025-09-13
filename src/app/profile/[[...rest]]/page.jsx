"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  GraduationCap,
  Link as LinkIcon,
  Plus,
  School,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  const userTeams = useQuery(
    api.queries.getUserTeams,
    isSignedIn && user ? { user_id: user.id } : "skip",
  );

  if (!isLoaded || userTeams === undefined) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4">
          </div>
          <p className="text-zinc-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full flex items-center justify-center">
          <SignIn afterSignInUrl="/profile" />
        </div>
      </div>
    );
  }

  const copyInviteLink = (inviteCode: string, teamId: string) => {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedTeamId(teamId);
    setTimeout(() => setCopiedTeamId(null), 2000); // Reset after 2 seconds
  };

  const ownedTeams = userTeams?.filter((team) => team?.user_id === user.id) ||
    [];
  const memberTeams = userTeams?.filter((team) => team?.user_id !== user.id) ||
    [];

  return (
    <main className="min-h-screen z-10 pt-18 pb-8 text-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-6xl font-bold mb-2 sm:mb-4">
            Welcome back!
          </h1>
          <p className="text-sm sm:text-base text-zinc-300">
            Manage your teams and registrations
          </p>
        </div>

        {/* Quick Actions */}
        {/* Teams I Lead */}
        {ownedTeams.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
              Teams I Lead
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {ownedTeams.map((team) => (
                <Card
                  key={team._id}
                  className="bg-gray-900/50 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg sm:text-xl text-white truncate">
                        {team.team_name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm shrink-0"
                      >
                        Leader
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300 text-sm">
                      {team.event_choice}
                      {team.specific_event && ` • ${team.specific_event}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 pt-0">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <School className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
                      <span className="text-zinc-300 truncate">
                        {team.college}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
                      <span className="text-zinc-300">
                        Up to {team.members} members
                      </span>
                    </div>

                    {team.student_type && (
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
                        <span className="text-zinc-300">
                          {team.student_type === "UG"
                            ? "Under Graduate"
                            : "Pre University"}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/manage/${team._id}`)}
                        className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Manage
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyInviteLink(team.invite_code, team._id)}
                        className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                      >
                        {copiedTeamId === team._id
                          ? (
                            <>
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Copied!
                            </>
                          )
                          : (
                            <>
                              <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                              Invite
                            </>
                          )}
                      </Button>
                    </div>

                    <div className="text-xs text-zinc-500 bg-gray-900/50 rounded p-2 break-all">
                      <span className="font-mono text-xs">
                        Code: {team.invite_code}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Teams I'm Part Of */}
        {memberTeams.length > 0 && (
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              Teams I'm Part Of
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {memberTeams.map((team) => (
                <Card
                  key={team._id}
                  className="bg-gray-900/50 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg sm:text-xl text-white truncate">
                        {team.team_name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="text-green-400 border-green-400 hover:bg-green-400/10 text-xs sm:text-sm shrink-0"
                      >
                        Member
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300 text-sm">
                      {team.event_choice}
                      {team.specific_event && ` • ${team.specific_event}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 pt-0">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <School className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
                      <span className="text-zinc-300 truncate">
                        {team.college}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
                      <span className="text-zinc-300">
                        Up to {team.members} members
                      </span>
                    </div>

                    {team.student_type && (
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
                        <span className="text-zinc-300">
                          {team.student_type === "UG"
                            ? "Under Graduate"
                            : "Pre University"}
                        </span>
                      </div>
                    )}

                    {team.notes && (
                      <div className="text-xs text-gray-300 bg-gray-900/50 rounded p-2">
                        <strong>Notes:</strong>{" "}
                        <span className="break-words">
                          {team.notes.length > 100
                            ? `${team.notes.slice(0, 100)}...`
                            : team.notes}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* No Teams State */}
        {(!userTeams || userTeams.length === 0) && (
          <div className="text-center py-8 sm:py-12">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-zinc-500 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">
              No teams yet
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 mb-6 max-w-md mx-auto">
              Create your first team or join an existing one to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
              <Button
                onClick={() => router.push("/register")}
                className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base h-10 sm:h-11"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Create Team
              </Button>
              <Button
                onClick={() => {
                  const inviteCode = prompt("Enter invite code:");
                  if (inviteCode?.trim()) {
                    router.push(`/join/${inviteCode.trim()}`);
                  }
                }}
                variant="outline"
                className="text-sm sm:text-base h-10 sm:h-11"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Join Team
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
