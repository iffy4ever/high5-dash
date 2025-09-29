import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiSearch, FiAlertCircle, FiShoppingBag, FiExternalLink } from 'react-icons/fi';
import { useData } from '../useData';
import { getGoogleDriveThumbnail, formatDate, getDateValue, formatCurrency } from "../utils";
import '../styles.css';
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";

// Updated ProtectedRoute to accept auth prop
const ProtectedRoute = ({ auth, children }) => {
  const [user, setUser] = React.useState(null);
  const [loadingAuth, setLoadingAuth] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth]);

  if (loadingAuth) return <p>Loading...</p>;
  return user ? children : <Navigate to="/pd-kaiia/login" replace />;
};

const CustomerPage = ({ auth }) => {
  const { data, loading, error } = useData();
  const [activeTab, setActiveTab] = useState("developments");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    TYPE: "",
    COLOUR: "",
    "LIVE STATUS": "",
    "FIT STATUS": "",
    "CUSTOMER NAME": "",
    "FIT SAMPLE": ""
  });
  const [previewImage, setPreviewImage] = useState({
    url: null,
    visible: false,
    position: { x: 0, y: 0 },
    direction: 'below'
  });
  const [darkMode, setDarkMode] = useState(false);

  // Pagination - enforce 100 items per page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Build filtered arrays - search/filter ALL data first, then paginate
  const filteredDevelopments = useMemo(() => {
    const src = data.insert_pattern || [];
    return src
      .filter(row => {
        const s = search.toLowerCase();
        return Object.values(row).some(v => v && v.toString().toLowerCase().includes(s));
      })
      .filter(row => !filters["STYLE TYPE"] || (row["STYLE TYPE"] || "").toLowerCase() === filters["STYLE TYPE"].toLowerCase())
      .filter(row => !filters["CUSTOMER NAME"] || (row["CUSTOMER NAME"] || "").toLowerCase() === filters["CUSTOMER NAME"].toLowerCase())
      .filter(row => !filters["FIT SAMPLE"] || (row["FIT SAMPLE"] || "").toLowerCase() === filters["FIT SAMPLE"].toLowerCase());
  }, [data.insert_pattern, search, filters]);

  const filteredSales = useMemo(() => {
    const src = data.sales_po || [];
    return src
      .filter(row => {
        const s = search.toLowerCase();
        return Object.values(row).some(v => v && v.toString().toLowerCase().includes(s));
      })
      .filter(row => !filters.TYPE || (row["TYPE"] || "").toLowerCase() === filters.TYPE.toLowerCase())
      .filter(row => !filters.COLOUR || (row["COLOUR"] || "").toLowerCase() === filters.COLOUR.toLowerCase())
      .filter(row => !filters["LIVE STATUS"] || (row["LIVE STATUS"] || "").toLowerCase() === filters["LIVE STATUS"].toLowerCase())
      .filter(row => !filters["FIT STATUS"] || (row["FIT STATUS"] || "").toLowerCase() === filters["FIT STATUS"].toLowerCase())
      .filter(row => !filters["CUSTOMER NAME"] || (row["CUSTOMER NAME"] || "").toLowerCase() === filters["CUSTOMER NAME"].toLowerCase());
  }, [data.sales_po, search, filters]);

  // Paginated slices - only show 100 items per page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageDevelopments = filteredDevelopments.slice(startIndex, startIndex + itemsPerPage);
  const pageSales = filteredSales.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(
    (activeTab === "sales" ? filteredSales.length : filteredDevelopments.length) / itemsPerPage
  );

  return (
    <ProtectedRoute auth={auth}>
      <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header className="app-header">
            <div className="header-left">
              <h1 className="app-title">PD & KAIIA Dashboard</h1>
            </div>
            <div className="header-center">
              <div className="tab-container">
                <div className="tabs">
                  {[
                    { key: "developments", label: "Developments" },
                    { key: "sales", label: "Sales PO" }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setCurrentPage(1); // reset to page 1 when switching tabs
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="header-right">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="action-button dark-mode-toggle"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </header>

          <div className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
            <div className="search-box-container">
              <div className="search-box">
                <FiSearch size={16} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  aria-label="Search developments or sales"
                />
              </div>
            </div>

            <div className="filter-container no-print">
              {activeTab === "sales" && (
                <div className="filter-row">
                  {[
                    { key: "TYPE", label: "Type", options: [...new Set(data.sales_po?.map(row => row["TYPE"]).filter(Boolean))] },
                    { key: "COLOUR", label: "Colour", options: [...new Set(data.sales_po?.map(row => row["COLOUR"]).filter(Boolean))] },
                    { key: "LIVE STATUS", label: "Live Status", options: [...new Set(data.sales_po?.map(row => row["LIVE STATUS"]).filter(Boolean))] },
                    { key: "FIT STATUS", label: "Fit Status", options: [...new Set(data.sales_po?.map(row => row["FIT STATUS"]).filter(Boolean))] },
                    { key: "CUSTOMER NAME", label: "Customer Name", options: [...new Set(data.sales_po?.map(row => row["CUSTOMER NAME"]).filter(Boolean))] }
                  ].map(filter => (
                    <div key={filter.key} className="filter-item">
                      <label>{filter.label}</label>
                      <select
                        value={filters[filter.key]}
                        onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                        className="filter-select"
                      >
                        <option value="">All</option>
                        {filter.options.map((option, i) => (
                          <option key={i} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "developments" && (
                <div className="filter-row">
                  {[
                    { key: "STYLE TYPE", label: "Style Type", options: [...new Set(data.insert_pattern?.map(row => row["STYLE TYPE"]).filter(Boolean))] },
                    { key: "CUSTOMER NAME", label: "Customer Name", options: [...new Set(data.insert_pattern?.map(row => row["CUSTOMER NAME"]).filter(Boolean))] },
                    { key: "FIT SAMPLE", label: "Fit Sample", options: [...new Set(data.insert_pattern?.map(row => row["FIT SAMPLE"]).filter(Boolean))] }
                  ].map(filter => (
                    <div key={filter.key} className="filter-item">
                      <label>{filter.label}</label>
                      <select
                        value={filters[filter.key]}
                        onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                        className="filter-select"
                      >
                        <option value="">All</option>
                        {filter.options.map((option, i) => (
                          <option key={i} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {loading && (
              <div className="loading-screen">
                <div className="loading-content">
                  <FiAlertCircle size={28} className="spin" />
                  <div>Loading Dashboard...</div>
                </div>
              </div>
            )}

            {error && (
              <div className="error-screen">
                <div className="error-content">
                  <FiAlertCircle size={28} className="error-icon" />
                  <h2>Error Loading Data</h2>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <div className="table-container">
                {activeTab === "developments" && (
                  <table className="data-table">
                    <thead>
                      <tr>
                        {[
                          { label: "TIMESTAMP" },
                          { label: "H-NUMBER" },
                          { label: "CUSTOMER NAME" },
                          { label: "STYLE TYPE" },
                          { label: "CUSTOMER CODE" },
                          { label: "FRONT IMAGE" },
                          { label: "BACK IMAGE" },
                          { label: "SIDE IMAGE" },
                          { label: "FIT SAMPLE" },
                          { label: "TOTAL GARMENT PRICE" } // CMT PRICE removed as requested
                        ].map((header, index) => (
                          <th key={index}>
                            <div className="header-content">{header.label}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageDevelopments.length === 0 ? (
                        <tr className="empty-state">
                          <td colSpan="10">
                            <div className="empty-content">
                              <FiAlertCircle size={28} />
                              <div>No Matching Developments Found</div>
                              <p>Try Adjusting Your Search Or Filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pageDevelopments.map((row, i) => (
                          <tr key={i}>
                            <td className="nowrap">{formatDate(row["Timestamp"])}</td>
                            <td className="highlight-cell">{row["H-NUMBER"]}</td>
                            <td>{row["CUSTOMER NAME"] || "N/A"}</td>
                            <td>{row["STYLE TYPE"]}</td>
                            <td>{row["CUSTOMER CODE"] || "N/A"}</td>
                            <td className="image-cell">
                              {row["FRONT IMAGE"] ? (
                                <div>
                                  <a href={row["FRONT IMAGE"]} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={getGoogleDriveThumbnail(row["FRONT IMAGE"])}
                                      alt="Front"
                                      className="product-image"
                                      loading="eager"
                                      onMouseEnter={(e) => setPreviewImage({
                                        url: getGoogleDriveThumbnail(row["FRONT IMAGE"]),
                                        visible: true,
                                        position: { x: e.clientX, y: e.clientY },
                                        direction: e.clientY < window.innerHeight / 2 ? 'below' : 'above'
                                      })}
                                      onMouseLeave={() => setPreviewImage(prev => ({ ...prev, visible: false }))}
                                    />
                                  </a>
                                </div>
                              ) : (
                                <div className="no-image">No Image</div>
                              )}
                            </td>
                            <td className="image-cell">
                              {row["BACK IMAGE"] ? (
                                <div>
                                  <a href={row["BACK IMAGE"]} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={getGoogleDriveThumbnail(row["BACK IMAGE"])}
                                      alt="Back"
                                      className="product-image"
                                      loading="eager"
                                      onMouseEnter={(e) => setPreviewImage({
                                        url: getGoogleDriveThumbnail(row["BACK IMAGE"]),
                                        visible: true,
                                        position: { x: e.clientX, y: e.clientY },
                                        direction: e.clientY < window.innerHeight / 2 ? 'below' : 'above'
                                      })}
                                      onMouseLeave={() => setPreviewImage(prev => ({ ...prev, visible: false }))}
                                    />
                                  </a>
                                </div>
                              ) : (
                                <div className="no-image">No Image</div>
                              )}
                            </td>
                            <td className="image-cell">
                              {row["SIDE IMAGE"] ? (
                                <div>
                                  <a href={row["SIDE IMAGE"]} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={getGoogleDriveThumbnail(row["SIDE IMAGE"])}
                                      alt="Side"
                                      className="product-image"
                                      loading="eager"
                                      onMouseEnter={(e) => setPreviewImage({
                                        url: getGoogleDriveThumbnail(row["SIDE IMAGE"]),
                                        visible: true,
                                        position: { x: e.clientX, y: e.clientY },
                                        direction: e.clientY < window.innerHeight / 2 ? 'below' : 'above'
                                      })}
                                      onMouseLeave={() => setPreviewImage(prev => ({ ...prev, visible: false }))}
                                    />
                                  </a>
                                </div>
                              ) : (
                                <div className="no-image">No Image</div>
                              )}
                            </td>
                            <td>{row["FIT SAMPLE"] || "N/A"}</td>
                            {/* CMT PRICE removed, TOTAL GARMENT PRICE made plain text (no link) */}
                            <td className="price-cell nowrap bold-cell">
                              {formatCurrency(row["TOTAL GARMENT PRICE"])}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
                {activeTab === "sales" && (
                  <table className="data-table">
                    <thead>
                      <tr>
                        {[
                          { label: "IMAGE" },           // added
                          { label: "FIT STATUS" },
                          { label: "H-NUMBER" },
                          { label: "CUSTOMER NAME" },
                          { label: "PO NUMBER" },
                          { label: "STYLE NUMBER" },
                          { label: "DESCRIPTION" },
                          { label: "TOTAL UNITS" },
                          { label: "XFACT DD" },
                          { label: "REAL DD" },
                          { label: "LIVE STATUS" },
                          { label: "PRICE" }            // PRICE instead of TOTAL GARMENT PRICE
                        ].map((header, index) => (
                          <th key={index}>
                            <div className="header-content">{header.label}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageSales.length === 0 ? (
                        <tr className="empty-state">
                          <td colSpan="12">
                            <div className="empty-content">
                              <FiAlertCircle size={28} />
                              <div>No Matching Sales Found</div>
                              <p>Try Adjusting Your Search Or Filters</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pageSales.map((row, i) => (
                          <tr key={i}>
                            {/* IMAGE column - use same product-image class as other tabs */}
                            <td className="image-cell">
                              {row.IMAGE ? (
                                <div>
                                  <a href={row.IMAGE} target="_blank" rel="noopener noreferrer">
                                    <img
                                      src={getGoogleDriveThumbnail(row.IMAGE)}
                                      alt="Product"
                                      className="product-image"
                                      loading="lazy"
                                    />
                                  </a>
                                </div>
                              ) : (
                                <div className="no-image">No Image</div>
                              )}
                            </td>

                            <td>
                              <span className="status-text" data-status={row["FIT STATUS"]}>{row["FIT STATUS"]}</span>
                            </td>
                            <td className="highlight-cell">{row["H-NUMBER"]}</td>
                            <td>{row["CUSTOMER NAME"]}</td>
                            <td>{row["PO NUMBER"]}</td>
                            <td>{row["STYLE NUMBER"]}</td>
                            <td>{row["DESCRIPTION"]}</td>
                            <td className="bold-cell">{row["TOTAL UNITS"]}</td>
                            <td className="nowrap">{formatDate(row["XFACT DD"])}</td>
                            <td className="nowrap">{formatDate(row["REAL DD"])}</td>
                            <td>
                              <span className="status-text" data-status={row["LIVE STATUS"]}>{row["LIVE STATUS"]}</span>
                            </td>

                            {/* PRICE column (not Total Garment Price) */}
                            <td className="price-cell">
                              {formatCurrency(row["PRICE"])}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Pagination controls - only show 100 items per page */}
            {totalPages > 1 && (
              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-button"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span aria-live="polite">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}

            {previewImage.visible && (
              <div 
                className={`image-preview ${previewImage.direction} no-print`}
                style={{
                  left: `${previewImage.position.x}px`,
                  [previewImage.direction === 'below' ? 'top' : 'bottom']: 
                    `${previewImage.direction === 'below' ? previewImage.position.y + 20 : window.innerHeight - previewImage.position.y + 20}px`
                }}
              >
                <img 
                  src={previewImage.url} 
                  alt="Preview"
                  className="preview-image"
                />
                <div className="preview-arrow"></div>
              </div>
            )}
          </div>

          <footer className="app-footer no-print">
            <div className="footer-content">
              <div>PD & KAIIA Dashboard © {new Date().getFullYear()}</div>
              <div>
                Last Updated: {new Date().toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
};

CustomerPage.propTypes = {
  auth: PropTypes.object.isRequired,
  data: PropTypes.shape({
    sales_po: PropTypes.arrayOf(PropTypes.object),
    insert_pattern: PropTypes.arrayOf(PropTypes.object)
  })
};

export default CustomerPage;