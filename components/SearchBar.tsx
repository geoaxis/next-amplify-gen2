import React, { ChangeEvent } from 'react';

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search videos..."
        className="px-4 py-2 border rounded-md w-full"
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;