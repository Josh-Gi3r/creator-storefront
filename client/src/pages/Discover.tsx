import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Sparkles, Star, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: creators, isLoading } = trpc.fan.getCreators.useQuery({
    search: searchQuery || undefined,
    category: selectedCategory,
  });

  const { data: featuredCreators } = trpc.fan.getFeaturedCreators.useQuery();

  const categories = ["Gaming", "Fitness", "Education", "Music", "Art", "Coaching", "Tech", "Business"];

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
              <Link href="/">
                <a className="text-foreground/80 hover:text-primary transition-colors">Home</a>
              </Link>
              <Link href="/discover">
                <a className="text-primary font-medium">Discover</a>
              </Link>
              <Link href="/wallet">
                <Button variant="outline" className="border-primary/30">
                  My Wallet
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Discover <span className="gradient-text">Creators</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find talented creators, buy their tokens, and book exclusive services
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search creators by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg border-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {/* Featured Creators */}
        {featuredCreators && featuredCreators.length > 0 && !searchQuery && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-primary neon-glow" />
              <h2 className="text-3xl font-bold neon-text">Featured Creators</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCreators.slice(0, 3).map((creator: any) => (
                <Link key={creator.id} href={`/creator/${creator.id}`}>
                  <Card className="p-6 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 hover:border-primary/60 transition-all cursor-pointer hover:neon-glow group">
                    <div className="flex items-start gap-4 mb-4">
                      {creator.profile?.profilePhoto ? (
                        <img
                          src={creator.profile.profilePhoto}
                          alt={creator.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary neon-glow"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                          <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                          {creator.name}
                        </h3>
                        {creator.profile?.category && (
                          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary">
                            {creator.profile.category}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {creator.profile?.bio || "No bio available"}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{creator.profile?.followerCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span>{creator.profile?.totalBookings || 0}</span>
                        </div>
                      </div>
                      {creator.token && (
                        <div className="font-mono font-bold text-primary">
                          ${creator.token.currentPrice} USDT
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(undefined)}
              className={!selectedCategory ? "neon-glow" : "border-primary/30"}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "neon-glow" : "border-primary/30"}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* All Creators Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6 neon-text">
            {searchQuery ? "Search Results" : selectedCategory ? `${selectedCategory} Creators` : "All Creators"}
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : creators && creators.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creators.map((creator: any) => (
                <Link key={creator.id} href={`/creator/${creator.id}`}>
                  <Card className="p-6 border-primary/20 bg-card/50 backdrop-blur hover:border-primary/50 transition-all cursor-pointer hover:neon-glow group">
                    <div className="flex items-start gap-4 mb-4">
                      {creator.profile?.profilePhoto ? (
                        <img
                          src={creator.profile.profilePhoto}
                          alt={creator.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-primary/50"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                          <Sparkles className="w-7 h-7 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                          {creator.name}
                        </h3>
                        {creator.profile?.category && (
                          <div className="inline-block px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-medium text-primary">
                            {creator.profile.category}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {creator.profile?.bio || "No bio available"}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{creator.profile?.followerCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span>{creator.profile?.totalBookings || 0}</span>
                        </div>
                      </div>
                      {creator.token && (
                        <div className="font-mono font-bold text-primary">
                          ${creator.token.currentPrice}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="p-24 text-center border-dashed border-primary/30">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No creators found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No creators in this category yet"}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
