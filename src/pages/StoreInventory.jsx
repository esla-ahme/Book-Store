// src/pages/Inventory.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Loading from '../pages/Loading';
import BooksTable from '../components/BooksTable';
import Modal from '../components/Modal';
import Header from '../components/Header';
import useLibraryData from '../hooks/useLibraryData';

const Inventory = () => {
  // State for UI
  const [activeTab, setActiveTab] = useState('books');
  const [searchParams] = useSearchParams();
  const { storeId } = useParams();
  const [editingRowId, setEditingRowId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [price, setPrice] = useState('');

  // Use the custom hook
  const {
    books,
    setBooks,
    authors,
    inventory,
    setInventory,
    authorMap,
    storeBooks,
    booksWithStores,
    isLoading,
    currentStore,
  } = useLibraryData({ storeId, searchTerm: searchParams.get('search') || '' });

  // Set active tab based on view query param
  const view = searchParams.get('view') || 'books';
  useEffect(() => {
    if (view === 'authors' || view === 'books') {
      setActiveTab(view);
    }
  }, [view]);

  // Group books by author for the Authors tab
  const booksByAuthor = React.useMemo(() => {
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
      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.store_id === parseInt(storeId, 10) && item.book_id === bookId
            ? { ...item, price: bookPrice }
            : item
        )
      );
    } else {
      setInventory((prevInventory) => [
        ...prevInventory,
        { store_id: parseInt(storeId, 10), book_id: bookId, price: bookPrice },
      ]);
    }

    closeModal();
  };

  // Get current store name
  const storeName = currentStore ? currentStore.name : 'All Stores';

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="py-6">
      <div className="flex mb-4 w-full justify-center items-center">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 border-b-2 py-2 ${activeTab === 'books' ? 'border-b-main' : 'border-b-transparent'}`}
        >
          Books
        </button>
        <button
          onClick={() => setActiveTab('authors')}
          className={`px-4 border-b-2 py-2 ${activeTab === 'authors' ? 'border-b-main' : 'border-b-transparent'}`}
        >
          Authors
        </button>
      </div>

      <Header addNew={openModal} title={`Store: ${storeName} Inventory`} buttonTitle="Add to inventory" />

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
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{group.author.name}</h3>
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