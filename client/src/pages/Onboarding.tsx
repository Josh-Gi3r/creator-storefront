import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Check, Loader2, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    bio: "",
    profilePhoto: "",
    category: "",
    twitterHandle: "",
    instagramHandle: "",
    website: "",
  });

  // Token data
  const [tokenData, setTokenData] = useState({
    tokenName: "",
    tokenSymbol: "",
    initialPrice: "",
  });

  const createProfile = trpc.creator.createProfile.useMutation({
    onSuccess: () => {
      setStep(2);
      toast.success("Profile created successfully!");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create profile");
      setIsSubmitting(false);
    },
  });

  const launchToken = trpc.creator.launchToken.useMutation({
    onSuccess: () => {
      toast.success("Token launched successfully! 🚀");
      setTimeout(() => setLocation("/dashboard"), 1500);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to launch token");
      setIsSubmitting(false);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    createProfile.mutate(profileData);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    launchToken.mutate({
      ...tokenData,
      initialPrice: parseFloat(tokenData.initialPrice),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement actual file upload to S3
    // For now, using placeholder
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData({ ...profileData, profilePhoto: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary neon-glow" />
            <span className="text-2xl font-bold gradient-text">CreatorToken</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= 1
                    ? "bg-primary text-primary-foreground neon-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <span className={step >= 1 ? "text-foreground font-medium" : "text-muted-foreground"}>
                Create Profile
              </span>
            </div>

            <div className={`h-0.5 w-24 ${step >= 2 ? "bg-primary neon-glow" : "bg-muted"}`} />

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= 2
                    ? "bg-primary text-primary-foreground neon-glow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > 2 ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <span className={step >= 2 ? "text-foreground font-medium" : "text-muted-foreground"}>
                Launch Token
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Profile Creation */}
        {step === 1 && (
          <Card className="max-w-2xl mx-auto p-8 border-primary/20 bg-card/50 backdrop-blur">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 neon-text">Create Your Profile</h2>
              <p className="text-muted-foreground">
                Tell your fans about yourself and what you offer
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div>
                <Label htmlFor="profilePhoto">Profile Photo</Label>
                <div className="mt-2 flex items-center gap-4">
                  {profileData.profilePhoto ? (
                    <img
                      src={profileData.profilePhoto}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary neon-glow"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Input
                      id="profilePhoto"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label
                      htmlFor="profilePhoto"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </Label>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell your fans about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  required
                  className="mt-2"
                />
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Gaming, Fitness, Education"
                  value={profileData.category}
                  onChange={(e) => setProfileData({ ...profileData, category: e.target.value })}
                  required
                  className="mt-2"
                />
              </div>

              {/* Social Links */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter">Twitter Handle</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={profileData.twitterHandle}
                    onChange={(e) =>
                      setProfileData({ ...profileData, twitterHandle: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={profileData.instagramHandle}
                    onChange={(e) =>
                      setProfileData({ ...profileData, instagramHandle: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  className="mt-2"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full neon-glow-strong"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Continue to Token Launch
                    <Check className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}

        {/* Step 2: Token Launch */}
        {step === 2 && (
          <Card className="max-w-2xl mx-auto p-8 border-primary/20 bg-card/50 backdrop-blur">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 neon-text">Launch Your Token</h2>
              <p className="text-muted-foreground">
                Create your own branded currency for your community
              </p>
            </div>

            <form onSubmit={handleTokenSubmit} className="space-y-6">
              {/* Token Name */}
              <div>
                <Label htmlFor="tokenName">Token Name</Label>
                <Input
                  id="tokenName"
                  placeholder="e.g., Creator Coin"
                  value={tokenData.tokenName}
                  onChange={(e) => setTokenData({ ...tokenData, tokenName: e.target.value })}
                  required
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Full name of your token (e.g., "Josh Token")
                </p>
              </div>

              {/* Token Symbol */}
              <div>
                <Label htmlFor="tokenSymbol">Token Symbol</Label>
                <Input
                  id="tokenSymbol"
                  placeholder="e.g., JOSH"
                  value={tokenData.tokenSymbol}
                  onChange={(e) =>
                    setTokenData({ ...tokenData, tokenSymbol: e.target.value.toUpperCase() })
                  }
                  maxLength={10}
                  required
                  className="mt-2 font-mono"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Short ticker symbol (3-5 characters recommended)
                </p>
              </div>

              {/* Initial Price */}
              <div>
                <Label htmlFor="initialPrice">Initial Price (USDT)</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="initialPrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="1.00"
                    value={tokenData.initialPrice}
                    onChange={(e) => setTokenData({ ...tokenData, initialPrice: e.target.value })}
                    required
                    className="pl-7 font-mono"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Set the initial price for 1 token in USDT
                </p>
              </div>

              {/* Preview */}
              <Card className="p-6 bg-primary/5 border-primary/30">
                <h3 className="font-bold mb-4 text-primary">Token Preview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">
                      {tokenData.tokenName || "Your Token Name"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Symbol:</span>
                    <span className="font-mono font-bold text-primary">
                      {tokenData.tokenSymbol || "SYMBOL"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial Price:</span>
                    <span className="font-mono font-bold">
                      ${tokenData.initialPrice || "0.00"} USDT
                    </span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 neon-glow-strong"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Launching Token...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-5 h-5" />
                      Launch Token
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
