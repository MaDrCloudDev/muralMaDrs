# MuralMaDrs

A modern MVC web application for discovering and sharing street murals built with Express.js, MongoDB, and EJS.

## 🚀 Features

- **User Authentication**: Secure registration and login system
- **Mural Management**: Create, view, edit, and delete mural entries
- **Image Upload**: Upload multiple images via Cloudinary integration
- **Interactive Maps**: Location-based mural discovery with Mapbox
- **Reviews & Ratings**: Community-driven mural reviews
- **Responsive Design**: Mobile-friendly Bootstrap interface
- **Security**: Built-in protection against common web vulnerabilities

## 🛠️ Tech Stack

- **Backend**: Node.js 18+, Express.js 4.18+
- **Database**: MongoDB with Mongoose 7.6+
- **Authentication**: Passport.js with local strategy
- **File Upload**: Multer 2.0+ with Cloudinary storage
- **Templating**: EJS with EJS-Mate
- **Styling**: Bootstrap 5
- **Maps**: Mapbox GL JS
- **Security**: Helmet, express-mongo-sanitize, Joi validation

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)
- Mapbox account (for geocoding and maps)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd muralMaDrs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DB_URL=mongodb://localhost:27017/mural-madrs
   SECRET=your-super-secret-session-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_KEY=your-cloudinary-api-key
   CLOUDINARY_SECRET=your-cloudinary-api-secret
   MAPBOX_TOKEN=your-mapbox-access-token
   NODE_ENV=development
   PORT=3000
   ```

4. **Start the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Visit the application**
   Open your browser to `http://localhost:3000`

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_URL` | MongoDB connection string | Yes |
| `SECRET` | Session secret key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_SECRET` | Cloudinary API secret | Yes |
| `MAPBOX_TOKEN` | Mapbox access token | Optional* |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port | No |

*Note: Mapbox token is optional but recommended for full functionality. Without it, default coordinates will be used.

## 📁 Project Structure

```
muralMaDrs/
├── controllers/          # Route controllers
├── models/              # Mongoose models
├── routes/              # Express routes
├── views/               # EJS templates
├── public/              # Static assets
├── utils/               # Utility functions
├── cloudinary/          # Cloudinary configuration
├── middleware.js        # Custom middleware
├── schemas.js           # Joi validation schemas
└── app.js              # Main application file
```

## 🚦 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (placeholder)

## 🔒 Security Features

- **Helmet**: Security headers
- **MongoDB Sanitization**: Prevents NoSQL injection
- **Input Validation**: Joi schema validation
- **HTML Sanitization**: Prevents XSS attacks
- **CSRF Protection**: Built into forms
- **Secure Sessions**: HTTP-only cookies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆕 Recent Updates (v2.0.0)

- **ES Modules**: Converted from CommonJS to modern ES modules
- **Updated Dependencies**: All packages updated to latest versions
- **Modern JavaScript**: Uses const/let, arrow functions, async/await
- **Improved Security**: Updated Helmet and security configurations
- **Better Error Handling**: Enhanced error handling patterns
- **MongoDB 7.x**: Updated to latest Mongoose with modern connection syntax
- **Node.js 18+**: Requires modern Node.js version
