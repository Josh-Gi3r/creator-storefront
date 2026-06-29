import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  Calendar, 
  Coins, 
  DollarSign, 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  Users 
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Analytics() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats } = trpc.creator.getStats.useQuery();

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
            You need to be a creator to access analytics.
          </p>
          <Link href="/onboarding">
            <Button>Become a Creator</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Sample data for charts (in production, this would come from the backend)
  const revenueData = [
    { date: "Jan", revenue: 2400 },
    { date: "Feb", revenue: 3800 },
    { date: "Mar", revenue: 2800 },
    { date: "Apr", revenue: 4200 },
    { date: "May", revenue: 5100 },
    { date: "Jun", revenue: 6300 },
  ];

  const tokenSalesData = [
    { date: "Jan", tokens: 120 },
    { date: "Feb", tokens: 180 },
    { date: "Mar", tokens: 150 },
    { date: "Apr", tokens: 220 },
    { date: "May", tokens: 280 },
    { date: "Jun", tokens: 340 },
  ];

  const bookingsData = [
    { service: "1-on-1 Coaching", bookings: 45 },
    { service: "Group Session", bookings: 32 },
    { service: "Consultation", bookings: 28 },
    { service: "Workshop", bookings: 18 },
  ];

  const topFansData = [
    { name: "Fan #1", spent: 1200 },
    { name: "Fan #2", spent: 980 },
    { name: "Fan #3", spent: 850 },
    { name: "Fan #4", spent: 720 },
    { name: "Fan #5", spent: 650 },
  ];

  const COLORS = ["#00FF00", "#00CC00", "#009900", "#006600", "#003300"];

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
              <Link href="/dashboard">
                <a className="text-foreground/80 hover:text-primary transition-colors">Dashboard</a>
              </Link>
              <Link href="/analytics">
                <a className="text-primary font-medium">Analytics</a>
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
        <div className="flex items-center gap-4 mb-12">
          <Button variant="outline" size="icon" onClick={() => setLocation("/dashboard")} className="border-primary/30">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="gradient-text">Analytics</span> Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Track your performance and growth</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold font-mono neon-text">${stats?.totalRevenue || "0"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tokens Sold</p>
                <p className="text-2xl font-bold font-mono neon-text">{stats?.tokenBalance || "0"}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold font-mono neon-text">{stats?.totalBookings || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fans</p>
                <p className="text-2xl font-bold font-mono neon-text">{stats?.totalFans || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-primary neon-glow" />
              <h3 className="text-xl font-bold neon-text">Revenue Over Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00FF0020" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0a0a0a", 
                    border: "1px solid #00FF0040",
                    borderRadius: "8px"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#00FF00" 
                  strokeWidth={3}
                  dot={{ fill: "#00FF00", r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Token Sales Chart */}
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <Coins className="w-6 h-6 text-primary neon-glow" />
              <h3 className="text-xl font-bold neon-text">Token Sales</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tokenSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00FF0020" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0a0a0a", 
                    border: "1px solid #00FF0040",
                    borderRadius: "8px"
                  }} 
                />
                <Bar dataKey="tokens" fill="#00FF00" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Bookings by Service */}
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-6 h-6 text-primary neon-glow" />
              <h3 className="text-xl font-bold neon-text">Bookings by Service</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bookingsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="bookings"
                >
                  {bookingsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0a0a0a", 
                    border: "1px solid #00FF0040",
                    borderRadius: "8px"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Fans */}
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-primary neon-glow" />
              <h3 className="text-xl font-bold neon-text">Top Fans</h3>
            </div>
            <div className="space-y-4">
              {topFansData.map((fan, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                      <span className="text-xs font-bold text-primary">#{index + 1}</span>
                    </div>
                    <span className="font-medium">{fan.name}</span>
                  </div>
                  <span className="font-mono font-bold text-primary">${fan.spent}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Additional Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <h4 className="font-bold mb-4 neon-text">Token Velocity</h4>
            <div className="text-4xl font-bold font-mono mb-2 text-primary">2.4x</div>
            <p className="text-sm text-muted-foreground">Average token circulation rate</p>
          </Card>

          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <h4 className="font-bold mb-4 neon-text">Avg Transaction</h4>
            <div className="text-4xl font-bold font-mono mb-2 text-primary">$127</div>
            <p className="text-sm text-muted-foreground">Average transaction size</p>
          </Card>

          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <h4 className="font-bold mb-4 neon-text">Growth Rate</h4>
            <div className="text-4xl font-bold font-mono mb-2 text-primary">+34%</div>
            <p className="text-sm text-muted-foreground">Month-over-month growth</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
