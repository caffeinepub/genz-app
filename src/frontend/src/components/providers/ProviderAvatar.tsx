import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ProviderAvatarProps {
  name: string;
  profilePictureUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProviderAvatar({ name, profilePictureUrl, size = 'md' }: ProviderAvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg',
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {profilePictureUrl && (
        <AvatarImage src={profilePictureUrl} alt={name} />
      )}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
