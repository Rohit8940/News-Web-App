// components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ scrollToSavedArticles }) => {
    return (
        <nav style={{ padding: '10px 20px', borderBottom: '1px solid #ddd'}}>
            <div style={{display:'flex',justifyContent:'space-around',width:'60%',alignItems:'center'}}>
            <p style={{fontSize:'20px',fontWeight:'bold'}}>News Article App</p>
            <Link to="/ArticlePage" style={{ marginRight: '20px', textDecoration: 'none', color: '#007bff' }}><u>Browse Articles</u></Link>
            <button
                onClick={scrollToSavedArticles}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                }}
            >
                Saved Articles
            </button>
            </div>
        </nav>
    );
};

export default Navbar;
