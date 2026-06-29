import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { 
  ArrowUpRight, 
  Calendar, 
  Check, 
  Coins, 
  DollarSign, 
  Edit, 
  Loader2, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Users, 
  X 
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    tokenPrice: "",
    duration: "",
    category: "",
  });

  const utils = trpc.useUtils();

  // Fetch creator data
  const { data: profile } = trpc.creator.getProfile.useQuery();
  const { data: token } = trpc.creator.getToken.useQuery();
  const { data: services } = trpc.creator.getServices.useQuery();
  const { data: bookings } = trpc.creator.getBookings.useQuery();
  const { data: stats } = trpc.creator.getStats.useQuery();

  // Mutations
  const addService = trpc.creator.addService.useMutation({
    onSuccess: () => {
      toast.success("Service added successfully!");
      setIsAddServiceOpen(false);
      setServiceForm({ title: "", description: "", tokenPrice: "", duration: "", category: "" });
      utils.creator.getServices.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add service");
    },
  });

  const updateBookingStatus = trpc.creator.updateBookingStatus.useMutation({
    onSuccess: () => {
      toast.success("Booking updated!");
      utils.creator.getBookings.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update booking");
    },
  });

  const cashout = trpc.creator.cashout.useMutation({
    onSuccess: () => {
      toast.success("Cashout successful! 🎉");
      utils.creator.getToken.invalidate();
      utils.creator.getStats.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Cashout failed");
    },
  });

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    addService.mutate({
      title: serviceForm.title,
      description: serviceForm.description,
      tokenPrice: parseFloat(serviceForm.tokenPrice),
      duration: parseInt(serviceForm.duration),
      category: serviceForm.category,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "creator") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You need to be a creator to access this dashboard.
          </p>
          <Link href="/onboarding">
            <Button>Become a Creator</Button>
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
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary neon-glow" />
              <span className="text-2xl font-bold gradient-text">CreatorToken</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/">
                <a className="text-foreground/80 hover:text-primary transition-colors">Home</a>
              </Link>
              <Link href="/analytics">
                <a className="text-foreground/80 hover:text-primary transition-colors">Analytics</a>
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-primary font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user.name}</span>
          </h1>
          <p className="text-muted-foreground text-lg">Manage your services and track your earnings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center neon-glow">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold font-mono neon-text mb-1">
              {token?.tokenSymbol ? `${stats?.tokenBalance || "0"} ${token.tokenSymbol}` : "0"}
            </div>
            <div className="text-sm text-muted-foreground">Token Balance</div>
          </Card>

          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center neon-glow">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold font-mono neon-text mb-1">
              ${stats?.totalRevenue || "0"}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
          </Card>

          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center neon-glow">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold font-mono neon-text mb-1">
              {stats?.totalBookings || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Bookings</div>
          </Card>

          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center neon-glow">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold font-mono neon-text mb-1">
              {stats?.totalFans || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Fans</div>
          </Card>
        </div>

        {/* Token Info & Cashout */}
        {token && (
          <Card className="p-6 mb-12 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {token.tokenName} <span className="text-primary font-mono">({token.tokenSymbol})</span>
                </h3>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div>
                    Current Price: <span className="font-mono font-bold text-foreground">${token.currentPrice} USDT</span>
                  </div>
                  <div>
                    Total Supply: <span className="font-mono font-bold text-foreground">{token.totalSupply}</span>
                  </div>
                  <div>
                    Circulating: <span className="font-mono font-bold text-foreground">{token.circulatingSupply}</span>
                  </div>
                </div>
              </div>
              <Button 
                size="lg" 
                className="neon-glow-strong"
                onClick={() => cashout.mutate()}
                disabled={cashout.isPending || !stats?.tokenBalance || parseFloat(stats.tokenBalance) === 0}
              >
                {cashout.isPending ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 w-5 h-5" />
                    Cash Out to USDT
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold neon-text">Your Services</h2>
              <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                <DialogTrigger asChild>
                  <Button className="neon-glow">
                    <Plus className="mr-2 w-4 h-4" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-primary/30">
                  <DialogHeader>
                    <DialogTitle className="text-2xl neon-text">Add New Service</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddService} className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Service Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., 1-on-1 Coaching Session"
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what you'll provide..."
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        required
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tokenPrice">Price (Tokens)</Label>
                        <Input
                          id="tokenPrice"
                          type="number"
                          step="0.01"
                          placeholder="100"
                          value={serviceForm.tokenPrice}
                          onChange={(e) => setServiceForm({ ...serviceForm, tokenPrice: e.target.value })}
                          required
                          className="mt-2 font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (mins)</Label>
                        <Input
                          id="duration"
                          type="number"
                          placeholder="60"
                          value={serviceForm.duration}
                          onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                          required
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Coaching"
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>
                    <Button type="submit" className="w-full neon-glow" disabled={addService.isPending}>
                      {addService.isPending ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Service"
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {services && services.length > 0 ? (
                services.map((service: any) => (
                  <Card key={service.id} className="p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{service.title}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-primary/30">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30">
                        <span className="font-mono font-bold text-primary">{service.tokenPrice} {token?.tokenSymbol}</span>
                      </div>
                      <div className="text-muted-foreground">{service.duration} mins</div>
                      <div className="text-muted-foreground">• {service.category}</div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center border-dashed border-primary/30">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No services yet</p>
                  <Button onClick={() => setIsAddServiceOpen(true)} variant="outline" className="border-primary/30">
                    <Plus className="mr-2 w-4 h-4" />
                    Add Your First Service
                  </Button>
                </Card>
              )}
            </div>
          </div>

          {/* Bookings Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6 neon-text">Recent Bookings</h2>
            <div className="space-y-4">
              {bookings && bookings.length > 0 ? (
                bookings.map((booking: any) => (
                  <Card key={booking.id} className="p-6 border-primary/20 bg-card/50 backdrop-blur">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold mb-1">{booking.service?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Booked by {booking.fan?.name || "Anonymous"}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" :
                        booking.status === "accepted" ? "bg-green-500/10 text-green-500 border border-green-500/30" :
                        booking.status === "declined" ? "bg-red-500/10 text-red-500 border border-red-500/30" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {booking.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div>📅 {new Date(booking.scheduledAt).toLocaleDateString()}</div>
                      <div>🕐 {new Date(booking.scheduledAt).toLocaleTimeString()}</div>
                      <div className="font-mono text-primary">{booking.tokenAmount} {token?.tokenSymbol}</div>
                    </div>
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 neon-glow"
                          onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, status: "accepted" })}
                          disabled={updateBookingStatus.isPending}
                        >
                          <Check className="mr-2 w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10"
                          onClick={() => updateBookingStatus.mutate({ bookingId: booking.id, status: "declined" })}
                          disabled={updateBookingStatus.isPending}
                        >
                          <X className="mr-2 w-4 h-4" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center border-dashed border-primary/30">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
