// pages/ArticlePage.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../Pages/Navbar';

const ArticlePage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [articlesPerPage] = useState(9);
    let [token, setToken] = useState('');
    const savedArticlesRef = useRef(null);

    useEffect(() => {
        let t = JSON.parse(localStorage.getItem('userInfo'));
        setToken(t.token);
    }, []);

    const fetchArticles = async () => {
        try {
            const response = await axios.get(
                `https://newsapi.org/v2/top-headlines?country=in&apiKey=e10d0a25c5a045b98b10a23f1224057d`
            );
            // too many requests in your api key so using mine
            setArticles(response.data.articles);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching articles:", error);
        }
    };

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

    const saveArticle = async (article) => {
        try {
            await axios.post('/api/saved/save', article, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchSavedArticles(); // Update the saved articles list
        } catch (error) {
            console.error("Error saving article:", error);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    useEffect(() => {
        fetchSavedArticles();
    }, [token]);

  
    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
    const currentSavedArticles = saved.slice(indexOfFirstArticle, indexOfLastArticle);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const scrollToSavedArticles = () => {
        savedArticlesRef.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <Navbar scrollToSavedArticles={scrollToSavedArticles} />
            <div style={{ padding: '20px' }}>
                <div style={{display:'flex',justifyContent:'center',fontSize:'30px',marginBottom:'15px',fontWeight:'bold'}}>
                <h1>News Articles</h1>
                </div>
               
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '20px',
                        justifyContent: saved.length === 1 ? 'center' : 'space-between',
                    maxWidth: '1200px',
                    margin: '0 auto'
                    }}>
                        {currentArticles.map((article, index) => (
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
                                    <div style={{display:'flex',gap:'20px',alignItems:'center',marginTop:'10px'}}>
                                    <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>Read more</a>
                                    <button onClick={() => saveArticle(article)} style={{color:'green',fontWeight:'bolder'}}>Save Article</button>
                                    </div>
                                    
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <Pagination
                    articlesPerPage={articlesPerPage}
                    totalArticles={articles.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
                <div style={{display:'flex',justifyContent:'center',fontSize:'25px',fontWeight:'bold',margin:'20px'}}>
                <h2 ref={savedArticlesRef}>Saved Articles</h2>
                </div>
                
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    justifyContent: saved.length === 1 ? 'center' : 'space-between',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    {currentSavedArticles.map((article, index) => (
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
                <Pagination
                    articlesPerPage={articlesPerPage}
                    totalArticles={saved.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            </div>
        </div>
    );
};

const Pagination = ({ articlesPerPage, totalArticles, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalArticles / articlesPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <nav>
            <ul style={{ display: 'flex', listStyle: 'none', justifyContent: 'center', padding: '0' }}>
                {pageNumbers.map(number => (
                    <li key={number} style={{ margin: '0 10px' }}>
                        <button
                            onClick={() => paginate(number)}
                            style={{
                                padding: '10px 20px',
                                border: '1px solid #007bff',
                                borderRadius: '5px',
                                backgroundColor: number === currentPage ? '#007bff' : '#fff',
                                color: number === currentPage ? '#fff' : '#007bff',
                                cursor: 'pointer'
                            }}
                        >
                            {number}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default ArticlePage;
