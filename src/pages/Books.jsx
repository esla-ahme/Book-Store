import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Loading from './Loading';
import Table from '../components/Table/Table';
import { useSearchParams } from 'react-router-dom';
import Modal from '../components/Modal';
import TableActions from '../components/ActionButton/TableActions';

const Books = () => {
  // State declarations
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [editingRowId, setEditingRowId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newBook, setNewBook] = useState({
    author_name: '',
    name: '',
    page_count: '',
  });

  // Sync search term with URL query parameters
  useEffect(() => {
    const search = searchParams.get('search') || '';
    setSearchTerm(search);
  }, [searchParams]);

  // Fetch books data from JSON file
useEffect(() => {
    Promise.all([
        fetch('/data/books.json').then((response) => response.json()),
        fetch('/data/authors.json').then((response) => response.json()),
    ])
        .then(([booksData, authorsData]) => {
            console.log('Fetched books:', booksData);
            console.log('Fetched authors:', authorsData);

            setBooks(Array.isArray(booksData) ? booksData : [booksData]);
            setAuthors(Array.isArray(authorsData) ? authorsData : [authorsData]);
        })
        .catch((error) => console.error('Error fetching data:', error));
}, []);

const mergedBooks = useMemo(() => {
    const authorsMap = new Map(
        authors.map((author) => [author.id, author.first_name + ' ' + author.last_name])
    );

    return books.map((book) => ({
        ...book,
        author_name: authorsMap.get(book.author_id) || 'Unknown Author',
    }));
}, [books, authors]);

  // Filter books based on search term
  const filteredBooks = useMemo(() => {
    if (!searchTerm.trim()) return mergedBooks;
    const lowerSearch = searchTerm.toLowerCase();
    return mergedBooks.filter((book) =>
      Object.values(book).some((value) =>
        String(value).toLowerCase().includes(lowerSearch)
      )
    );
  }, [mergedBooks, searchTerm]);

  // Define table columns
  const columns = useMemo(
    () => [
      { header: 'ID', accessorKey: 'id' },
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) =>
          editingRowId === row.original.id ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave(row.original.id);
                if (e.key === 'Escape') handleCancel();
              }}
              className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            row.original.name
          ),
      },
      
      { header: 'Page Count', accessorKey: 'page_count' },
      {header: 'Author',  accessorKey: 'author_name',},
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <TableActions
            row={row}
            onEdit={
              editingRowId === row.original.id
                ? handleCancel
                : () => handleEdit(row.original)
            }
            onDelete={() => deleteBook(row.original.id, row.original.name)}
          />
        ),
      },
    ],
    [editingRowId, editName]
  );

  // Handle book deletion
  const deleteBook = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      setEditingRowId(null);
      setEditName('');
    }
  };

  // Initiate editing
  const handleEdit = (book) => {
    setEditingRowId(book.id);
    setEditName(book.name);
  };

  // Save edited name
  const handleSave = (id) => {
    setBooks(
      books.map((book) =>
        book.id === id ? { ...book, name: editName } : book
      )
    );
    setEditingRowId(null);
    setEditName('');
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingRowId(null);
    setEditName('');
  };

  // Modal controls
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // Add new book
const handleAddNew = () => {
    if (
        newBook.author_id.trim() === '' ||
        newBook.name.trim() === '' ||
        newBook.page_count.trim() === ''
    ) {
        alert('All fields are required');
        return;
    }
    const authorId = parseInt(newBook.author_id, 10);
    const pageCount = parseInt(newBook.page_count, 10);
    if (isNaN(authorId) || isNaN(pageCount)) {
        alert('Author ID and Page Count must be numbers');
        return;
    }
    const newId = books.length > 0 ? Math.max(...books.map((b) => b.id)) + 1 : 1;
    const newBookObject = {
        id: newId,
        author_id: authorId,
        name: newBook.name,
        page_count: pageCount,
    };
    setBooks((prevBooks) => [...prevBooks, newBookObject]);
    setNewBook({
        author_id: '',
        name: '',
        page_count: '',
    });
    closeModal();
};

return (
    <div className="py-6">
        <Header addNew={openModal} title="Books List" />
        {books.length > 0 ? (
            <Table data={filteredBooks} columns={columns} />
        ) : (
            <Loading />
        )}
        <Modal
            title="New Book"
            save={handleAddNew}
            cancel={closeModal}
            show={showModal}
            setShow={setShowModal}
        >
            <div className="flex flex-col gap-4 w-full">
                <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                        Book Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={newBook.name}
                        onChange={(e) => setNewBook({ ...newBook, name: e.target.value })}
                        className="border border-gray-300 rounded p-2 w-full"
                        placeholder="Enter Book Name"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="page_count" className="block text-gray-700 font-medium mb-1">
                        Number of Pages
                    </label>
                    <input
                        id="page_count"
                        type="text"
                        value={newBook.page_count}
                        onChange={(e) => setNewBook({ ...newBook, page_count: e.target.value })}
                        className="border border-gray-300 rounded p-2 w-full"
                        placeholder="Enter Page Count"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="author_id" className="block text-gray-700 font-medium mb-1">
                        Author
                    </label>
                    <select
                        id="author_id"
                        value={newBook.author_id}
                        onChange={(e) => setNewBook({ ...newBook, author_id: e.target.value })}
                        className="border border-gray-300 rounded p-2 w-full"
                        required
                    >
                        <option value="" disabled>
                            Select an Author
                        </option>
                        {authors.map((author) => (
                            <option key={author.id} value={author.id}>
                                {author.first_name} {author.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </Modal>
    </div>
);
};

export default Books;