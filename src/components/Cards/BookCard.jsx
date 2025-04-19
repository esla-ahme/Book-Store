const BookCard = ({ 
   title,
    author,
    stores
  }) => {
    return (
      <div className="bg-white shadow-md rounded-lg p-4 h-[214px] w-112 flex gap-2 ">
        <div className=" grid items-center h-full w-32 px-3" 
        style={{
            background: "linear-gradient(to  right, #777, #ff000010 3%)",
        }}>
          <p className="text-center font-light text-gray-800 text-wrap">{title}</p>
        </div>
        <div>
            <p className=" text-wrap">{title}</p>
            <p className="text-sm text-gray-500">{author}</p>
            <span className="text-sm text-gray-500">Stores:</span>

            <div className="flex gap-2 mt-2">
                {stores.length > 0 ? stores.map((store, index) => (
                    <div key={index} className="flex flex-col justify-between items-center py-2 px-3 bg-amber-100 gap-2">
                        <div className="flex flex-col items-center gap-2">
                        <p className="text-sm text-gray-700">{store.name}</p>
                        <p className="text-sm  text-main">${store.price.toFixed(2)}</p>
                        </div>
                        <button className="bg-blue-400 font-light text-white px-2 py-1 rounded">Sell</button>
                    </div>
                )) : <p className="text-sm text-gray-500">No stores available</p>}
                </div>
                
        </div>
      </div>
    );
  };
export default BookCard;