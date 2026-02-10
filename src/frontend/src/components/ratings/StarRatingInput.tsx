import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

export function StarRatingInput({ value, onChange, readonly = false }: StarRatingInputProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`h-8 w-8 ${
              star <= value
                ? 'fill-primary text-primary'
                : 'fill-none text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
