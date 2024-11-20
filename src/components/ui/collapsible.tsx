import React, { useState, useEffect } from "react"

interface CollapsibleProps {
  children: React.ReactNode;
  open?: boolean;
}

export const Collapsible: React.FC<CollapsibleProps> = ({ children, open = false }) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  return <div className={`collapsible ${isOpen ? 'open' : ''}`}>{children}</div>
}

export const CollapsibleTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  return <button type="button" {...props} />
}

export const CollapsibleContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
  return (
    <div className="collapsible-content" {...props}>
      {children}
    </div>
  )
}
