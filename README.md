# MRB Law Firm - Next.js Application

A modern, full-stack law firm website built with Next.js 14, TypeScript, Bootstrap, Tailwind CSS, and MySQL. Features appointment scheduling, file management capabilities, and a responsive design.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Bootstrap 5.3** - UI component framework
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **SWR** - Data fetching and caching

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MySQL 2** - Database driver
- **Nodemailer** - Email notifications
- **bcryptjs** - Password hashing
- **JWT** - Authentication tokens

### Database
- **MySQL** - Relational database
- **Connection Pooling** - Optimized database connections

## 📁 Project Structure

```
mrb-law-firm/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── appointments/  # Appointment endpoints
│   │   │   ├── practice-areas/# Practice area endpoints
│   │   │   └── testimonials/  # Testimonial endpoints
│   │   ├── appointment/       # Appointment booking page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx          # Homepage
│   │   └── providers.tsx      # Client-side providers
│   ├── components/            # React components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # UI components
│   ├── lib/                  # Utility libraries
│   │   ├── db.ts            # Database connection
│   │   └── email.ts         # Email utilities
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── scripts/                 # Database scripts
│   ├── migrate.js          # Database migrations
│   └── seed.js             # Database seeding
├── public/                 # Static assets
├── .env.local             # Environment variables
├── .env.example           # Environment template
├── package.json           # Dependencies
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── next.config.js         # Next.js configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mrb-law-firm
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
```

Required environment variables:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=mrb_law_firm

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Settings
APP_NAME=MRB Law Firm
APP_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

### Tables

#### `appointments`
- Stores client consultation requests
- Includes personal info, preferred dates, case descriptions
- Status tracking (pending, confirmed, completed, cancelled)

#### `practice_areas`
- Legal practice area definitions
- Used for form dropdowns and homepage display

#### `testimonials`
- Client testimonials and ratings
- Displayed on homepage

#### `admin_users`
- Admin user accounts for future admin panel
- Encrypted passwords and role-based access

## 🔧 API Endpoints

### Appointments
- `GET /api/appointments` - List appointments (admin)
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/[id]` - Get single appointment
- `PUT /api/appointments/[id]` - Update appointment status
- `DELETE /api/appointments/[id]` - Cancel appointment

### Practice Areas
- `GET /api/practice-areas` - List practice areas

### Testimonials
- `GET /api/testimonials` - List testimonials

## 🎨 Styling Architecture

### CSS Framework Integration
- **Bootstrap**: Component structure and responsive grid
- **Tailwind CSS**: Utility classes for custom styling
- **Custom CSS**: Brand-specific styles and animations

### Design System
- **Colors**: Indigo primary palette with dark theme
- **Typography**: Inter font family
- **Components**: Glass morphism cards, gradient buttons
- **Animations**: Fade-in effects, hover transitions

## 📧 Email System

### Features
- Appointment confirmation emails
- Admin notifications
- HTML and text email templates
- SMTP configuration support

### Email Types
- **Confirmation**: Sent to clients after booking
- **Reminder**: Appointment reminders (future feature)
- **Cancellation**: Cancellation notifications

## 🔒 Security Features

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection (Next.js built-in)

### Authentication Ready
- JWT token support
- Password hashing with bcrypt
- Admin user system prepared

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Features
- Mobile-first approach
- Touch-friendly interfaces
- Optimized navigation
- Responsive forms

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Variables
Ensure all production environment variables are set:
- Database credentials
- SMTP configuration
- Security secrets
- Domain URLs

### Deployment Platforms
- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS**
- **DigitalOcean**

## 📈 Performance Optimizations

### Next.js Features
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Static Generation**: Pre-rendered pages where possible
- **API Routes**: Serverless functions

### Database
- **Connection Pooling**: Efficient database connections
- **Indexed Queries**: Optimized database queries
- **Query Optimization**: Minimal data fetching

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with initial data
```

### Code Quality
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting (recommended)

## 🔧 Customization

### Adding New Practice Areas
1. Add to database via admin panel or direct SQL
2. Update TypeScript types if needed
3. Icons automatically handled

### Modifying Email Templates
- Edit templates in `src/lib/email.ts`
- Support for HTML and text versions
- Dynamic content insertion

### Styling Changes
- Modify CSS variables in `globals.css`
- Update Tailwind config for theme changes
- Bootstrap customization via SCSS (optional)

## 📞 Support & Maintenance

### Monitoring
- Database connection health
- Email delivery status
- Form submission success rates
- Performance metrics

### Regular Tasks
- Database backups
- Security updates
- Content updates
- Performance optimization

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

### Code Standards
- TypeScript for type safety
- ESLint configuration
- Component documentation
- API endpoint documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

**MRB Law Firm**
- **Email**: MRBLAW@gmail.com
- **Phone**: 0967942489
- **Address**: 123 Legal Ave, Justice City, Lawland

---

**Version**: 2.0.0 (Next.js)  
**Last Updated**: 2024  
**Framework**: Next.js 14 with TypeScript