// src/pages/Inventory.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Loading from '../pages/Loading';
import BooksTable from '../components/BooksTable';
import Modal from '../components/Modal';
import Header from '../components/Header';

const Inventory = () => {
  // State for data
  const [stores, setStores] = useState([]);
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [inventory, setInventory] = useState([]); // Store-book mappings

  // State for UI
  const [activeTab, setActiveTab] = useState('books');
  const [searchParams] = useSearchParams();
  const { storeId } = useParams();
  const [editingRowId, setEditingRowId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [price, setPrice] = useState(''); // Price input for the modal

  // Fetch all data
  useEffect(() => {
    fetch('/data/stores.json')
      .then((response) => response.json())
      .then((data) => setStores(Array.isArray(data) ? data : [data]))
      .catch((error) => console.error('Error fetching stores:', error));

    fetch('/data/books.json')
      .then((response) => response.json())
      .then((data) => setBooks(Array.isArray(data) ? data : [data]))
      .catch((error) => console.error('Error fetching books:', error));

    fetch('/data/authors.json')
      .then((response) => response.json())
      .then((data) => setAuthors(Array.isArray(data) ? data : [data]))
      .catch((error) => console.error('Error fetching authors:', error));

    fetch('/data/inventory.json')
      .then((response) => response.json())
      .then((data) => setInventory(Array.isArray(data) ? data : [data]))
      .catch((error) => console.error('Error fetching inventory:', error));
  }, []);

  // Get search term and view from query params
  const searchTerm = searchParams.get('search') || '';
  const view = searchParams.get('view') || 'books';

  // Set active tab based on view query param
  useEffect(() => {
    if (view === 'authors' || view === 'books') {
      setActiveTab(view);
    }
  }, [view]);

  // Create a lookup map for authors
  const authorMap = useMemo(() => {
    return authors.reduce((map, author) => {
      map[author.id] = { ...author, name: `${author.first_name} ${author.last_name}` };
      return map;
    }, {});
  }, [authors]);

  // Filter books for the selected store and include price from inventory
  const storeBooks = useMemo(() => {
    if (!storeId) return books;

    const storeInventory = inventory.filter((item) => item.store_id === parseInt(storeId, 10));

    let filteredBooks = books
      .filter((book) => storeInventory.some((item) => item.book_id === book.id))
      .map((book) => {
        const inventoryItem = storeInventory.find((item) => item.book_id === book.id);
        return { ...book, price: inventoryItem ? inventoryItem.price : null };
      });

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredBooks = filteredBooks.filter((book) =>
        Object.values({ ...book, author_name: authorMap[book.author_id]?.name || 'Unknown Author' })
          .some((value) => String(value).toLowerCase().includes(lowerSearch))
      );
    }

    return filteredBooks;
  }, [storeId, books, inventory, searchTerm, authorMap]);

  // Group books by author for the Authors tab
  const booksByAuthor = useMemo(() => {
    const grouped = {};
    storeBooks.forEach((book) => {
      const authorId = book.author_id;
      if (!grouped[authorId]) {
        grouped[authorId] = {
          author: authorMap[authorId] || { name: 'Unknown Author' },
          books: [],
        };
      }
      grouped[authorId].books.push(book);
    });
    return Object.values(grouped);
  }, [storeBooks, authorMap]);

  // Handle book deletion
  const deleteBook = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from this store?`)) {
      setInventory((prevInventory) =>
        prevInventory.filter((item) => item.book_id !== id || item.store_id !== parseInt(storeId, 10))
      );
    }
  };

  // Modal controls
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setSelectedBookId('');
    setPrice('');
  };

  // Update price input when a book is selected
  useEffect(() => {
    if (selectedBookId) {
      const bookInStore = inventory.find(
        (item) => item.store_id === parseInt(storeId, 10) && item.book_id === parseInt(selectedBookId, 10)
      );
      setPrice(bookInStore ? bookInStore.price.toString() : '');
    } else {
      setPrice('');
    }
  }, [selectedBookId, inventory, storeId]);

  // Handle adding/updating a book in the store
  const handleAddToStore = () => {
    if (!selectedBookId) {
      alert('Please select a book');
      return;
    }

    if (!price || isNaN(parseFloat(price))) {
      alert('Please enter a valid price');
      return;
    }

    const bookId = parseInt(selectedBookId, 10);
    const bookPrice = parseFloat(price);
    const bookInStore = inventory.find(
      (item) => item.store_id === parseInt(storeId, 10) && item.book_id === bookId
    );

    if (bookInStore) {
      // Update existing book's price
      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.store_id === parseInt(storeId, 10) && item.book_id === bookId
            ? { ...item, price: bookPrice }
            : item
        )
      );
    } else {
      // Add new book to inventory with price
      setInventory((prevInventory) => [
        ...prevInventory,
        { store_id: parseInt(storeId, 10), book_id: bookId, price: bookPrice },
      ]);
    }

    closeModal();
  };

  // Get current store name
  const currentStore = stores.find((store) => store.id === parseInt(storeId, 10));
  const storeName = currentStore ? currentStore.name : 'All Stores';

  if (!stores.length || !books.length || !authors.length || !inventory.length) {
    return <Loading />;
  }

  return (
    <div className="py-6">
      {/* Tabs */}
      <div className="flex mb-4 w-full justify-center items-center">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 border-b-2 py-2 ${activeTab === 'books' ? ' border-b-main ' : 'border-b-transparent'} `}
        >
          Books
        </button>
        <button
          onClick={() => setActiveTab('authors')}
          className={`px-4 border-b-2 py-2 ${activeTab === 'authors' ? ' border-b-main ' : 'border-b-transparent'} `}
        >
          Authors
        </button>
      </div>

      <Header addNew={openModal} title={`Store: ${storeName} Inventory`} buttonTitle="Add to inventory" />

      {/* Tab Content */}
      {activeTab === 'books' ? (
        storeBooks.length > 0 ? (
          <BooksTable
            books={storeBooks}
            authors={authors}
            editingRowId={editingRowId}
            setEditingRowId={setEditingRowId}
            editName={editName}
            setEditName={setEditName}
            setBooks={setBooks}
            deleteBook={deleteBook}
            columnsConfig={['id', 'name', 'pages', 'author', 'price', 'actions']}
          />
        ) : (
          <p className="text-gray-600">No books found in this store.</p>
        )
      ) : (
        booksByAuthor.length > 0 ? (
          <div className="space-y-6">
            {booksByAuthor.map((group) => (
              <div key={group.author.id || 'unknown'}>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {group.author.name}
                </h3>
                <BooksTable
                  books={group.books}
                  authors={authors}
                  editingRowId={editingRowId}
                  setEditingRowId={setEditingRowId}
                  editName={editName}
                  setEditName={setEditName}
                  setBooks={setBooks}
                  deleteBook={deleteBook}
                  columnsConfig={['id', 'name', 'author']}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No authors with books in this store.</p>
        )
      )}

      {/* Add/Edit Book Price Modal */}
      <Modal
        title="Add/Edit Book in Store"
        save={handleAddToStore}
        cancel={closeModal}
        show={showModal}
        setShow={setShowModal}
      >
        <div className="flex flex-col gap-4 w-full">
          <div>
            <label htmlFor="book_select" className="block text-gray-700 font-medium mb-1">
              Select Book
            </label>
            <select
              id="book_select"
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
            >
              <option value="">-- Select a Book --</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.name} by {authorMap[book.author_id]?.name || 'Unknown Author'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-gray-700 font-medium mb-1">
              Price
            </label>
            <input
              id="price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter Price (e.g., 29.99)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;