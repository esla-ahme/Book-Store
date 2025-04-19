import React from 'react'
import books from "../data/books.json"
import BookCard from '../components/Cards/BookCard'
import AuthorCard from '../components/Cards/AuthorCard'
const Home = () => {
    const title = import.meta.env.VITE_APP_TITLE
    console.log(books)
    return (
    <div>{title}
    
    <p>Welcome to the Home Page!</p>
    <BookCard title={"The Great Gatsby"} author={"F. Scott Fitzgerald"} stores={[{
        name: "Amazon",
        price: 10.99
    },
    {
        name: "Barnes & Noble",
        price: 12.99
    }]} />
    <AuthorCard name={"F. Scott Fitzgerald"} noOfBooks={books.length} />
    </div>
  )
}

export default Home