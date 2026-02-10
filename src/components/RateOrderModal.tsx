import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';

interface RateOrderModalProps {
  storeName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export default function RateOrderModal({ storeName, onClose, onSubmit }: RateOrderModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-onyx/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gold-100">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-creme">
          <h3 className="font-serif font-bold text-xl text-onyx">Rate Your Order</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gold-100 rounded-full transition text-gray-500 hover:text-onyx"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Prompt */}
          <p className="text-sm text-gray-500 mb-6">
            How was your experience with{' '}
            <span className="font-bold text-onyx">{storeName}</span>?
          </p>

          {/* Star Selector */}
          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={`w-8 h-8 ${
                    rating >= star
                      ? 'text-gold-500 fill-gold-500'
                      : 'text-gray-200'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          {/* Comment Textarea */}
          <textarea
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 h-24 resize-none
                       focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none
                       text-sm text-onyx placeholder:text-gray-400 mb-6"
            placeholder="Share details of your experience... (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs
                       flex items-center justify-center gap-2 transition-all
                       ${rating > 0
                         ? 'bg-onyx text-gold-400 hover:bg-gray-800 shadow-lg shadow-onyx/10'
                         : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                       }`}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
