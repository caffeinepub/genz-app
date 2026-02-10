import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

interface FeaturedProviderAvatarProps {
  name: string;
  imagePath: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
};

export function FeaturedProviderAvatar({ name, imagePath, size = 'md' }: FeaturedProviderAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {!imageError && (
        <AvatarImage
          src={imagePath}
          alt={name}
          className="object-cover"
          onError={() => setImageError(true)}
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
