import { type ReactNode, type MouseEvent, forwardRef, type ButtonHTMLAttributes, CSSProperties } from "react";

// Event handler type for the button
type EventHandler = (event: MouseEvent<HTMLButtonElement>) => void;

// Props for the button where either 'onClick' or 'onMouseDown' can be used, but not both.
type ButtonProps = {
  onClick?: EventHandler;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
} & ButtonHTMLAttributes<HTMLButtonElement>;

// Forward ref with conditional event handler
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ onClick, children, className = '', style = {}, ...rest }, ref) => {
    // Check which event handler is available and assign it

    return (
      <button
        style={style}
        ref={ref}
        onClick={onClick} // Use the assigned event handler for onClick
        className={`${className} cursor-pointer active:scale-95 scale-100 transition-transform`}
        {...rest}
      >
          {children}
      </button>
    );
  }
);

export default Button;