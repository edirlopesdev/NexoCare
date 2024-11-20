import * as React from "react"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, ...props }) => {
  return <div {...props}>{src ? <img src={src} alt={alt} /> : props.children}</div>
}

export const AvatarImage: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  return <img {...props} />
}

export const AvatarFallback: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  return <div {...props} />
}
