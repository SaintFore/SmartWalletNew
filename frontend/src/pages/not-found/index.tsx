import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/shared/ui/button";

const smooth = { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const };

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={smooth}
        className="text-center px-4"
      >
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, ...smooth }}
          className="text-8xl font-bold text-primary/20 mb-4"
        >
          404
        </motion.p>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
