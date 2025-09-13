"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  FileText,
  GraduationCap,
  Info,
  Lock,
  MapPin,
  Sparkles,
  Trophy,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";

type EventChoice = "Tech" | "Non Tech" | "Gaming";
type StudentType = "UG" | "PU";

type Registration = {
  teamName: string;
  college: string;
  eventChoice: EventChoice;
  specificEvent?: string;
  transactionId: string;
  studentType: StudentType;
};

const eventSpecificOptions = {
  "Tech": ["Hackathon", "Code Sprint", "Web odyssey"],
  "Non Tech": ["Quiz", "Treasure Hunt", "Debate", "Poster Making", "prompting"],
  "Gaming": ["BGMI", "Valorant"],
};

// Events restricted for PU students
const ugOnlyEvents = ["Hackathon", "Web odyssey", "BGMI", "Valorant"];

// Dynamic team size based on event
const getTeamSize = (event: string): number => {
  switch (event) {
    case "Valorant":
    case "Hackathon":
      return 5; // User + 4 invites
    case "BGMI":
      return 4; // User + 3 invites
    default:
      return 2; // User + 1 invite
  }
};

const eventPrices: { [key: string]: number } = {
  "Hackathon": 500,
  "Valorant": 500,
  "BGMI": 400,
};

const getEventPrice = (event: string): number => {
  return eventPrices[event] || 100;
};

const eventColors = {
  "Tech": "from-purple-500 to-pink-500",
  "Non Tech": "from-green-500 to-emerald-500",
  "Gaming": "from-orange-500 to-red-500",
};

const eventIcons = {
  "Tech": Trophy,
  "Non Tech": Users,
  "Gaming": Zap,
};

const studentTypeColors = {
  "UG": "from-blue-500 to-cyan-500",
  "PU": "from-purple-500 to-indigo-500",
};

