"use client";
import RegisterForm from "@/components/register-form";
import SectionReveal from "@/components/section-reveal";
import { SignIn, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Check if user already has teams
  const userTeams = useQuery(
    api.queries.getUserTeams,
    isSignedIn && user ? { user_id: user.id } : "skip",
  );

  // Redirect if user already has registered teams
  useEffect(() => {
    if (isLoaded && isSignedIn && userTeams && userTeams.length > 0) {
      router.replace("/profile");
    }
  }, [isLoaded, isSignedIn, userTeams, router]);

  // Show loading state while checking authentication and teams
  if (!isLoaded || (isSignedIn && userTeams === undefined)) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4">
          </div>
          <p className="text-zinc-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign-in if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen  text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full flex items-center justify-center">
          <SignIn fallbackRedirectUrl="/register" />
        </div>
      </div>
    );
  }

  if (userTeams && userTeams.length > 0) {
    return (
      <div className="min-h-screen bg-[#0b0f17] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Already Registered</h1>
          <p className="text-zinc-300 mb-4">
            You already have registered teams.
          </p>
          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-transparent pt-12 pb-8 text-white">
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <SectionReveal>
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-3 sm:mb-4">
              Team Registration
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto">
              Sign in to register your team for our event. Choose from Tech,
              Non-Tech, or Gaming categories.
            </p>
          </div>

          <div className="max-w-8xl mx-auto">
            <div className="bg-white/5 border border-white/20 rounded-xl p-4 sm:p-6 mb-8">
              <RegisterForm />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-white/5">
                <h3 className="font-semibold text-blue-400 mb-2 text-sm sm:text-base">
                  Tech Events
                </h3>
                <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
                  <li>• Hackathon (UG only)</li>
                  <li>• Code Sprint</li>
                  <li>• Web Odyssey (UG only)</li>
                </ul>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-white/5">
                <h3 className="font-semibold text-green-400 mb-2 text-sm sm:text-base">
                  Non-Tech Events
                </h3>
                <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
                  <li>• Quiz</li>
                  <li>• Treasure Hunt</li>
                  <li>• Debate</li>
                  <li>• Poster Making</li>
                  <li>• Prompting</li>
                </ul>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-white/5 sm:col-span-2 lg:col-span-1">
                <h3 className="font-semibold text-purple-400 mb-2 text-sm sm:text-base">
                  Gaming Events
                </h3>
                <ul className="text-xs sm:text-sm text-gray-300 space-y-1">
                  <li>• BGMI</li>
                  <li>• Valorant</li>
                </ul>
              </div>
            </div>

            <p className="mt-6 text-xs text-zinc-500 text-center px-4">
              Note: College ID card photo is required for verification. Gaming
              events require platform IDs in the notes section. UG students can
              access all events, PU students cannot register for Hackathon and
              Web Odyssey.
            </p>
          </div>
        </SectionReveal>
      </section>
    </main>
  );
}
