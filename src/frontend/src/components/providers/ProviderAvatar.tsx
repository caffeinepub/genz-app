import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getProviderInitials } from '../../utils/providerDisplayName';

interface ProviderAvatarProps {
  name: string;
  profilePictureUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProviderAvatar({ name, profilePictureUrl, size = 'md' }: ProviderAvatarProps) {
  const initials = getProviderInitials(name);

  const sizeClasses = {
    sm: 'h-10 w-10 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-lg',
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {profilePictureUrl && (
        <AvatarImage src={profilePictureUrl} alt={name || 'Provider'} />
      )}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
