const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const pool = require("./db"); 
const allPostData = require("./src/post/routes");
const app = express();
const port = process.env.PORT || 3000;

// Cloudinary configuration
//used cloudinary,due to free open source image s3 paid
cloudinary.config({ 
  cloud_name: 'dvhcorhgk', 
  api_key: '729915462675453', 
  api_secret: 'UIa3HLDoyJLaDCN4wS_GlhG4RPY' 
});

// Multer configuration Muni,Here for image uploads
/// Destination folder for temporarily storing uploads
const upload = multer({ dest: "uploads/" }); 


// Middleware to parse JSON bodies
app.use(express.json());

// Define your routes
app.get("/", (req, res) => {
    res.send("Hello world");
});

// pagination and sorting using query parameters route with filter keyword and tag.
//working Routes to test in postman
// http://localhost:3000/api/allpostdata?page=1&limit=10
// http://localhost:3000/api/allpostdata?page=1&limit=10&sortBy=title
// http://localhost:3000/api/allpostdata?page=1&limit=10&keyword=Muni&sortBy=title
// http://localhost:3000/api/allpostdata?keyword=Muni&sortBy=title&tag=Munish
// http://localhost:3000/api/allpostdata?keyword=Ranga&tag=ramudu
// http://localhost:3000/api/allpostdata?limit=10&page=1&keyword=Muni&sortBy=title&tag=Munish

app.use('/api/allpostdata', allPostData);

// Endpoint to create a post with image upload
//localhost:3000/api/upload to update post to database
app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
        // Extract post details from req.body
        const { title, description, tag } = req.body;

        console.log(title, description, tag)
        const result = await cloudinary.uploader.upload(req.file.path); // Upload image to Cloudinary and get response

        // Get the image URL from Cloudinary response
        const imageUrl = result.secure_url;

        // Save post details including the image URL to the database
        // Example database save operation using PostgreSQL
        const query = `
            INSERT INTO posts (title, description, tag, imageurl) 
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [title, description, tag, imageUrl];
        const savedPost = await pool.query(query, values);
        console.log(savedPost)

        res.status(201).json({ message: "Post created successfully", post: savedPost.rows[0] });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});



// Start the server
app.listen(port, () => console.log(`App listening on port ${port}`));
