import { motion } from "framer-motion";

export default function AnimatedSection({ children, className, delay = 0, x, ...props }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50, ...(x !== undefined ? { x } : {}) }}
      whileInView={{ opacity: 1, y: 0, ...(x !== undefined ? { x: 0 } : {}) }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}
