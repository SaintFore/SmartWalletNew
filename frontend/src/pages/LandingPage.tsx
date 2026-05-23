import { motion } from "framer-motion";
import { Link } from "react-router";
import { ArrowRight, Zap, Layers, Code, Route, Database, FileInput, Sparkles, Shield, Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { Button } from "@/components/ui/button";

const smooth = { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const };

const techStack = [
  { name: "React 19", icon: Layers, color: "bg-sky-500" },
  { name: "TypeScript", icon: Code, color: "bg-blue-600" },
  { name: "Vite", icon: Zap, color: "bg-yellow-500" },
  { name: "Tailwind CSS", icon: Sparkles, color: "bg-cyan-500" },
  { name: "React Router", icon: Route, color: "bg-red-500" },
  { name: "React Query", icon: Database, color: "bg-amber-500" },
  { name: "React Hook Form", icon: FileInput, color: "bg-pink-500" },
  { name: "shadcn/ui", icon: Shield, color: "bg-violet-600" },
];

export default function LandingPage() {
  const { dark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, ...smooth }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-1 bg-background/90 backdrop-blur-xl rounded-full px-2 py-2 shadow-lg shadow-black/5 border border-border"
        >
          <Link
            to="/"
            className="px-5 py-2.5 text-sm font-medium text-foreground bg-accent rounded-full"
          >
            Home
          </Link>
          <Link
            to="/items"
            className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
          >
            Items Demo
          </Link>
          <button
            onClick={toggle}
            className="p-2.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </motion.div>
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.05] rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-chart-4/[0.05] rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={smooth}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
          >
            Your Project
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Starts Here
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...smooth }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            A production-ready React + TypeScript template with routing, data
            fetching, form validation, and a type-safe API client — all wired
            up and ready to go.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...smooth }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild>
              <Link to="/items">
                View Items Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/SaintFore/vite-template-react"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={smooth}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">Tech Stack</h2>
            <p className="text-muted-foreground">
              Every dependency is actually used — no bloat
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, ...smooth }}
                whileHover={{ y: -4 }}
                className="group p-5 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-lg transition-all"
              >
                <div
                  className={`w-10 h-10 ${tech.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <tech.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{tech.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Structure */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={smooth}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold mb-3">Project Structure</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, ...smooth }}
            className="bg-card rounded-2xl border border-border p-6 font-mono text-sm"
          >
            <pre className="text-foreground">
{`src/
├── api/          # openapi-fetch client + auto-generated types
├── components/   # Reusable components
│   └── ui/       # shadcn/ui components
├── hooks/        # Custom hooks (queries, mutations, utils)
├── lib/          # Utility functions
├── pages/        # Route pages
├── schemas/      # Zod validation schemas
├── App.tsx       # Router config
└── main.tsx      # Entry point + providers`}
            </pre>
          </motion.div>
        </div>
      </section>

      {/* Scripts */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={smooth}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold mb-3">Quick Start</h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { cmd: "pnpm dev", desc: "Dev server" },
              { cmd: "pnpm build", desc: "Type check + build" },
              { cmd: "pnpm lint", desc: "ESLint" },
              { cmd: "pnpm gen:api", desc: "Regenerate API types" },
            ].map((script) => (
              <div
                key={script.cmd}
                className="p-4 rounded-xl bg-card border border-border/50 text-center"
              >
                <code className="text-sm font-medium text-primary">
                  {script.cmd}
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  {script.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-semibold">Vite Template React</span>
          <p className="text-sm text-muted-foreground">Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
}
