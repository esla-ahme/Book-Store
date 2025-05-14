# OVARC TASK



## Features
- **Vite**: Fast build tool and dev server.
- **React Router**: Dynamic routing with code splitting.
- **Tailwind CSS**: Utility-first CSS framework.


## Setup
1. **Clone the repository**:
   ```bash
    git clone https://github.com/esla-ahme/Book-Store.git
   ```
    cd Book-Store
2. ** Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```  



## Project Structure
- src/pages/: Contains page components like Home, BrowseStores, Browse, BrowseAuthors, and Inventory.

- src/components/: Includes reusable UI components such as StoreCard, BookCard, AuthorCard, BooksTable, Modal, and Header.

- src/hooks/: Custom hooks like useLibraryData for data fetching and state management.

- src/assets/: Stores static assets like author images (a1.png, a2.png).

- data/: JSON files (stores.json, books.json, authors.json, inventory.json) for mock data.

Routes
- /: Home page with sections for Stores, Books, and Authors.

- /browse-stores: Browse all stores with their book counts and average prices.

- /browse: Browse all books with their authors and store availability.

- /browse-authors: Browse all authors with their published book counts.


