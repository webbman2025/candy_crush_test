import React from "react";

export default function AppImage({
  src,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const contentPath = "";
  return <img {...props} src={`${contentPath}${src}`} />;
}
