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

export async function GET() {
  try {
    // Randomly select which news source to use
    const newsSource = Math.random() < 0.5 ? 'hackernews' : 'reddit';
    
    const [hackerNewsData, redditData, openLibraryData, gutenbergData, tedTalksData] = await Promise.all([
      // Fetch HackerNews stories
      axios.get('https://hacker-news.firebaseio.com/v0/topstories.json'),
      
      // Fetch Reddit posts from programming and technology subreddits
      axios.get('https://www.reddit.com/r/programming+technology+coding+datascience+machinelearning/hot.json?limit=15'),
      
      // Fetch books from Open Library
      axios.get('https://openlibrary.org/subjects/career_development.json'),
      
      // Fetch free books from Project Gutenberg
      axios.get('https://gutendex.com/books/?topic=technology&mime_type=image'),
      
      // Fetch TED talks (simulated with a curated list since TED API requires key)
      Promise.resolve({
        data: [
          {
            title: "The Future of AI and How It Will Change Everything",
            description: "A fascinating look at how artificial intelligence is reshaping our world",
            url: "https://www.youtube.com/embed/B-Osn1gMNtw",
            thumbnail: "https://img.youtube.com/vi/B-Osn1gMNtw/maxresdefault.jpg",
            author: "Sam Altman"
          },
          {
            title: "How to Learn Anything Fast",
            description: "Techniques to accelerate your learning in any field",
            url: "https://www.youtube.com/embed/5MgBikgcWnY",
            thumbnail: "https://img.youtube.com/vi/5MgBikgcWnY/maxresdefault.jpg",
            author: "Josh Kaufman"
          },
          {
            title: "The Power of Vulnerability",
            description: "Understanding how vulnerability shapes our personal and professional lives",
            url: "https://www.youtube.com/embed/iCvmsMzlF7o",
            thumbnail: "https://img.youtube.com/vi/iCvmsMzlF7o/maxresdefault.jpg",
            author: "Brené Brown"
          }
        ]
      })
    ]);

    // Process HackerNews - get random 5 stories
    const shuffledHNStories: number[] = shuffleArray(hackerNewsData.data.slice(0, 20));
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
        type: 'article',
        url: `https://reddit.com${post.data.permalink}`,
        thumbnail: post.data.thumbnail !== 'self' && post.data.thumbnail !== 'default' 
          ? post.data.thumbnail 
          : 'https://www.reddit.com/favicon.ico',
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

    // Educational videos (TED talks and other educational content)
    const videos = [
      ...tedTalksData.data.map((talk: any) => ({
        title: talk.title,
        description: talk.description,
        type: 'video',
        url: talk.url,
        thumbnail: talk.thumbnail,
        publishedAt: new Date().toISOString(),
        author: talk.author
      })),
      {
        title: "Understanding Web Development",
        description: "A comprehensive guide to modern web development practices and technologies",
        type: 'video',
        url: "https://www.youtube.com/embed/Q8NPQ2RgWyg",
        thumbnail: "https://img.youtube.com/vi/Q8NPQ2RgWyg/maxresdefault.jpg",
        publishedAt: new Date().toISOString(),
        author: "Traversy Media"
      },
      {
        title: "Learn Programming Basics",
        description: "Introduction to programming concepts and problem-solving",
        type: 'video',
        url: "https://www.youtube.com/embed/zOjov-2OZ0E",
        thumbnail: "https://img.youtube.com/vi/zOjov-2OZ0E/maxresdefault.jpg",
        publishedAt: new Date().toISOString(),
        author: "freeCodeCamp"
      }
    ];

    // Short-form videos (TikTok/Reels style)
    const shortVideos = [
      {
        title: "Quick JavaScript Tip",
        description: "Learn this one trick to simplify your code",
        type: 'tiktok',
        url: "https://www.youtube.com/embed/DHjqpvDnNGE",
        thumbnail: "https://img.youtube.com/vi/DHjqpvDnNGE/maxresdefault.jpg",
        publishedAt: new Date().toISOString(),
        author: "CodeWithHarry"
      },
      {
        title: "CSS Animation in 60 Seconds",
        description: "Create stunning animations with just a few lines of CSS",
        type: 'tiktok',
        url: "https://www.youtube.com/embed/YszONjKpgg4",
        thumbnail: "https://img.youtube.com/vi/YszONjKpgg4/maxresdefault.jpg",
        publishedAt: new Date().toISOString(),
        author: "WebDevSimplified"
      }
    ];

    const careerContent = {
      videos: shuffleArray(videos),
      tiktoks: shuffleArray(shortVideos),
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
        ...careerContent.videos.map((item: any) => ({ ...item, id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })),
        ...careerContent.tiktoks.map((item: any) => ({ ...item, id: `tiktok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })),
        ...careerContent.articles.map((item: any) => ({ ...item, id: `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })),
        ...careerContent.books.map((item: any) => ({ ...item, id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }))
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

    return NextResponse.json(careerContent);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
} 