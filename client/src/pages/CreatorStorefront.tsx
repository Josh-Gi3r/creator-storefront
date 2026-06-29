import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  Calendar, 
  Check, 
  Clock, 
  Coins, 
  ExternalLink, 
  Instagram, 
  Loader2, 
  ShoppingCart, 
  Sparkles, 
  Star, 
  TrendingUp, 
  Twitter, 
  Users, 
  Wallet 
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";

export default function CreatorStorefront() {
  const params = useParams<{ id: string }>();
  const creatorId = parseInt(params.id || "0");
  const { user, isAuthenticated } = useAuth();

  const [isBuyTokenOpen, setIsBuyTokenOpen] = useState(false);
  const [isBookServiceOpen, setIsBookServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [tokenAmount, setTokenAmount] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const utils = trpc.useUtils();

  const { data: creator, isLoading } = trpc.fan.getCreator.useQuery({ creatorId });
  const { data: services } = trpc.fan.getCreatorServices.useQuery({ creatorId });

  const buyTokens = trpc.fan.buyTokens.useMutation({
    onSuccess: () => {
      toast.success("Tokens purchased successfully! 🎉");
      setIsBuyTokenOpen(false);
      setTokenAmount("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to purchase tokens");
    },
  });

  const bookService = trpc.fan.bookService.useMutation({
    onSuccess: () => {
      toast.success("Service booked successfully! 📅");
      setIsBookServiceOpen(false);
      setSelectedService(null);
      setBookingDate("");
      setBookingTime("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to book service");
    },
  });

  const handleBuyTokens = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    buyTokens.mutate({
      creatorId,
      amount: parseFloat(tokenAmount),
    });
  };

  const handleBookService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (!selectedService) return;

    const scheduledAt = new Date(`${bookingDate}T${bookingTime}`);
    bookService.mutate({
      serviceId: selectedService.id,
      scheduledAt: scheduledAt.toISOString(),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Creator Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The creator you're looking for doesn't exist.
          </p>
          <Link href="/discover">
            <Button>Browse Creators</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-primary neon-glow" />
                <span className="text-2xl font-bold gradient-text">CreatorToken</span>
              </a>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/discover">
                <a className="text-foreground/80 hover:text-primary transition-colors">Discover</a>
              </Link>
              {isAuthenticated ? (
                <Link href="/wallet">
                  <Button variant="outline" className="border-primary/30">
                    <Wallet className="mr-2 w-4 h-4" />
                    My Wallet
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="neon-glow">Connect Wallet</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Creator Header */}
        <div className="mb-12">
          <div className="flex items-start gap-8 mb-8">
            {creator.profile?.profilePhoto ? (
              <img
                src={creator.profile.profilePhoto}
                alt={creator.name || "Creator"}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary neon-glow-strong"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary neon-glow">
                <Sparkles className="w-16 h-16 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{creator.name}</h1>
                {creator.profile?.verified && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center neon-glow">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </div>
              {creator.profile?.category && (
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary mb-4">
                  {creator.profile.category}
                </div>
              )}
              <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
                {creator.profile?.bio || "No bio available"}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">{creator.profile?.followerCount || 0} Followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="font-medium">{creator.profile?.totalBookings || 0} Bookings</span>
                </div>
                {creator.profile?.rating && parseFloat(creator.profile.rating) > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                    <span className="font-medium">{creator.profile.rating}/5.0</span>
                  </div>
                )}
              </div>
              {/* Social Links */}
              <div className="flex items-center gap-4 mt-4">
                {creator.profile?.twitterHandle && (
                  <a
                    href={`https://twitter.com/${creator.profile.twitterHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {creator.profile?.instagramHandle && (
                  <a
                    href={`https://instagram.com/${creator.profile.instagramHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {creator.profile?.website && (
                  <a
                    href={creator.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Token Info Card */}
          {creator.token && (
            <Card className="p-6 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Coins className="w-8 h-8 text-primary neon-glow" />
                    <div>
                      <h3 className="text-2xl font-bold">
                        {creator.token.tokenName} <span className="text-primary font-mono">({creator.token.tokenSymbol})</span>
                      </h3>
                      <p className="text-sm text-muted-foreground">Creator Token</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Price: </span>
                      <span className="font-mono font-bold text-2xl text-primary">${creator.token.currentPrice} USDT</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Supply: </span>
                      <span className="font-mono font-bold">{creator.token.circulatingSupply} / {creator.token.totalSupply}</span>
                    </div>
                  </div>
                </div>
                <Button size="lg" className="neon-glow-strong" onClick={() => setIsBuyTokenOpen(true)}>
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Buy Tokens
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Services Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6 neon-text">Available Services</h2>
          {services && services.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service: any) => (
                <Card key={service.id} className="p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 transition-all">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{service.totalBookings || 0} bookings</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                      <span className="font-mono font-bold text-primary text-lg">
                        {service.tokenPrice} {creator.token?.tokenSymbol}
                      </span>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedService(service);
                        setIsBookServiceOpen(true);
                      }}
                      className="neon-glow"
                    >
                      <Calendar className="mr-2 w-4 h-4" />
                      Book Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-primary/30">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No services available yet</p>
            </Card>
          )}
        </div>
      </div>

      {/* Buy Tokens Dialog */}
      <Dialog open={isBuyTokenOpen} onOpenChange={setIsBuyTokenOpen}>
        <DialogContent className="border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl neon-text">Buy {creator.token?.tokenSymbol} Tokens</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBuyTokens} className="space-y-6 mt-4">
            <div>
              <Label htmlFor="tokenAmount">Amount (USDT)</Label>
              <Input
                id="tokenAmount"
                type="number"
                step="0.01"
                min="1"
                placeholder="100.00"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                required
                className="mt-2 font-mono text-lg"
              />
              <p className="text-sm text-muted-foreground mt-2">
                You'll receive approximately{" "}
                <span className="font-mono font-bold text-primary">
                  {tokenAmount && creator.token
                    ? (parseFloat(tokenAmount) / parseFloat(creator.token.currentPrice)).toFixed(2)
                    : "0"}{" "}
                  {creator.token?.tokenSymbol}
                </span>
              </p>
            </div>

            <Card className="p-4 bg-primary/5 border-primary/30">
              <h4 className="font-bold mb-2 text-sm">Transaction Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token Price:</span>
                  <span className="font-mono">${creator.token?.currentPrice} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-mono">${tokenAmount || "0"} USDT</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-primary/20">
                  <span className="font-bold">You'll Receive:</span>
                  <span className="font-mono font-bold text-primary">
                    {tokenAmount && creator.token
                      ? (parseFloat(tokenAmount) / parseFloat(creator.token.currentPrice)).toFixed(2)
                      : "0"}{" "}
                    {creator.token?.tokenSymbol}
                  </span>
                </div>
              </div>
            </Card>

            <Button type="submit" className="w-full neon-glow-strong" disabled={buyTokens.isPending}>
              {buyTokens.isPending ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 w-5 h-5" />
                  Purchase Tokens
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Book Service Dialog */}
      <Dialog open={isBookServiceOpen} onOpenChange={setIsBookServiceOpen}>
        <DialogContent className="border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl neon-text">Book {selectedService?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBookService} className="space-y-6 mt-4">
            <div>
              <Label htmlFor="bookingDate">Date</Label>
              <Input
                id="bookingDate"
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
                className="mt-2"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <Label htmlFor="bookingTime">Time</Label>
              <Input
                id="bookingTime"
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                required
                className="mt-2"
              />
            </div>

            {selectedService && (
              <Card className="p-4 bg-primary/5 border-primary/30">
                <h4 className="font-bold mb-2 text-sm">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-medium">{selectedService.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{selectedService.duration} minutes</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-primary/20">
                    <span className="font-bold">Price:</span>
                    <span className="font-mono font-bold text-primary">
                      {selectedService.tokenPrice} {creator.token?.tokenSymbol}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            <Button type="submit" className="w-full neon-glow-strong" disabled={bookService.isPending}>
              {bookService.isPending ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 w-5 h-5" />
                  Confirm Booking
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
