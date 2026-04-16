
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Processing...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingSpinner;