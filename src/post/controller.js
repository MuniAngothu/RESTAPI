// controller.js
const pool = require('../../db');
const queries = require('./queries');

const getAllPosts = (req, res) => {
    const { page = 1, limit = 20, keyword, tag, sortBy } = req.query;
    let queryString = `${queries.getAllPosts}`;

    // Apply filters
    const filters = [];
    if (keyword) filters.push(`title ILIKE '%${keyword}%'`);
    if (tag) filters.push(`tag = '${tag}'`);
    if (filters.length > 0) queryString += ` WHERE ${filters.join(' AND ')}`;

    // Apply sorting
    if (sortBy) queryString += ` ORDER BY ${sortBy}`;

    // Apply pagination
    const offset = (page - 1) * limit;
    queryString += ` LIMIT ${limit} OFFSET ${offset}`;

    pool.query(queryString, (error, results) => {
        if (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ error: 'An internal server error occurred' });
        } else {
            res.status(200).json(results.rows);
        }
    });
};


module.exports = {
    getAllPosts,
};
