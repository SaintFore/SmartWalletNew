import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Wallet,
  PieChart,
  Smartphone,
  Moon,
  Sun,
  ArrowUpRight,
} from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

const features = [
  {
    icon: PieChart,
    title: "Smart Categories",
    description: "Organize transactions with intelligent categorization",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    description: "Visualize your financial health with real-time insights",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your data is encrypted and protected at all times",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Access your wallet anywhere, anytime on any device",
  },
];

const stats = [
  { label: "Active Users", value: "10K+", icon: Wallet },
  { label: "Transactions", value: "1M+", icon: ArrowUpRight },
  { label: "Categories", value: "50+", icon: PieChart },
  { label: "Uptime", value: "99.9%", icon: Shield },
];

export default function LandingPage() {
  const { dark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, ...ease }}
        className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            <span className="font-semibold text-lg">SmartWallet</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              to="/categories"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            >
              Categories
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.05] rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500/[0.05] rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ease}
          >
            <Badge variant="secondary" className="mb-6">
              <Zap className="size-3.5" data-icon="inline-start" />
              Smart Financial Management
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...ease }}
            className="text-4xl md:text-6xl font-semibold tracking-tight mb-6"
          >
            Take Control of
            <br />
            <span className="text-primary">Your Finances</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...ease }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            SmartWallet helps you track expenses, categorize transactions, and
            achieve your financial goals with intelligent insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...ease }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button size="lg" asChild>
              <Link to="/categories">
                Get Started
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...ease }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <stat.icon className="size-6 text-primary mx-auto mb-3" />
                    <p className="text-2xl font-semibold mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={ease}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-semibold mb-3">
              Why Choose SmartWallet?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful features designed to simplify your financial life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...ease }}
              >
                <Card className="h-full hover:border-border hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <feature.icon className="size-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={ease}
          >
            <h2 className="text-3xl font-semibold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of users who are already managing their finances
              smarter.
            </p>
            <Button size="lg" asChild>
              <Link to="/categories">
                Start Managing Categories
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            <span className="font-semibold">SmartWallet</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 SmartWallet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
