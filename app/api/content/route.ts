import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function GET() {
  try {
    // Randomly select which news source to use
    const newsSource = Math.random() < 0.5 ? 'hackernews' : 'reddit';
    
    const [hackerNewsData, redditData, openLibraryData, gutenbergData] = await Promise.all([
      // Fetch HackerNews stories
      axios.get('https://hacker-news.firebaseio.com/v0/topstories.json'),
      
      // Fetch Reddit posts from programming and technology subreddits
      axios.get('https://www.reddit.com/r/programming+technology+coding/hot.json?limit=10'),
      
      // Fetch books from Open Library
      axios.get('https://openlibrary.org/subjects/career_development.json'),
      
      // Fetch free books from Project Gutenberg
      axios.get('https://gutendex.com/books/?topic=technology&mime_type=image')
    ]);

    // Process HackerNews - get random 5 stories
    const shuffledHNStories = shuffleArray(hackerNewsData.data.slice(0, 20));
    const hackernewsStories = await Promise.all(
      shuffledHNStories.slice(0, 5).map((id: number) =>
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      )
    );

    // Process Reddit posts
    const redditPosts = redditData.data.data.children
      .filter((post: any) => !post.data.over_18) // Filter out NSFW content
      .map((post: any) => ({
        title: post.data.title,
        description: post.data.selftext || 'Click to read more',
        url: `https://reddit.com${post.data.permalink}`,
        thumbnail: post.data.thumbnail !== 'self' ? post.data.thumbnail : 'https://www.reddit.com/favicon.ico',
        publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
        author: post.data.author
      }));

    // Combine and shuffle books from different sources
    const books = shuffleArray([
      ...openLibraryData.data.works.slice(0, 5).map((book: any) => ({
        title: book.title,
        description: book.description || 'No description available',
        type: 'book',
        url: `https://openlibrary.org${book.key}`,
        thumbnail: book.cover_id 
          ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
          : 'https://via.placeholder.com/200x300',
        publishedAt: book.first_publish_year?.toString() || 'Unknown',
        author: book.authors?.[0]?.name || 'Unknown Author'
      })),
      ...gutenbergData.data.results.slice(0, 5).map((book: any) => ({
        title: book.title,
        description: `Classic book by ${book.authors?.[0]?.name || 'Unknown Author'}`,
        type: 'book',
        url: book.formats?.['text/html'] || book.formats?.['application/pdf'],
        thumbnail: book.formats?.['image/jpeg'] || 'https://via.placeholder.com/200x300',
        publishedAt: book.copyright || 'Public Domain',
        author: book.authors?.[0]?.name || 'Unknown Author'
      }))
    ]);

    // Educational videos (since we can't use YouTube API without key)
    const videos = [
      {
        title: "Understanding Web Development",
        description: "A comprehensive guide to modern web development practices and technologies",
        type: 'video',
        url: "https://www.youtube.com/embed/Q8NPQ2RgWyg",
        thumbnail: "https://img.youtube.com/vi/Q8NPQ2RgWyg/maxresdefault.jpg",
        publishedAt: new Date().toISOString()
      },
      {
        title: "Learn Programming Basics",
        description: "Introduction to programming concepts and problem-solving",
        type: 'video',
        url: "https://www.youtube.com/embed/zOjov-2OZ0E",
        thumbnail: "https://img.youtube.com/vi/zOjov-2OZ0E/maxresdefault.jpg",
        publishedAt: new Date().toISOString()
      },
      {
        title: "Data Structures Explained",
        description: "Understanding fundamental data structures in programming",
        type: 'video',
        url: "https://www.youtube.com/embed/RBSGKlAvoiM",
        thumbnail: "https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg",
        publishedAt: new Date().toISOString()
      }
    ];

    const careerContent = {
      videos: shuffleArray(videos),
      articles: shuffleArray(newsSource === 'hackernews' 
        ? hackernewsStories.map((story: any) => ({
            title: story.data.title,
            description: story.data.text || 'Click to read more',
            type: 'article',
            url: story.data.url || `https://news.ycombinator.com/item?id=${story.data.id}`,
            thumbnail: 'https://news.ycombinator.com/favicon.ico',
            publishedAt: new Date(story.data.time * 1000).toISOString(),
            author: story.data.by
          }))
        : redditPosts
      ),
      books: books
    };

    return NextResponse.json(careerContent);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
} 