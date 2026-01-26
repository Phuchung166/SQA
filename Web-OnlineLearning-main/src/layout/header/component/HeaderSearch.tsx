import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Props type definition
interface IHeaderSearchProps {
  openSearchField: boolean;
  setOpenSearchField: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderSearch = ({ setOpenSearchField, openSearchField }: IHeaderSearchProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle closing the search field
  const handleClose = () => {
    setOpenSearchField(false);
    setSearchQuery('');
  };

  // Function to handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses-filter-search?search=${encodeURIComponent(searchQuery.trim())}`);
      handleClose();
    }
  };

  return (
    <>
      {/* Search Popup Area */}
      <div className={`bd-search-popup-area ${openSearchField ? 'bd-search-opened' : ''}`}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="bd-search-popup">
                <div className="bd-search-form">
                  <form onSubmit={handleSearch}>
                    <div className="bd-search-input">
                      <input
                        type="search"
                        name="search"
                        placeholder="Type here to search ..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                      <div className="bd-search-submit">
                        <button type="submit">
                          <i className="fa-regular fa-magnifying-glass"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="bd-search-close">
                    <div onClick={handleClose} className="bd-search-close-btn">
                      <button>
                        <i className="fa-thin fa-close"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Popup Overlay */}
      <div
        onClick={handleClose}
        className={`bd-search-overlay ${openSearchField ? 'bd-search-opened' : ''}`}
        aria-hidden={!openSearchField}
      ></div>
    </>
  );
};

export default HeaderSearch;
