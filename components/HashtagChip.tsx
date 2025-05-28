
import React from 'react';

interface HashtagChipProps {
  tag: string;
}

export const HashtagChip: React.FC<HashtagChipProps> = ({ tag }) => {
  return (
    <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 text-sm font-medium rounded-full shadow-sm hover:bg-indigo-200 transition-colors duration-150 cursor-default">
      {tag}
    </span>
  );
};
    