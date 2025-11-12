# Framez - Social Media App

A mobile social media application built with React Native (Expo) and Supabase, allowing users to share posts with text and images.

## Features

✅ **User Authentication**
- Email/password registration and login
- Persistent sessions (stay logged in)
- Secure Supabase Authentication

✅ **Posts**
- Create posts with text and/or images
- Real-time feed updates
- Chronological post ordering
- Image upload to Supabase Storage

✅ **User Profile**
- Display user information
- View all user's posts
- Post count statistics
- Logout functionality

## Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based)
- **Backend**: Supabase
  - Authentication
  - PostgreSQL Database
  - Storage (images)
- **Language**: TypeScript
- **UI**: React Native components, Ionicons

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio (for emulator)
- Expo Go app on your physical device (optional)

### Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details
   - Wait for database to provision (~2 minutes)

2. **Get Your API Credentials**
   - Go to Project Settings → API
   - Copy your `Project URL` (SUPABASE_URL)
   - Copy your `anon/public` key (SUPABASE_ANON_KEY)

3. **Create Database Tables**

Run this SQL in the Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES auth.users NOT NULL,
  author_name TEXT NOT NULL,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);
```

4. **Create Storage Bucket**

Run this SQL:

```sql
-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- Set up storage policies
CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-images' 
    AND auth.role() = 'authenticated'
  );
```

5. **Update Config File**

Edit `config/supabase.ts` with your credentials:

```typescript
const supabaseUrl = 'https://xxxxx.supabase.co'; // Your Project URL
const supabaseAnonKey = 'your-anon-key-here'; // Your anon/public key
```

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd framez
```

2. Install dependencies:
```bash
npm install
```

3. Update Supabase config in `config/supabase.ts`

4. Start the development server:
```bash
npx expo start
```

5. Run on device/emulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
framez/
├── app/
│   ├── (auth)/           # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/           # Main app tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx     # Home feed
│   │   └── profile.tsx
│   ├── _layout.tsx       # Root layout with auth routing
│   └── create-post.tsx   # Create post modal
├── components/
│   ├── PostCard.tsx      # Post display component
│   └── LoadingScreen.tsx
├── config/
│   └── supabase.ts       # Supabase configuration
└── contexts/
    └── AuthContext.tsx   # Authentication state management
```

## Database Schema

### users
- `id` (UUID, Primary Key)
- `email` (TEXT, Unique)
- `display_name` (TEXT)
- `created_at` (TIMESTAMP)

### posts
- `id` (UUID, Primary Key)
- `author_id` (UUID, Foreign Key → users.id)
- `author_name` (TEXT)
- `text` (TEXT, Optional)
- `image_url` (TEXT, Optional)
- `created_at` (TIMESTAMP)

## Features Implemented

### Authentication Flow
- Protected routes (redirects to login if not authenticated)
- Session persistence using AsyncStorage
- Auto-redirect after login/logout
- Supabase Auth with Row Level Security

### Post Management
- Create posts with text (up to 500 characters)
- Upload images from device gallery
- Image compression and optimization
- Real-time feed updates using Supabase Realtime
- Automatic public URL generation for images

### User Interface
- Instagram-inspired design
- Clean, minimal aesthetic
- Responsive layouts
- Loading states and error handling
- Pull-to-refresh on feed
- Empty states for no content

## Testing

### On iOS Simulator
```bash
npx expo start --ios
```

### On Android Emulator
```bash
npx expo start --android
```

### On Physical Device
1. Install Expo Go from App Store/Play Store
2. Run `npx expo start`
3. Scan QR code with camera (iOS) or Expo Go (Android)

## Deployment to Appetize.io

1. Build the app:
```bash
eas build --platform android --profile preview
```

2. Download the APK file

3. Upload to [appetize.io](https://appetize.io/):
   - Sign up for account
   - Upload APK
   - Get public link

## Known Issues & Solutions

- **Images not loading**: Check Supabase Storage bucket is public
- **Auth not persisting**: Ensure AsyncStorage is properly configured
- **Realtime not working**: Check if Realtime is enabled in Supabase project settings

## Supabase vs Firebase

**Why Supabase?**
- ✅ No credit card required for free tier
- ✅ Open source
- ✅ PostgreSQL database (more powerful)
- ✅ Built-in Row Level Security
- ✅ Real-time subscriptions included
- ✅ RESTful API auto-generated

## Future Enhancements

- [ ] Like and comment functionality
- [ ] Follow/unfollow users
- [ ] User search
- [ ] Push notifications
- [ ] Direct messaging
- [ ] Profile picture upload
- [ ] Post editing and deletion
- [ ] Image filters

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License

## Contact

For questions or support, please open an issue in the repository.

---

Built with ❤️ using React Native & Supabase
