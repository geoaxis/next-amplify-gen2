import * as google from '@googleapis/youtube';
// pages/index.tsx
import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import InfiniteScroll from 'react-infinite-scroll-component';
import VideoCard from '../components/VideoCard';

interface VideoData {
  id: string;
  videoThumbnail: string;
  videoTitle: string;
  videoDescription: string;
  videoPlays: number;
  cardSize: 'small' | 'medium' | 'large';
}

interface HomeProps {
  items: VideoData[];
  lastUpdated: string;
}

const PAGE_SIZE = 10;



const Home: React.FC<HomeProps> = ({ items, lastUpdated }) => {
  const [visibleItems, setVisibleItems] = useState(items.slice(0, PAGE_SIZE));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadMoreItems = () => {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * PAGE_SIZE;
    const endIndex = nextPage * PAGE_SIZE;

    const additionalItems = items
      .filter(
        (video) =>
          video.videoTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.videoDescription.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(startIndex, endIndex);

    if (additionalItems.length > 0) {
      setVisibleItems((prevItems) => [...prevItems, ...additionalItems]);
      setCurrentPage(nextPage);
    }
  };

  const updateVisibleItems = (term: string) => {
    const filteredItems = items.filter(
      (video) =>
        video.videoTitle.toLowerCase().includes(term.toLowerCase()) ||
        video.videoDescription.toLowerCase().includes(term.toLowerCase())
    );

    setVisibleItems(filteredItems.slice(0, PAGE_SIZE));
    setCurrentPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    updateVisibleItems(term);
  };

  useEffect(() => {
    setVisibleItems(items.slice(0, PAGE_SIZE));
    setCurrentPage(1);
  }, []); // Empty dependency array to run only on mount

  return (
    <div>
      <h1 className="title">re:Invent 2023 - Most Played Videos</h1>
      <p>Last Updated: {lastUpdated}</p>

      <input
        type="text"
        placeholder="Search videos..."
        className="search-bar"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <InfiniteScroll
        dataLength={visibleItems.length}
        next={loadMoreItems}
        hasMore={visibleItems.length < items.length}
        loader={<h4>Loading...</h4>}
      >
        {visibleItems.map((video) => (
          <VideoCard
            key={video.id}
            title={video.videoTitle}
            description={video.videoDescription}
            views={video.videoPlays}
            imageUrl={video.videoThumbnail}
            videoId={video.id}
            searchTerm={searchTerm}
          />
        ))}
      </InfiniteScroll>

      <p>Last Updated: {lastUpdated}</p>
    </div>
  );
};






let getMainDescription = (fullDescription: string) => {

  //includes regexp for a timestamp
  let result = fullDescription.split(/(?:Subscribe|Guest Speakers|\b\d{2}:\d{2}\b)+/)[0];;

  if (result == null || result == "") { return fullDescription; }
  else return result;
}
export async function getStaticProps() {

  // Create a new instance of the 'Youtube' class
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY // specify your API key here
  });



  const playlistIds = process.env.PLAYLIST?.split(',');
  let dataMap = new Map();

  if (playlistIds != null) {
    for (const playlistId of playlistIds) {
      let firstTime = true;
      let hasNextToken = false;
      let next = '';

      while (firstTime || hasNextToken) {
        firstTime = false;

        const items = await youtube.playlistItems.list({
          "part": [
            "snippet,contentDetails"
          ],
          "maxResults": 50,
          "pageToken": next,
          "playlistId": playlistId
        });

        if (items.data.nextPageToken != null &&
          (items.data.prevPageToken === undefined || items.data.nextPageToken != items.data.prevPageToken)) {
          hasNextToken = true;
          next = items.data.nextPageToken;
        } else {
          hasNextToken = false;
        }

        let ids = items.data.items?.reduce((a, c) => a.concat(String(c.contentDetails?.videoId)), new Array());

        const result = await youtube.videos.list({
          "part": [
            "snippet,contentDetails,statistics,id"
          ],
          "id": ids
        });

        result.data.items?.forEach(element => {
          dataMap.set(element.id, element);
        });
      }
    }
  }

  const data = Array.from(dataMap.values()).sort((a, b) => Number(b.statistics?.viewCount) - Number(a.statistics?.viewCount));


  const getRandomSize = (): string => {
    const sizes = ['small', 'medium', 'large'];
    const randomIndex = Math.floor(Math.random() * sizes.length);
    return sizes[randomIndex];
  };

  const lastUpdated = new Date().toLocaleString('sv-SE', {
    timeZone: 'Europe/Berlin',
  });

  const items = data?.reduce((a, c) => a.concat({ id: c.id, videoThumbnail: c.snippet.thumbnails.medium.url, videoTitle: c.snippet.title, videoDescription: getMainDescription(c.snippet.description), videoPlays: c.statistics.viewCount, cardSize: getRandomSize() }), new Array());




  // Pass data to the page via props
  return {
    props: { items, lastUpdated },
    revalidate: 3600 // revalidate every hour
  };
}

export default Home;