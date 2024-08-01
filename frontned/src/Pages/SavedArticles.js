// pages/SavedArticles.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SavedArticles = () => {
    const [saved, setSaved] = useState([]);
    let [token, setToken] = useState('');

    useEffect(() => {
        let t = JSON.parse(localStorage.getItem('userInfo'));
        setToken(t.token);
    }, []);

    const fetchSavedArticles = async () => {
        try {
            const response = await axios.get('/api/saved', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSaved(response.data);
        } catch (error) {
            console.error("Error fetching saved articles:", error);
        }
    };

    useEffect(() => {
        fetchSavedArticles();
    }, [token]);

    return (
        <div style={{ padding: '20px' }}>
            
            <h2>Saved Articles</h2>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                justifyContent: saved.length === 1 ? 'center' : 'space-between',
                maxWidth: '1200px',
                margin: '0 auto',
            }}>
                {saved.map((article, index) => (
                    <div key={index} style={{
                        flex: '1 1 calc(33.333% - 20px)',
                        boxSizing: 'border-box',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        marginBottom: '20px',
                        maxWidth: '300px'
                    }}>
                        <img
                            src={article.urlToImage || 'https://via.placeholder.com/300?text=No+Image'}
                            alt={article.title}
                            style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover'
                            }}
                        />
                        <div style={{ padding: '10px' }}>
                            <h2 style={{ fontSize: '16px', margin: '0 0 10px' }}>{article.title}</h2>
                            <p style={{ fontSize: '14px', color: '#555' }}>{article.description || 'No description available'}</p>
                            <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>Read more</a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SavedArticles;
