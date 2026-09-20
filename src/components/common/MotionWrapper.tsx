import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { pageVariants, staggerContainer, staggerItem } from "@/lib/animations";

export interface MotionPageProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export const MotionPage: React.FC<MotionPageProps> = ({ children, className, ...props }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MotionStagger: React.FC<MotionPageProps> = ({ children, className, ...props }) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MotionItem: React.FC<MotionPageProps> = ({ children, className, ...props }) => {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  );
};
