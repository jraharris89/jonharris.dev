import { cn } from "../utils/cn";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}) => {
  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-lg z-[1] opacity-20 group-hover:opacity-40 blur-md transition duration-500 will-change-transform",
          animate ? "animate-gradient" : "",
          "bg-gradient-to-r from-olive-900 via-text-secondary to-olive-900 bg-[length:400%_400%]"
        )}
      />
      <div className={cn("relative bg-bg-dark rounded-lg z-10", className)}>
        {children}
      </div>
    </div>
  );
};
