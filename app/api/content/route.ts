/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '../../firebase/config';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Helper function to generate a unique ID
function generateUniqueId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    // APIs configuration
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyC7PUwQK8tqXZqToQOD_U_E0hcmbw1orLU'; // Replace with your actual API key or set in environment
    const NEWS_API_KEY = process.env.NEWS_API_KEY || 'YOUR_NEWS_API_KEY'; // Replace with your actual API key or set in environment

    // Arrays to store fetched content
    let articles: any[] = [];
    let books: any[] = [];
    let videos: any[] = [];
    let shortVideos: any[] = [];

    // Fetch content from multiple APIs in parallel
    try {
      const [
        hackerNewsData,
        redditData,
        openLibraryData,
        gutenbergData,
        youtubeData,
        newsApiData,
        devToData,
        mediumData
      ] = await Promise.allSettled([
        // HackerNews Top Stories
        axios.get('https://hacker-news.firebaseio.com/v0/topstories.json'),
        
        // Reddit posts from tech and programming related subreddits
        axios.get('https://www.reddit.com/r/programming+technology+coding+datascience+machinelearning+webdev+learnprogramming/hot.json?limit=25'),
        
        // Books from Open Library
        axios.get('https://openlibrary.org/subjects/computer_science.json?limit=20'),
        
        // Free books from Project Gutenberg
        axios.get('https://gutendex.com/books/?topic=technology&mime_type=image'),
        
        // YouTube videos on programming and technology
        axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=programming%20tutorial&type=video&key=${YOUTUBE_API_KEY}&relevanceLanguage=en&videoDuration=medium`),
        
        // News API for tech articles
        axios.get(`https://newsapi.org/v2/top-headlines?category=technology&pageSize=10&language=en&apiKey=${NEWS_API_KEY}`),
        
        // Dev.to articles
        axios.get('https://dev.to/api/articles?top=15&per_page=10'),
        
        // Medium articles through their RSS feed (converted to JSON via API)
        axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/topic/technology')
      ]);

      // Process HackerNews data if successful
      if (hackerNewsData.status === 'fulfilled') {
        const shuffledHNStories: number[] = shuffleArray(hackerNewsData.value.data.slice(0, 25));
        const storyRequests = shuffledHNStories.slice(0, 10).map((id: number) =>
          axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        );
        
        const storyResponses = await Promise.allSettled(storyRequests);
        const hackernewsStories = storyResponses
          .filter(response => response.status === 'fulfilled')
          .map((response: any) => {
            const story = response.value.data;
            return {
              id: generateUniqueId('article'),
              title: story.title,
              description: story.text || 'Click to read more',
              type: 'article',
              url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
              thumbnail: 'https://news.ycombinator.com/favicon.ico',
              publishedAt: new Date(story.time * 1000).toISOString(),
              author: story.by,
              source: 'HackerNews'
            };
          });
        
        articles = [...articles, ...hackernewsStories];
      }

      // Process Reddit data if successful
      if (redditData.status === 'fulfilled') {
        const redditPosts = redditData.value.data.data.children
          .filter((post: any) => !post.data.over_18) // Filter out NSFW content
          .map((post: any) => ({
            id: generateUniqueId('article'),
            title: post.data.title,
            description: post.data.selftext?.substring(0, 200) || 'Click to read more',
            type: 'article',
            url: `https://reddit.com${post.data.permalink}`,
            thumbnail: post.data.thumbnail !== 'self' && post.data.thumbnail !== 'default' 
              ? post.data.thumbnail 
              : 'https://www.reddit.com/favicon.ico',
            publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
            author: post.data.author,
            source: 'Reddit'
          }));
        
        articles = [...articles, ...redditPosts];
      }

      // Process Open Library data if successful
      if (openLibraryData.status === 'fulfilled') {
        const openLibraryBooks = openLibraryData.value.data.works.map((book: any) => ({
          id: generateUniqueId('book'),
          title: book.title,
          description: book.description?.value || book.description || 'No description available',
          type: 'book',
          url: `https://openlibrary.org${book.key}`,
          thumbnail: book.cover_id 
            ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
            : 'https://openlibrary.org/images/icons/avatar_book.png',
          publishedAt: book.first_publish_year?.toString() || 'Unknown',
          author: book.authors?.[0]?.name || 'Unknown Author',
          source: 'Open Library'
        }));
        
        books = [...books, ...openLibraryBooks];
      }

      // Process Gutenberg data if successful
      if (gutenbergData.status === 'fulfilled') {
        const gutenbergBooks = gutenbergData.value.data.results.map((book: any) => ({
          id: generateUniqueId('book'),
          title: book.title,
          description: `Classic book by ${book.authors?.[0]?.name || 'Unknown Author'}`,
          type: 'book',
          url: book.formats?.['text/html'] || book.formats?.['application/pdf'] || book.formats?.['text/plain'],
          thumbnail: book.formats?.['image/jpeg'] || 'https://www.gutenberg.org/gutenberg/pg-logo-129x80.png',
          publishedAt: book.copyright || 'Public Domain',
          author: book.authors?.[0]?.name || 'Unknown Author',
          source: 'Project Gutenberg'
        }));
        
        books = [...books, ...gutenbergBooks];
      }

      // Process YouTube data if successful
      if (youtubeData.status === 'fulfilled') {
        const youtubeVideos = youtubeData.value.data.items.map((video: any) => ({
          id: generateUniqueId('video'),
          title: video.snippet.title,
          description: video.snippet.description,
          type: 'video',
          url: `https://www.youtube.com/embed/${video.id.videoId}`,
          thumbnail: video.snippet.thumbnails.high.url,
          publishedAt: video.snippet.publishedAt,
          author: video.snippet.channelTitle,
          source: 'YouTube'
        }));
        
        // Split videos into regular and short videos based on duration
        const longVideos = youtubeVideos.slice(0, Math.ceil(youtubeVideos.length * 0.7));
        const short = youtubeVideos.slice(Math.ceil(youtubeVideos.length * 0.7));
        
        videos = [...videos, ...longVideos];
        shortVideos = [...shortVideos, ...short.map((v: any) => ({...v, type: 'shortvideo'}))];
      }

      // Process News API data if successful
      if (newsApiData.status === 'fulfilled') {
        const newsArticles = newsApiData.value.data.articles.map((article: any) => ({
          id: generateUniqueId('article'),
          title: article.title,
          description: article.description || 'Click to read more',
          type: 'article',
          url: article.url,
          thumbnail: article.urlToImage || 'https://via.placeholder.com/150',
          publishedAt: article.publishedAt,
          author: article.author || article.source.name,
          source: 'NewsAPI'
        }));
        
        articles = [...articles, ...newsArticles];
      }

      // Process Dev.to data if successful
      if (devToData.status === 'fulfilled') {
        const devToArticles = devToData.value.data.map((article: any) => ({
          id: generateUniqueId('article'),
          title: article.title,
          description: article.description || 'Click to read more',
          type: 'article',
          url: article.url,
          thumbnail: article.cover_image || article.social_image || 'https://dev-to-uploads.s3.amazonaws.com/uploads/logos/resized_logo_UQww2soKuUsjaOGNB38o.png',
          publishedAt: article.published_at,
          author: article.user.name,
          source: 'Dev.to'
        }));
        
        articles = [...articles, ...devToArticles];
      }

      // Process Medium data if successful
      if (mediumData.status === 'fulfilled') {
        const mediumArticles = mediumData.value.data.items.map((article: any) => ({
          id: generateUniqueId('article'),
          title: article.title,
          description: article.description?.substring(0, 200) || 'Click to read more',
          type: 'article',
          url: article.link,
          thumbnail: article.thumbnail || 'https://miro.medium.com/fit/c/96/96/1*sHhtYhaCe2Uc3IU0IgKwIQ.png',
          publishedAt: article.pubDate,
          author: article.author,
          source: 'Medium'
        }));
        
        articles = [...articles, ...mediumArticles];
      }

      // Attempt to fetch additional YouTube content for more diversity (educational content)
      try {
        const [
          youtubeEducationalData,
          youtubeTutorialData,
          youtubeShortData
        ] = await Promise.allSettled([
          // Educational content
          axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=educational%20technology&type=video&key=${YOUTUBE_API_KEY}&relevanceLanguage=en`),
          
          // Coding tutorials
          axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=coding%20tutorials&type=video&key=${YOUTUBE_API_KEY}&relevanceLanguage=en`),
          
          // Short videos (using #shorts tag)
          axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=programming%20%23shorts&type=video&key=${YOUTUBE_API_KEY}&videoDuration=short`)
        ]);

        // Process additional YouTube educational content
        if (youtubeEducationalData.status === 'fulfilled') {
          const educationalVideos = youtubeEducationalData.value.data.items.map((video: any) => ({
            id: generateUniqueId('video'),
            title: video.snippet.title,
            description: video.snippet.description,
            type: 'video',
            url: `https://www.youtube.com/embed/${video.id.videoId}`,
            thumbnail: video.snippet.thumbnails.high.url,
            publishedAt: video.snippet.publishedAt,
            author: video.snippet.channelTitle,
            source: 'YouTube'
          }));
          
          videos = [...videos, ...educationalVideos];
        }

        // Process additional YouTube tutorials
        if (youtubeTutorialData.status === 'fulfilled') {
          const tutorialVideos = youtubeTutorialData.value.data.items.map((video: any) => ({
            id: generateUniqueId('video'),
            title: video.snippet.title,
            description: video.snippet.description,
            type: 'video',
            url: `https://www.youtube.com/embed/${video.id.videoId}`,
            thumbnail: video.snippet.thumbnails.high.url,
            publishedAt: video.snippet.publishedAt,
            author: video.snippet.channelTitle,
            source: 'YouTube'
          }));
          
          videos = [...videos, ...tutorialVideos];
        }

        // Process short videos (#shorts)
        if (youtubeShortData.status === 'fulfilled') {
          const shorts = youtubeShortData.value.data.items.map((video: any) => ({
            id: generateUniqueId('shortvideo'),
            title: video.snippet.title,
            description: video.snippet.description,
            type: 'shortvideo',
            url: `https://www.youtube.com/embed/${video.id.videoId}`,
            thumbnail: video.snippet.thumbnails.high.url,
            publishedAt: video.snippet.publishedAt,
            author: video.snippet.channelTitle,
            source: 'YouTube Shorts'
          }));
          
          shortVideos = [...shortVideos, ...shorts];
        }
      } catch (youtubeError) {
        console.error('Error fetching additional YouTube content:', youtubeError);
        // Continue even if additional YouTube fetching fails
      }

      // Try to fetch TED Talks from their RSS feed
      try {
        const tedTalksResponse = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/tedtalks_video');
        
        if (tedTalksResponse.data.status === 'ok') {
          const tedVideos = tedTalksResponse.data.items.map((item: any) => {
            // Extract YouTube ID from content if available
            const youtubeIdMatch = item.content.match(/youtube\.com\/embed\/([^"&?\/\s]+)/);
            const youtubeId = youtubeIdMatch ? youtubeIdMatch[1] : null;
            
            // Extract thumbnail from content or use default
            const thumbnailMatch = item.content.match(/src="(https:\/\/img\.youtube\.com\/vi\/[^"]+)"/);
            const thumbnail = thumbnailMatch ? thumbnailMatch[1] : 'https://pi.tedcdn.com/r/pe.tedcdn.com/images/ted/favicon.png';
            
            return {
              id: generateUniqueId('video'),
              title: item.title,
              description: item.description?.substring(0, 200) || 'TED Talk',
              type: 'video',
              url: youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : item.link,
              thumbnail: thumbnail,
              publishedAt: item.pubDate,
              author: item.author,
              source: 'TED Talks'
            };
          });
          
          videos = [...videos, ...tedVideos];
        }
      } catch (tedError) {
        console.error('Error fetching TED Talks:', tedError);
        // Continue even if TED Talks fetching fails
      }

      // Try to fetch data from Free Programming Books API
      try {
        const programmingBooksResponse = await axios.get('https://api.github.com/repos/EbookFoundation/free-programming-books/contents/books/free-programming-books-langs.md');
        
        if (programmingBooksResponse.status === 200) {
          const content = Buffer.from(programmingBooksResponse.data.content, 'base64').toString();
          
          // Extract books using regex (simple extraction)
          const bookMatches = Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));
          
          const programmingBooks = bookMatches.slice(0, 15).map((match) => ({
            id: generateUniqueId('book'),
            title: match[1],
            description: 'Free programming book from GitHub repository',
            type: 'book',
            url: match[2],
            thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            publishedAt: 'N/A',
            author: 'Various Authors',
            source: 'Free Programming Books'
          }));
          
          books = [...books, ...programmingBooks];
        }
      } catch (booksError) {
        console.error('Error fetching free programming books:', booksError);
        // Continue even if programming books fetching fails
      }

      // Try to fetch data from FreeCodeCamp News API
      try {
        const fccResponse = await axios.get('https://www.freecodecamp.org/news/ghost/api/v3/content/posts/?key=YOUR_FCC_API_KEY&limit=10');
        
        if (fccResponse.status === 200) {
          const fccArticles = fccResponse.data.posts.map((post: any) => ({
            id: generateUniqueId('article'),
            title: post.title,
            description: post.excerpt || 'FreeCodeCamp article',
            type: 'article',
            url: `https://www.freecodecamp.org/news/${post.slug}`,
            thumbnail: post.feature_image || 'https://cdn.freecodecamp.org/universal/favicons/favicon-32x32.png',
            publishedAt: post.published_at,
            author: post.primary_author?.name || 'FreeCodeCamp',
            source: 'FreeCodeCamp News'
          }));
          
          articles = [...articles, ...fccArticles];
        }
      } catch (fccError) {
        console.error('Error fetching FreeCodeCamp content:', fccError);
        // Continue even if FreeCodeCamp fetching fails
      }

      // Try to fetch data from Unsplash API for some visual content (can be used as thumbnails)
      try {
        const unsplashResponse = await axios.get(`https://api.unsplash.com/photos/random?count=10&query=technology&client_id=YOUR_UNSPLASH_API_KEY`);
        
        if (unsplashResponse.status === 200) {
          // Store these for potential thumbnail use if needed
          // const unsplashImages = unsplashResponse.data.map((img: any) => ({
          //   id: img.id,
          //   url: img.urls.regular,
          //   thumbnail: img.urls.thumb
          // }));
          
          // These could be used as fallback thumbnails for content missing images
        }
      } catch (unsplashError) {
        console.error('Error fetching Unsplash content:', unsplashError);
        // Continue execution
      }
      
      // Final shuffling of all content
      articles = shuffleArray(articles);
      books = shuffleArray(books);
      videos = shuffleArray(videos);
      shortVideos = shuffleArray(shortVideos);

      // Create the final content object
      const careerContent = {
        videos: videos,
        shortVideos: shortVideos,
        articles: articles,
        books: books
      };

      // Clear existing content in Firestore and save new content
      try {
        // Get all existing content documents
        const contentCollection = collection(db, 'content');
        const contentSnapshot = await getDocs(contentCollection);
        
        // Delete all existing content documents
        const deletePromises = contentSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Save new content to Firestore
        const allContent = [
          ...careerContent.videos,
          ...careerContent.shortVideos,
          ...careerContent.articles,
          ...careerContent.books
        ];
        
        // Save each content item as a separate document
        const savePromises = allContent.map(item => 
          setDoc(doc(db, 'content', item.id), {
            ...item,
            createdAt: new Date().toISOString()
          })
        );
        
        await Promise.all(savePromises);
        console.log('Content saved to Firestore successfully');
      } catch (firestoreError) {
        console.error('Error saving to Firestore:', firestoreError);
        // Continue to return the content even if Firestore save fails
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Content updated in Firestore',
        stats: {
          videos: videos.length,
          shortVideos: shortVideos.length,
          articles: articles.length,
          books: books.length,
          total: videos.length + shortVideos.length + articles.length + books.length
        }
      });
    } catch (apiError) {
      console.error('Error fetching from APIs:', apiError);
      return NextResponse.json(
        { error: 'Failed to fetch content from APIs', details: (apiError as any).message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('General error during execution:', error);
    return NextResponse.json(
      { error: 'Failed to process content request', details: (error as Error).message },
      { status: 500 }
    );
  }
}