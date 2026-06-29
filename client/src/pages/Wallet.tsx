import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  Coins, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Wallet as WalletIcon 
} from "lucide-react";
import { Link } from "wouter";

export default function Wallet() {
  const { user, isAuthenticated, loading } = useAuth();

  const { data: holdings, isLoading: holdingsLoading } = trpc.wallet.getHoldings.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: transactions, isLoading: transactionsLoading } = trpc.wallet.getTransactions.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: bookings, isLoading: bookingsLoading } = trpc.wallet.getBookings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <WalletIcon className="w-16 h-16 text-primary mx-auto mb-4 neon-glow" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to view your token holdings and transaction history.
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" className="neon-glow-strong">
              <WalletIcon className="mr-2 w-5 h-5" />
              Connect Wallet
            </Button>
          </a>
        </Card>
      </div>
    );
  }

  const totalPortfolioValue = holdings?.reduce((sum: number, h: any) => {
    const balance = parseFloat(h.balance || "0");
    const currentPrice = parseFloat(h.token?.currentPrice || "0");
    return sum + (balance * currentPrice);
  }, 0) || 0;

  const totalInvested = holdings?.reduce((sum: number, h: any) => {
    return sum + parseFloat(h.totalInvested || "0");
  }, 0) || 0;

  const portfolioGain = totalPortfolioValue - totalInvested;
  const portfolioGainPercent = totalInvested > 0 ? (portfolioGain / totalInvested) * 100 : 0;

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
              <Link href="/wallet">
                <a className="text-primary font-medium">My Wallet</a>
              </Link>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-primary font-medium">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            My <span className="gradient-text">Wallet</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your creator tokens and view your portfolio
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 col-span-2">
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-5xl font-bold font-mono neon-text">
                  ${totalPortfolioValue.toFixed(2)}
                </h2>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  portfolioGain >= 0 
                    ? "bg-green-500/10 text-green-500 border border-green-500/30" 
                    : "bg-red-500/10 text-red-500 border border-red-500/30"
                }`}>
                  {portfolioGain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{portfolioGain >= 0 ? "+" : ""}{portfolioGainPercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
                <p className="text-xl font-mono font-bold">${totalInvested.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Profit/Loss</p>
                <p className={`text-xl font-mono font-bold ${portfolioGain >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {portfolioGain >= 0 ? "+" : ""}${portfolioGain.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center neon-glow">
                <Coins className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Tokens</p>
                <p className="text-2xl font-bold">{holdings?.length || 0}</p>
              </div>
            </div>
            <Link href="/discover">
              <Button variant="outline" className="w-full border-primary/30">
                <Sparkles className="mr-2 w-4 h-4" />
                Discover More
              </Button>
            </Link>
          </Card>
        </div>

        {/* Token Holdings */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 neon-text">Token Holdings</h2>
          {holdingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : holdings && holdings.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {holdings.map((holding: any) => {
                const balance = parseFloat(holding.balance || "0");
                const currentPrice = parseFloat(holding.token?.currentPrice || "0");
                const currentValue = balance * currentPrice;
                const invested = parseFloat(holding.totalInvested || "0");
                const gain = currentValue - invested;
                const gainPercent = invested > 0 ? (gain / invested) * 100 : 0;

                return (
                  <Card key={holding.id} className="p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/40 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {holding.creator?.name ? (
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                            <span className="font-bold text-primary">{holding.creator.name[0]}</span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                            <Coins className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold">{holding.token?.tokenName}</h3>
                          <p className="text-sm text-muted-foreground font-mono">{holding.token?.tokenSymbol}</p>
                        </div>
                      </div>
                      <Link href={`/creator/${holding.token?.creatorId}`}>
                        <Button size="sm" variant="outline" className="border-primary/30">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Balance</span>
                        <span className="font-mono font-bold">{balance.toFixed(2)} {holding.token?.tokenSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <span className="font-mono">${currentPrice.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-primary/20">
                        <span className="text-sm text-muted-foreground">Current Value</span>
                        <span className="font-mono font-bold text-primary">${currentValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Profit/Loss</span>
                        <div className="text-right">
                          <div className={`font-mono font-bold ${gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {gain >= 0 ? "+" : ""}${gain.toFixed(2)}
                          </div>
                          <div className={`text-xs ${gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {gain >= 0 ? "+" : ""}{gainPercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-primary/30">
              <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No tokens yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by discovering creators and purchasing their tokens
              </p>
              <Link href="/discover">
                <Button className="neon-glow">
                  <Sparkles className="mr-2 w-4 h-4" />
                  Discover Creators
                </Button>
              </Link>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Transactions */}
          <div>
            <h2 className="text-2xl font-bold mb-6 neon-text">Recent Transactions</h2>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.slice(0, 10).map((tx: any) => (
                  <Card key={tx.id} className="p-4 border-primary/20 bg-card/50 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "buy" ? "bg-green-500/10 border border-green-500/30" :
                          tx.type === "sell" ? "bg-red-500/10 border border-red-500/30" :
                          "bg-primary/10 border border-primary/30"
                        }`}>
                          {tx.type === "buy" ? <ArrowDownRight className="w-5 h-5 text-green-500" /> :
                           tx.type === "sell" ? <ArrowUpRight className="w-5 h-5 text-red-500" /> :
                           <Coins className="w-5 h-5 text-primary" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{tx.type} {tx.token?.tokenSymbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold">{parseFloat(tx.amount).toFixed(2)} {tx.token?.tokenSymbol}</p>
                        <p className="text-sm text-muted-foreground font-mono">${parseFloat(tx.totalValue || "0").toFixed(2)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed border-primary/30">
                <ArrowUpRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
              </Card>
            )}
          </div>

          {/* Upcoming Bookings */}
          <div>
            <h2 className="text-2xl font-bold mb-6 neon-text">Upcoming Bookings</h2>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.filter((b: any) => b.status !== "completed" && b.status !== "cancelled").slice(0, 5).map((booking: any) => (
                  <Card key={booking.id} className="p-4 border-primary/20 bg-card/50 backdrop-blur">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold mb-1">{booking.service?.title}</h4>
                        <p className="text-sm text-muted-foreground">with {booking.creator?.name}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "pending" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30" :
                        booking.status === "accepted" ? "bg-green-500/10 text-green-500 border border-green-500/30" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {booking.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.scheduledAt).toLocaleDateString()}</span>
                      </div>
                      <div>{new Date(booking.scheduledAt).toLocaleTimeString()}</div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed border-primary/30">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming bookings</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