export default function RegisterForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createRegistration = useMutation(api.mutations.createRegistration);
  const generateUploadUrl = useAction(api.files.generateUploadUrl);
  const preselect = useMemo(
    () => decodeURIComponent(params.get("event") || ""),
    [params],
  );

  const [data, setData] = useState<Registration>({
    teamName: "",
    college: "",
    eventChoice: "Tech",
    specificEvent: "",
    transactionId: "",
    studentType: "UG",
  });

  const [paymentScreenshotFile, setPaymentScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Get available events based on student type
  const getAvailableEvents = (
    studentType: StudentType,
    eventChoice: EventChoice,
  ) => {
    const allEvents = eventSpecificOptions[eventChoice];
    if (studentType === "PU") {
      return allEvents.filter((event) => !ugOnlyEvents.includes(event));
    }
    return allEvents;
  };

  // Calculate team size for current selection
  const currentTeamSize = useMemo(() => {
    if (data.specificEvent) {
      return getTeamSize(data.specificEvent);
    }
    return 2; // Default
  }, [data.specificEvent]);

  // Handle file selection with enhanced validation
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (JPEG, PNG, WebP)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setPaymentScreenshotFile(file);
      setCompletedSteps((prev) => new Set([...prev, 4]));
    }
  };

  // Remove selected file
  const removeFile = () => {
    setPaymentScreenshotFile(null);
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.delete(4);
      return newSet;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload file to Convex storage
  const uploadFile = async (file: File) => {
    try {
      const uploadUrl = await generateUploadUrl();
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();
      return result.storageId;
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to upload file. Please try again.");
    }
  };

  const isPuStudent = data.studentType === "PU";

  // Form submission with enhanced validation
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to register your team.",
        variant: "destructive",
      });
      return;
    }

    // Client-side validation
    if (!data.teamName.trim()) {
      toast({
        title: "Team name required",
        description: "Please enter a team name.",
        variant: "destructive",
      });
      return;
    }

    if (!data.college.trim()) {
      toast({
        title: "College required",
        description: "Please enter your college name.",
        variant: "destructive",
      });
      return;
    }

    if (!data.specificEvent) {
      toast({
        title: "Event selection required",
        description: "Please select a specific event.",
        variant: "destructive",
      });
      return;
    }

    // Security check: Prevent PU students from registering for restricted events
    if (
      data.studentType === "PU" && ugOnlyEvents.includes(data.specificEvent)
    ) {
      toast({
        title: "Event restricted",
        description: "PU students cannot register for this event.",
        variant: "destructive",
      });
      return;
    }

    if (!isPuStudent) {
      if (!data.transactionId.trim()) {
        toast({
          title: "Transaction ID required",
          description: "Please enter the transaction ID.",
          variant: "destructive",
        });
        return;
      }

      if (!paymentScreenshotFile) {
        toast({
          title: "Payment Screenshot required",
          description: "Please upload your payment screenshot.",
          variant: "destructive",
        });
        return;
      }
    }

    setUploading(true);

    try {
      let paymentScreenshotStorageId: string | undefined = undefined;
      if (!isPuStudent && paymentScreenshotFile) {
        // Upload payment screenshot file
        paymentScreenshotStorageId = await uploadFile(paymentScreenshotFile);
      }

      // Create registration with dynamic team size
      const teamId = await createRegistration({
        user_id: user.id,
        user_name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        team_name: data.teamName.trim(),
        members: currentTeamSize,
        college: data.college.trim(),
        event_choice: data.eventChoice,
        specific_event: data.specificEvent,
        transaction_id: data.transactionId.trim(),
        payment_screenshot_storage_id: paymentScreenshotStorageId,
        payment_screenshot_filename: isPuStudent ? undefined : paymentScreenshotFile?.name,
        student_type: data.studentType,
      });

      toast({
        title: "Registration successful!",
        description:
          `Team created with ${currentTeamSize} member slots. You can now invite team members.`,
      });

      router.replace("/profile");
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Registration failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return data.studentType;
      case 2:
        return data.teamName.trim() && data.college.trim();
      case 3:
        return data.eventChoice && data.specificEvent;
      case 4:
        if (isPuStudent) return true;
        return paymentScreenshotFile !== null;
      default:
        return false;
    }
  };

  const EventIcon = eventIcons[data.eventChoice];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          <span className="text-xs sm:text-sm text-purple-300 font-semibold">
            Team Registration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-3 sm:mb-4">
          Join Udhbhava 2K25
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed px-4">
          Ready to embark on an epic journey? Register your team and choose your
          adventure.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 sm:mb-12 px-4">
        <div className="flex items-center justify-center mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {[1, 2, 3, ...(isPuStudent ? [] : [4])].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`relative w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${isStepComplete(step)
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white "
                      : currentStep === step
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white "
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}
                >
                  {isStepComplete(step)
                    ? <CheckCircle className="w-3 h-3 sm:w-6 sm:h-6" />
                    : (
                      <span className="text-xs sm:text-base font-bold">
                        {step}
                      </span>
                    )}
                </div>
                {index < 3 && (
                  <div
                    className={`w-8 sm:w-16 h-1 mx-2 sm:mx-4 transition-all duration-500 ${isStepComplete(step)
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : "bg-zinc-700"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="text-center">
            <h3 className="text-sm sm:text-lg font-semibold text-white mb-2">
              {currentStep === 1 && "Student Category"}
              {currentStep === 2 && "Team Information"}
              {currentStep === 3 && "Event Selection"}
              {currentStep === 4 && "Verification"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Step {currentStep} of {isPuStudent ? 3 : 4}
            </p>
          </div>
        </div>
      </div>

      {/* Form Steps */}
      <div className="space-y-6 sm:space-y-8 px-4">
        {/* Step 1: Student Type Selection */}
        <div
          className={`transition-all duration-700 ${currentStep === 1 ? "opacity-100" : "opacity-50 pointer-events-none"
            }`}
        >
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Student Category
                </h3>
                <p className="text-sm sm:text-base text-zinc-400">
                  Select your student type
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {(["UG", "PU"] as StudentType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setData((d) => ({
                      ...d,
                      studentType: type,
                      specificEvent: "", // Reset event selection when changing student type
                    }));
                    setCompletedSteps((prev) => new Set([...prev, 1]));
                  }}
                  className={`p-4 sm:p-6 rounded-xl border transition-all duration-300 text-left hover:scale-105 ${data.studentType === type
                      ? `bg-gradient-to-r ${studentTypeColors[type]
                      }/20 border-${type === "UG" ? "blue" : "purple"
                      }-500/50 shadow-lg`
                      : "bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600/50"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-bold text-lg sm:text-xl ${data.studentType === type
                          ? "text-white"
                          : "text-zinc-300"
                        }`}
                    >
                      {type === "UG" ? "Under Graduate" : "Pre University"}
                    </span>
                    <span
                      className={`text-xs sm:text-sm px-2 py-1 rounded-full ${data.studentType === type
                          ? "bg-white/20 text-white"
                          : "bg-zinc-700 text-zinc-400"
                        }`}
                    >
                      {type}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-400 mb-2">
                    {type === "UG"
                      ? "Access to all events including Hackathon and Web Odyssey"
                      : "Access to most events (Hackathon & Web Odyssey restricted)"}
                  </p>
                  {type === "PU" && (
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <Lock className="w-3 h-3" />
                      <span>Some events restricted</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {isStepComplete(1) && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  Continue →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Team Information */}
        <div
          className={`transition-all duration-700 ${currentStep === 2 ? "opacity-100" : "opacity-50 pointer-events-none"
            }`}
        >
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Team Details
                </h3>
                <p className="text-sm sm:text-base text-zinc-400">
                  Tell us about your team
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Team Name
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 text-sm sm:text-base"
                  placeholder="e.g., Cyber Ninjas"
                  value={data.teamName}
                  onChange={(e) => {
                    setData((d) => ({ ...d, teamName: e.target.value }));
                    if (e.target.value.trim() && data.college.trim()) {
                      setCompletedSteps((prev) => new Set([...prev, 2]));
                    }
                  }}
                  required
                />
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  College / University
                </label>
                <input
                  className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 text-sm sm:text-base"
                  placeholder="Your College Name"
                  value={data.college}
                  onChange={(e) => {
                    setData((d) => ({ ...d, college: e.target.value }));
                    if (data.teamName.trim() && e.target.value.trim()) {
                      setCompletedSteps((prev) => new Set([...prev, 2]));
                    }
                  }}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-zinc-600 bg-zinc-800/50 text-zinc-300 rounded-xl hover:bg-zinc-700/50 transition-all duration-300 text-sm sm:text-base"
              >
                ← Back
              </button>
              {isStepComplete(2) && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  Continue →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step 3: Event Selection */}
        <div
          className={`transition-all duration-700 ${currentStep === 3 ? "opacity-100" : "opacity-50 pointer-events-none"
            }`}
        >
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${eventColors[data.eventChoice]
                  } rounded-xl flex items-center justify-center`}
              >
                <EventIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Choose Your Adventure
                </h3>
                <p className="text-sm sm:text-base text-zinc-400">
                  Select the events you want to dominate
                </p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Event Category
                </label>
                <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
                  {(["Tech", "Non Tech", ...(!isPuStudent ? ["Gaming"] : [])] as EventChoice[]).map(
                    (choice) => {
                      const Icon = eventIcons[choice];
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => {
                            setData((d) => ({
                              ...d,
                              eventChoice: choice,
                              specificEvent: "",
                            }));
                          }}
                          className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 text-left hover:scale-105 ${data.eventChoice === choice
                              ? `bg-gradient-to-r ${eventColors[choice]
                              }/20 border-${choice === "Tech"
                                ? "purple"
                                : choice === "Non Tech"
                                  ? "green"
                                  : "orange"
                              }-500/50 shadow-lg`
                              : "bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600/50"
                            }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Icon
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${data.eventChoice === choice
                                  ? "text-white"
                                  : "text-zinc-400"
                                }`}
                            />
                            <span
                              className={`font-medium text-sm sm:text-base ${data.eventChoice === choice
                                  ? "text-white"
                                  : "text-zinc-300"
                                }`}
                            >
                              {choice}
                            </span>
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Specific Event
                </label>
                <div className="space-y-2 sm:space-y-3">
                  {getAvailableEvents(data.studentType, data.eventChoice).map(
                    (option) => {
                      const isRestricted = data.studentType === "PU" &&
                        ugOnlyEvents.includes(option);
                      const teamSize = getTeamSize(option);
                      const price = getEventPrice(option);

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            if (!isRestricted) {
                              setData((d) => ({ ...d, specificEvent: option }));
                              setCompletedSteps((prev) =>
                                new Set([...prev, 3])
                              );
                            }
                          }}
                          disabled={isRestricted}
                          className={`w-full p-3 sm:p-4 rounded-xl border transition-all duration-300 text-left ${isRestricted
                              ? "bg-zinc-800/20 border-zinc-700/30 opacity-50 cursor-not-allowed"
                              : data.specificEvent === option
                                ? `bg-gradient-to-r ${eventColors[data.eventChoice]
                                }/20 border-cyan-500/50 shadow-lg hover:scale-105`
                                : "bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600/50 hover:scale-105"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isRestricted && (
                                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                              )}
                              <span
                                className={`font-medium text-sm sm:text-base ${isRestricted
                                    ? "text-zinc-500"
                                    : data.specificEvent === option
                                      ? "text-white"
                                      : "text-zinc-300"
                                  }`}
                              >
                                {option}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isPuStudent && (
                                <span
                                  className={`text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400`}
                                >
                                  ₹{price}
                                </span>
                              )}
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${isRestricted
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-blue-500/20 text-blue-400"
                                  }`}
                              >
                                {teamSize} members
                              </span>
                            </div>
                          </div>
                          {isRestricted && (
                            <p className="text-xs text-red-400 mt-1">
                              UG students only
                            </p>
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>

            {data.specificEvent && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <Info className="w-4 h-4" />
                  <span className="font-semibold text-sm sm:text-base">
                    Team Size Information
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-300">
                  Your team will have{" "}
                  <strong>{currentTeamSize} total member slots</strong>{" "}
                  - you as the leader plus {currentTeamSize - 1}{" "}
                  invite slots. You can invite team members after registration.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-zinc-600 bg-zinc-800/50 text-zinc-300 rounded-xl hover:bg-zinc-700/50 transition-all duration-300 text-sm sm:text-base"
              >
                ← Back
              </button>
              {isStepComplete(3) && (
                <button
                  type="button"
                  onClick={() => {
                    if (isPuStudent) {
                      onSubmit(new Event('submit'));
                    } else {
                      setCurrentStep(4);
                    }
                  }}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  {isPuStudent ? "Register" : "Continue →"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: File Upload & Final Details */}
        {!isPuStudent && (
        <div
          className={`transition-all duration-700 ${currentStep === 4 ? "opacity-100" : "opacity-50 pointer-events-none"
            }`}
        >
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Verification & Details
                </h3>
                <p className="text-sm sm:text-base text-zinc-400">
                  Upload your payment screenshot and add final details
                </p>
              </div>
            </div>

            {/* Payment Screenshot Upload */}
            <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Payment Screenshot Photo *
              </label>

              {!paymentScreenshotFile
                ? (
                  <div
                    className="group border-2 border-dashed border-zinc-600/50 hover:border-cyan-500/50 rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 hover:bg-zinc-800/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="relative">
                      <Upload className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-zinc-400 group-hover:text-cyan-400 transition-colors duration-300" />
                    </div>
                    <p className="text-sm sm:text-base text-zinc-300 font-medium mb-2">
                      Click to upload your payment screenshot
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-500">
                      JPEG, PNG, WebP up to 5MB
                    </p>
                  </div>
                )
                : (
                  <div className="border border-zinc-600/50 rounded-xl p-4 sm:p-6 bg-zinc-800/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white text-sm sm:text-base truncate">
                            {paymentScreenshotFile.name}
                          </p>
                          <p className="text-xs sm:text-sm text-zinc-400">
                            {(paymentScreenshotFile.size / 1024 / 1024).toFixed(2)}{" "}
                            MB • Uploaded
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-lg transition-all duration-300 hover:scale-105 ml-2"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                required
              />
            </div>

            {/* Transaction ID */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                Transaction ID *
              </label>
              <input
                className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 text-sm sm:text-base"
                placeholder="Enter your UPI transaction ID"
                value={data.transactionId}
                onChange={(e) =>
                  setData((d) => ({ ...d, transactionId: e.target.value }))}
                required
              />
            </div>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 sm:px-6 py-2 sm:py-3 border border-zinc-600 bg-zinc-800/50 text-zinc-300 rounded-xl hover:bg-zinc-700/50 transition-all duration-300 text-sm sm:text-base order-2 sm:order-1"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={onSubmit}
                disabled={uploading || !paymentScreenshotFile || !data.transactionId.trim()}
                className="group relative px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base order-1 sm:order-2"
              >
                {uploading
                  ? (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin">
                      </div>
                      <span>Submitting...</span>
                    </div>
                  )
                  : (
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Register Team</span>
                    </div>
                  )}
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
