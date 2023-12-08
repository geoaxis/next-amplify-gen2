// components/VideoCard.tsx
import React from 'react';

interface VideoCardProps {
  title: string;
  description: string;
  views: number;
  imageUrl: string;
  videoId: string;
  searchTerm: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, description, views, imageUrl, videoId, searchTerm }) => {
  const handleClick = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const highlightText = (text: string) => {
    if (searchTerm) {
      const regex = new RegExp(`(${searchTerm})`, 'gi');
      return text.split(regex).map((part, index) => (regex.test(part) ? <mark key={index}>{part}</mark> : part));
    }
    return text;
  };

  return (
    <div className="video-card" onClick={handleClick}>
      <div className="left-part">
        <div className="video-thumbnail">
          <img src={imageUrl} ></img>
          <div className="overlay">
            <p>Views: {views}</p>
            <h2>{highlightText(title)}</h2>
          </div>
        </div>
      </div>
      <div className="right-part">
        <p>{highlightText(description)}</p>
      </div>
    </div>
  );
};

export default VideoCard;
