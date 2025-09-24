
# ICHR2026 Conference Portal

A comprehensive conference management system built with React, TypeScript, and Lumi SDK for the International Conference on Human Rights 2026.

## 🌟 Features

### User Features
- User registration and authentication with JWT
- Paper submission portal with file upload (PDF, DOC, DOCX)
- User dashboard with submission tracking
- Profile management with password change
- Payment portal for registration fees with slip upload
- Real-time notifications and status updates

### Admin Features
- Comprehensive admin dashboard with analytics
- User management with full CRUD operations
- Paper review system with status tracking
- Financial management with payment tracking
- Communications management with message responses
- Analytics with charts and reports
- Settings panel for system configuration
- Real-time data synchronization

## 🚀 Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Notifications**: React Hot Toast
- **Database**: MongoDB via Lumi SDK
- **Authentication**: Lumi Platform Authentication

## 📋 Prerequisites

- Node.js 18+ and npm
- Lumi Platform Account
- Modern web browser

## 🛠️ Installation & Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ichr2026-conference-portal

# Install dependencies
npm install
```

### 2. Environment Configuration

The project uses Lumi SDK for backend services. The configuration is already set up in `src/lib/lumi.ts`:

```typescript
export const lumi = createClient({
  projectId: 'p361551036001775616',
  apiBaseUrl: 'https://api.lumi.new',
  authOrigin: 'https://auth.lumi.new',
})
```

### 3. Database Setup

The project includes MongoDB schemas in `/src/entities/`:

- `papers.json` - Paper submissions
- `payments.json` - Payment records
- `messages.json` - Contact messages
- `user_profiles.json` - Extended user profiles
- `reviews.json` - Paper reviews

Sample data is automatically populated when you first run the application.

### 4. Run the Application

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## 👤 Default Admin Credentials

For testing purposes, you can use these admin credentials:

- **Email**: admin@ichr2026.com
- **Password**: admin123

*Note: In production, these should be changed immediately.*

## 🗄️ Database Schema

### Papers Collection
```json
{
  "title": "string",
  "abstract": "string", 
  "keywords": "string",
  "status": "submitted|under_review|accepted|rejected|revision_required",
  "user_id": "string",
  "fileName": "string",
  "fileSize": "number",
  "filePath": "string",
  "reviewerComments": "string",
  "submittedAt": "datetime",
  "reviewedAt": "datetime"
}
```

### Payments Collection
```json
{
  "user_id": "string",
  "amount": "number",
  "currency": "string",
  "status": "pending|completed|failed|refunded",
  "paymentMethod": "bank_transfer|credit_card|paypal|other",
  "paymentSlipPath": "string",
  "transactionId": "string",
  "notes": "string",
  "createdAt": "datetime",
  "processedAt": "datetime"
}
```

### Messages Collection
```json
{
  "name": "string",
  "email": "string", 
  "subject": "string",
  "body": "string",
  "isRead": "boolean",
  "priority": "low|medium|high|urgent",
  "category": "general|technical|payment|paper_submission|registration",
  "adminResponse": "string",
  "respondedAt": "datetime",
  "respondedBy": "string"
}
```

### User Profiles Collection
```json
{
  "user_id": "string",
  "fullName": "string",
  "affiliation": "string",
  "country": "string",
  "bio": "string",
  "phone": "string",
  "website": "string",
  "orcid": "string",
  "academicTitle": "Dr.|Prof.|Mr.|Ms.|Mrs.",
  "participationType": "presenter|attendee|keynote|panelist",
  "dietaryRequirements": "string",
  "accommodationNeeds": "string"
}
```

## 🔌 API Endpoints

### Authentication
- `lumi.auth.signIn()` - User login
- `lumi.auth.signOut()` - User logout
- `lumi.auth.isAuthenticated` - Check authentication status
- `lumi.auth.user` - Get current user info

### User Management
- `lumi.entities.user_profiles.list()` - Get user profiles
- `lumi.entities.user_profiles.create()` - Create user profile
- `lumi.entities.user_profiles.update()` - Update user profile
- `lumi.entities.user_profiles.delete()` - Delete user profile

### Paper Management
- `lumi.entities.papers.list()` - Get papers
- `lumi.entities.papers.create()` - Submit paper
- `lumi.entities.papers.update()` - Update paper status
- `lumi.entities.papers.delete()` - Delete paper

### Payment Management
- `lumi.entities.payments.list()` - Get payments
- `lumi.entities.payments.create()` - Create payment record
- `lumi.entities.payments.update()` - Update payment status

### Message Management
- `lumi.entities.messages.list()` - Get messages
- `lumi.entities.messages.create()` - Send message
- `lumi.entities.messages.update()` - Update message/respond

## 🎨 UI Components

### Key Components
- `Layout` - Main application layout with navigation
- `ProtectedRoute` - Route protection for authenticated users
- `Dashboard` - User dashboard with statistics
- `SubmitPaper` - Paper submission form
- `MySubmissions` - User's paper list
- `UserProfile` - Profile management
- `Payments` - Payment portal
- `AdminDashboard` - Admin analytics dashboard
- `AdminUsers` - User management interface
- `AdminPapers` - Paper review interface
- `AdminFinancials` - Financial management
- `AdminMessages` - Message management

### Styling
- **Design System**: Tailwind CSS utility classes
- **Color Palette**: Blue primary, semantic colors for status
- **Typography**: System fonts with clear hierarchy
- **Components**: Consistent spacing, rounded corners, shadows
- **Responsive**: Mobile-first design approach

## 🔐 Security Features

- JWT-based authentication via Lumi Platform
- Role-based access control (User/Admin)
- Protected routes and API endpoints
- Input validation and sanitization
- File upload restrictions (type, size)
- Secure password handling

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Set up the following in your production environment:
- Lumi project configuration
- File upload directories
- Email service configuration

### Hosting Recommendations
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Managed via Lumi Platform
- **Database**: MongoDB via Lumi SDK

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Paper submission with file upload
- [ ] Payment slip upload
- [ ] Admin dashboard analytics
- [ ] Paper review workflow
- [ ] Message management
- [ ] Responsive design on all devices

### Test Data
The application includes sample data for:
- 4 sample papers with different statuses
- 3 sample payments
- 4 sample messages
- 3 sample user profiles

## 🔧 Configuration

### File Upload Settings
- **Supported formats**: PDF, DOC, DOCX (papers), JPG, PNG, PDF (payment slips)
- **Size limits**: 16MB (papers), 5MB (payment slips)
- **Storage**: Via Lumi Platform file handling

### Email Configuration
- Contact form submissions stored in database
- Admin responses via message management interface
- Email notifications can be integrated via Lumi Platform

## 📊 Analytics & Reporting

### Available Reports
- User registration statistics
- Paper submission analytics
- Payment processing reports
- Message volume and response times
- Revenue tracking by payment method
- Monthly financial trends

### Dashboard Metrics
- Total users, papers, payments, messages
- Status distributions (papers, payments)
- Recent activity feed
- System health indicators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations

## 📞 Support

For technical support or questions:
- Check the documentation
- Review the sample data and schemas
- Test with the provided admin credentials
- Ensure all dependencies are properly installed

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- Built with Lumi Platform for backend services
- Uses React ecosystem for frontend development
- Tailwind CSS for responsive design
- Recharts for data visualization
- Lucide React for consistent iconography

---

**ICHR2026 Conference Portal** - Empowering human rights research and collaboration worldwide.



# ICHR2026 Conference Portal

A comprehensive conference management system built with React, TypeScript, and Lumi SDK for the International Conference on Human Resources 2026.

## 🚀 Features

### User Features
- **User Authentication**: Secure login/logout with role-based access
- **Paper Submission**: Submit research papers with file uploads
- **Payment Management**: Registration fee payments with slip uploads
- **Profile Management**: Complete user profile with research interests
- **Submission Tracking**: Track paper review status and feedback

### Admin Features
- **Dashboard**: Comprehensive overview with statistics and charts
- **Paper Management**: Review, approve/reject papers with scoring
- **User Management**: View and manage registered users
- **Financial Management**: Track payments and revenue
- **Message Center**: Handle user inquiries and communications

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Notifications**: react-hot-toast
- **Backend**: Lumi SDK (handles authentication, database, file storage)

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Modern web browser
- Lumi account (for backend services)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd conference-portal
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_LUMI_PROJECT_ID=your_project_id_here
VITE_LUMI_API_KEY=your_api_key_here
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🔐 Default Admin Credentials

For initial setup and testing, use these default admin credentials:

**Email**: `admin@ichr2026.org`  
**Password**: `admin123`

**Important**: Change these credentials immediately after first login in production!

## 🗄️ Database Setup

### Lumi SDK Database Configuration

The project uses Lumi SDK which provides a managed database service. The entities are automatically configured through the SDK.

### Database Schema

#### Users Entity
```typescript
interface User {
  userId: string          // Unique user identifier
  email: string          // User email (unique)
  userName: string       // Display name
  userRole: 'ADMIN' | 'USER'  // Role-based access
  createdTime: string    // Account creation timestamp
  accessToken: string    // Authentication token
}
```

#### Papers Entity
```json
{
  "_id": "string",
  "title": "string",
  "abstract": "string", 
  "authors": "string",
  "keywords": "string",
  "category": "string",
  "file_path": "string",
  "status": "submitted|under_review|accepted|rejected|revision_required",
  "submission_date": "datetime",
  "user_id": "string",
  "user_name": "string",
  "user_email": "string",
  "reviewer_notes": "string",
  "admin_notes": "string",
  "review_score": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Payments Entity
```json
{
  "_id": "string",
  "user_id": "string",
  "amount": "number",
  "currency": "string",
  "status": "pending|completed|failed|refunded",
  "payment_method": "string",
  "transaction_id": "string",
  "user_name": "string",
  "user_email": "string",
  "payment_slip_path": "string",
  "admin_notes": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

#### Messages Entity
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "subject": "string",
  "body": "string",
  "is_read": "boolean",
  "priority": "normal|high|urgent",
  "category": "paper_submission|payment|registration|technical|general",
  "admin_response": "string",
  "responded_at": "datetime",
  "createdAt": "datetime"
}
```

### Manual Database Setup (Alternative)

If you prefer to use a traditional database, here are the SQL schemas:

#### PostgreSQL Setup
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    affiliation VARCHAR(255),
    country VARCHAR(100),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Papers table
CREATE TABLE papers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    authors TEXT,
    keywords TEXT,
    category VARCHAR(100),
    file_path VARCHAR(500),
    status VARCHAR(50) DEFAULT 'submitted',
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id),
    reviewer_notes TEXT,
    admin_notes TEXT,
    review_score INTEGER CHECK (review_score >= 1 AND review_score <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    payment_slip_path VARCHAR(500),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(50) DEFAULT 'general',
    admin_response TEXT,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_papers_user_id ON papers(user_id);
CREATE INDEX idx_papers_status ON papers(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_messages_is_read ON messages(is_read);
```

#### MySQL Setup
```sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    affiliation VARCHAR(255),
    country VARCHAR(100),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Papers table
CREATE TABLE papers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    abstract TEXT,
    authors TEXT,
    keywords TEXT,
    category VARCHAR(100),
    file_path VARCHAR(500),
    status ENUM('submitted', 'under_review', 'accepted', 'rejected', 'revision_required') DEFAULT 'submitted',
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    reviewer_notes TEXT,
    admin_notes TEXT,
    review_score INT CHECK (review_score >= 1 AND review_score <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Similar structure for payments and messages tables...
```

## 🌐 Connecting to Existing Landing Page

### Method 1: Subdomain Integration
```html
<!-- In your main website -->
<a href="https://portal.yourdomain.com" class="btn-primary">
    Access Conference Portal
</a>
```

### Method 2: Path-based Integration
```html
<!-- Deploy portal to /portal subdirectory -->
<a href="/portal" class="btn-primary">
    Conference Portal
</a>
```

### Method 3: Modal/Iframe Integration
```html
<!-- Embed as modal -->
<button onclick="openPortal()">Open Portal</button>
<script>
function openPortal() {
    window.open('/portal', 'portal', 'width=1200,height=800');
}
</script>
```

### Method 4: Single Page Integration
```javascript
// React Router integration
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConferencePortal from './portal/App';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/portal/*" element={<ConferencePortal />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 🔌 API Endpoints

### Authentication
```typescript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Logout  
POST /api/auth/logout
```

### Papers
```typescript
// Get all papers (admin)
GET /api/papers

// Get user papers
GET /api/papers/user/:userId

// Submit paper
POST /api/papers
{
  "title": "Paper Title",
  "abstract": "Abstract text",
  "authors": "Author names",
  "keywords": "keyword1, keyword2",
  "category": "artificial_intelligence",
  "file": "file upload"
}

// Update paper status (admin)
PUT /api/papers/:id
{
  "status": "accepted",
  "admin_notes": "Review comments",
  "review_score": 8
}
```

### Payments
```typescript
// Get payments
GET /api/payments

// Submit payment
POST /api/payments
{
  "amount": 250,
  "currency": "USD",
  "payment_method": "bank_transfer",
  "payment_slip": "file upload"
}

// Update payment status (admin)
PUT /api/payments/:id
{
  "status": "completed",
  "admin_notes": "Payment verified"
}
```

## 🎨 Customization

### Theme Configuration
Edit `tailwind.config.js` to customize colors and styling:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    }
  }
}
```

### Component Customization
Components are located in `src/components/` and `src/pages/`. Each component is fully customizable and follows React best practices.

### Adding New Features
1. Create new components in appropriate directories
2. Add routes in `src/App.tsx`
3. Update navigation in `src/components/Sidebar.tsx`
4. Add corresponding API endpoints if needed

## 📱 Responsive Design

The portal is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Protected routes
- Input validation and sanitization
- Secure file upload handling
- CSRF protection
- XSS prevention

## 🚀 Deployment

### Method 1: Netlify/Vercel
```bash
# Build for production
npm run build

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Deploy to Vercel
npm install -g vercel
vercel --prod
```

### Method 2: Traditional Hosting
```bash
# Build for production
npm run build

# Upload dist/ folder to your web server
# Configure web server to serve index.html for all routes
```

### Method 3: Docker
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🧪 Testing

### Running Tests
```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/
│   ├── components/
│   └── utils/
├── integration/
│   ├── auth.test.ts
│   └── papers.test.ts
└── e2e/
    ├── user-flow.spec.ts
    └── admin-flow.spec.ts
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Authentication Issues**
- Check Lumi project ID and API key
- Verify environment variables
- Check browser console for errors

**File Upload Issues**
- Verify file size limits
- Check file type restrictions
- Ensure proper permissions

**Database Connection Issues**
- Verify Lumi SDK configuration
- Check network connectivity
- Review API endpoint URLs

### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG=true npm run dev
```

## 📚 Additional Resources

- [Lumi SDK Documentation](https://docs.lumi.new)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [TypeScript Documentation](https://typescriptlang.org)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Email: support@ichr2026.org
- Documentation: [Project Wiki](wiki-url)
- Issues: [GitHub Issues](issues-url)

---

**Built with ❤️ for ICHR2026 Conference**
