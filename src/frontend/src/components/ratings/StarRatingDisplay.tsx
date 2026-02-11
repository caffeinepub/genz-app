import { Star } from 'lucide-react';

interface StarRatingDisplayProps {
  averageRating: number;
  totalRatings: number;
  showEmpty?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRatingDisplay({
  averageRating,
  totalRatings,
  showEmpty = true,
  size = 'md',
}: StarRatingDisplayProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (totalRatings === 0) {
    if (!showEmpty) return null;
    
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Star className={`${sizeClasses[size]} fill-muted stroke-muted-foreground`} />
        <span className={textSizeClasses[size]}>No ratings yet</span>
      </div>
    );
  }

  const fullStars = Math.floor(averageRating);
  const hasHalfStar = averageRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${sizeClasses[size]} fill-primary text-primary`}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${sizeClasses[size]} fill-muted text-muted`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className={`${sizeClasses[size]} fill-primary text-primary`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${sizeClasses[size]} fill-muted text-muted`}
          />
        ))}
      </div>
      
      <span className={`${textSizeClasses[size]} font-medium`}>
        {averageRating.toFixed(1)} ({totalRatings})
      </span>
    </div>
  );
}
