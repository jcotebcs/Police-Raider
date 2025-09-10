# Police-Raider 🚔

A Progressive Web App (PWA) for searching public services, emergency contacts, and police stations.

![Police Raider Demo](https://github.com/user-attachments/assets/219f216b-6f90-4467-a6a9-dd94c852bda3)

## Features

- 🔍 **Smart Search**: Search across police stations, emergency services, public offices, and personnel
- 📱 **PWA Support**: Install as a native app on mobile and desktop devices
- 🌐 **Offline Capable**: Works without internet connection using cached data
- 📞 **Emergency Info**: Quick access to emergency contacts and services
- 🎨 **Responsive Design**: Optimized for all screen sizes

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/jcotebcs/Police-Raider.git
   cd Police-Raider
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

### Production Deployment

#### Option 1: Static Hosting (Recommended)

Deploy to any static hosting service:

- **GitHub Pages**: Enable Pages in repository settings
- **Netlify**: Connect repository and deploy automatically
- **Vercel**: Import GitHub repository
- **Firebase Hosting**: `firebase deploy`

#### Option 2: Custom Server

```bash
# Build and serve
npm start
```

## PWA Installation

The app can be installed on any device:

1. **Desktop**: Click the install button in the address bar or use the "Install App" button
2. **Mobile**: Use "Add to Home Screen" option in browser menu
3. **Requirements**: HTTPS is required for PWA features in production

## Configuration

### API Integration

The app currently uses placeholder APIs. To integrate real services:

1. **Replace API endpoints** in `app.js`:
   ```javascript
   this.searchAPIs = {
     police: 'https://your-api.com/police',
     emergency: 'https://your-api.com/emergency',
     // ... other endpoints
   };
   ```

2. **Add API authentication** if required:
   ```javascript
   const headers = {
     'Authorization': `Bearer ${process.env.API_KEY}`,
     'Content-Type': 'application/json'
   };
   ```

3. **Handle CORS** for cross-origin requests

### Environment Variables

Create a `.env` file for sensitive configuration:

```env
API_KEY=your_api_key_here
API_BASE_URL=https://api.example.com
```

## File Structure

```
Police-Raider/
├── index.html          # Main HTML file
├── app.js             # Application logic
├── styles.css         # Styling
├── manifest.json      # PWA manifest
├── sw.js              # Service worker
├── package.json       # Dependencies
└── README.md          # Documentation
```

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **PWA**: Service Worker, Web App Manifest
- **Build**: No build process required (static files)
- **Server**: http-server for development

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with PWA support

## Development

### Testing

```bash
# Start development server
npm run dev

# Test PWA features (requires HTTPS in production)
# Use Chrome DevTools > Application > Service Workers
```

### Debugging

1. **Service Worker**: Check Chrome DevTools > Application > Service Workers
2. **PWA Manifest**: Check Application > Manifest
3. **Network**: Monitor API calls in Network tab
4. **Console**: Check for JavaScript errors

## Deployment Checklist

- [ ] Test on multiple devices and browsers
- [ ] Verify PWA installation works
- [ ] Test offline functionality
- [ ] Ensure HTTPS in production
- [ ] Configure real API endpoints
- [ ] Set up error monitoring
- [ ] Add analytics if needed

## Security

- Never commit API keys to repository
- Use environment variables for sensitive data
- Implement proper CORS headers
- Validate all user inputs
- Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue in this repository
- Check the documentation
- Test in different browsers

## Emergency Information

**Important**: This app is for non-emergency searches. For emergencies, always call:
- **Emergency**: 911
- **Non-Emergency**: Contact your local department directly