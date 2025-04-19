import React from 'react'
import { NavLink, useLocation, useSearchParams,  } from 'react-router-dom'

// inventorty/:storeId?search=searchTerm&view={authors|books}
const StoreInventory = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const storeId = location.pathname.split('/')[2]; // Extract storeId from URL
  const view = searchParams.get('view'); // Get view parameter from search params
  console.log(`Store ID: ${storeId}, View: ${view}`);
  return (
    <div>
      {view === 'authors' ? (
        <div>Authors View</div>
      ) : (
        <div>Books View</div>
      )}
      <p>Store ID: {storeId}</p> {/* Display the store ID */}
      {/* Additional content can be added here if needed */}
    </div>
  )
}

export default StoreInventory