# Multiplayer 3D Builder Challenge

A real-time multiplayer 3D building experience built with Next.js, TypeScript, Three.js, and Supabase. Collaborate with other users in a shared 3D world where you can add, move, and delete objects in real-time.

## 🚀 Features

### Part 1 - Authentication System (Supabase)
- ✅ Email + Password Signup & Signin
- ✅ Google OAuth Signin
- ✅ Persistent login session (user stays logged in until logout)
- ✅ Logged-in user's name displayed in the header

### Part 2 - Multiplayer 3D Builder
- ✅ Shared 3D world for all logged-in users
- ✅ Real-time synchronization (add, move, delete objects)
- ✅ Live player list with presence tracking
- ✅ Camera controls (orbit, zoom, pan with Figma-style Shift+drag)
- ✅ User representation with unique colors and name labels
- ✅ Static building blocks (cubes and spheres) for precise construction

### Part 3 - 3D World Enhancements
- ✅ Procedural skybox with realistic sky rendering
- ✅ Enhanced lighting setup (ambient, directional, point lights)
- ✅ Animated user avatars (floating indicators for other players)
- ✅ Unique visual identity per user (color, name tags)
- ✅ Scene persistence (save/load functionality)
- ✅ Fully responsive design (desktop + mobile)

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 14 with TypeScript
- **3D Library**: React Three Fiber (@react-three/fiber) + Drei (@react-three/drei)
- **Realtime Engine**: Supabase Realtime
- **Auth & Storage**: Supabase
- **State Management**: Zustand
- **Styling**: Tailwind CSS

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account (free tier works)
- npm or yarn package manager

## 🔧 Setup Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/DualBorn/multiplayer-3d-builder-webapp.git
cd multiplayer-3d-builder-webapp
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Fill in your project details (name, database password, region)
   - Wait for the project to be created (takes ~2 minutes)

2. **Get Your Supabase Credentials**
   - In your Supabase project dashboard, go to **Settings** → **API**
   - Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy your **anon/public key** (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

3. **Set Up Database Tables**
   - In your Supabase dashboard, go to **SQL Editor**
   - Click "New Query"
   - Copy and paste the contents of `supabase/schema.sql` into the editor
   - Click "Run" to execute the SQL
   - This will create the `scene_objects` and `saved_scenes` tables with proper permissions

4. **Enable Realtime**
   - The SQL schema automatically enables Realtime for the `scene_objects` table
   - You can verify this in **Database** → **Replication** - the `scene_objects` table should be listed
   - If it's not enabled, you can manually toggle it in the Replication section

5. **Set Up Google OAuth (Optional but Recommended)**
   - Go to **Authentication** → **Providers** in your Supabase dashboard
   - Enable "Google" provider
   - You'll need to create a Google OAuth app:
     - Go to [Google Cloud Console](https://console.cloud.google.com/)
     - Create a new project or select existing
     - Go to "APIs & Services" → "Credentials"
     - Click "Create Credentials" → "OAuth client ID"
     - If prompted, configure the OAuth consent screen first (choose "External" user type)
     - Choose "Web application" as the application type
     - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
       - Replace `<your-project-ref>` with your actual Supabase project reference (found in your Supabase URL)
     - Copy the Client ID and Client Secret
   - Paste them into the Google provider settings in Supabase
   - Save the changes

### Step 4: Configure Environment Variables

1. **Create `.env.local` file**
   - Create a new file named `.env.local` in the root directory

2. **Fill in your Supabase credentials**
   - Open `.env.local` in your editor
   - Add the following variables with your actual Supabase credentials:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   
   - Replace `https://xxxxx.supabase.co` with your actual Supabase Project URL
   - Replace `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` with your actual Supabase anon/public key

### Step 5: Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Use

1. **Sign Up / Sign In**
   - Create an account with email/password or sign in with Google
   - You'll be redirected to the 3D builder after authentication

2. **Add Objects**
   - Use the toolbar on the right to select object type (Cube or Sphere)
   - Click "Add Cube" or "Add Sphere" to place objects in the scene
   - Objects appear at random positions in the scene

3. **Interact with Objects**
   - **Click**: Select an object (it will glow and show the creator's username)
   - **Double-click**: Delete an object (with confirmation)
   - **Drag**: Move objects around the scene (click and drag to reposition)
   - **Click empty space**: Deselect the current object

4. **Camera Controls**
   - **Left-click + drag**: Rotate camera around the scene
   - **Shift + Left-click + drag**: Pan camera (Figma-style)
   - **Right-click + drag**: Pan camera (alternative method)
   - **Middle-click + drag**: Zoom in/out
   - **Scroll wheel**: Zoom in/out
   - **Note**: Camera controls are automatically disabled while dragging objects to prevent conflicts

5. **View Other Players**
   - See all connected players in the "Players" section
   - Each player has a unique color
   - Your own name is highlighted
   - Other players appear as floating colored spheres in the 3D scene

6. **Save & Load Scenes**
   - Enter a scene name and click "Save Scene"
   - Click "Load Saved Scenes" to see your saved scenes
   - Click "Load" on any saved scene to restore it
   - Click "Delete" to remove a saved scene

## 📱 Mobile Support

The application is fully responsive:
- On mobile devices, the sidebar is hidden by default
- Tap the menu button (☰) in the header to open the sidebar
- Tap outside the sidebar (on the overlay) to close it
- Touch controls work for camera rotation, zoom, and object manipulation
- The interface adapts to smaller screens with optimized button sizes

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
   - Click "Deploy"
   - Wait for deployment to complete

3. **Update Supabase Redirect URLs**
   - In Supabase dashboard, go to **Authentication** → **URL Configuration**
   - Add your Vercel URL to "Redirect URLs"
   - Update Google OAuth redirect URI if you're using Google auth

### Deploy to Netlify

1. **Push your code to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [https://app.netlify.com](https://app.netlify.com)
   - Sign in with GitHub
   - Click "New site from Git"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables (same as Vercel)
   - Click "Deploy site"

3. **Update Supabase Redirect URLs** (same as Vercel)

## 📁 Project Structure

```
├── app/
│   ├── auth/
│   │   └── callback/        # OAuth callback handler
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/
│   ├── AuthPage.tsx         # Authentication UI
│   ├── BuilderPage.tsx      # Main builder interface
│   ├── Scene3D.tsx          # 3D scene setup
│   ├── SceneObjects.tsx     # 3D objects rendering
│   ├── UserAvatars.tsx      # User presence avatars
│   ├── Toolbar.tsx          # Object creation toolbar
│   ├── PlayerList.tsx       # Live player list
│   └── SaveLoadPanel.tsx    # Scene save/load
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Supabase client
│   │   └── server.ts        # Supabase server client
│   └── store/
│       ├── useAuthStore.ts  # Auth state management
│       ├── useSceneStore.ts # Scene state management
│       └── usePresenceStore.ts # Presence state management
├── supabase/
│   └── schema.sql           # Database schema
└── README.md
```

## 🔒 Security Notes

- The `.env.local` file is gitignored - never commit your actual Supabase credentials
- Row Level Security (RLS) is enabled on all tables
- Scene objects are publicly readable/writable for multiplayer functionality
- Saved scenes are user-specific (users can only manage their own scenes)

## 🐛 Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists in the root directory
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your development server after adding or modifying environment variables
- Check that there are no typos or extra spaces in the `.env.local` file

### Objects not syncing in real-time
- Verify that Realtime is enabled for `scene_objects` table (check Database → Replication in Supabase)
- Ensure your Supabase credentials in `.env.local` are correct
- Check browser console for any WebSocket connection errors
- Make sure you've run the SQL schema which includes the Realtime publication setup

### Google OAuth not working
- Verify Google OAuth is enabled in Supabase dashboard (Authentication → Providers)
- Check that the redirect URI in Google Cloud Console matches exactly: `https://<your-project-ref>.supabase.co/auth/v1/callback`
- Ensure you selected "External" user type when setting up OAuth consent screen
- Verify that Client ID and Client Secret are correctly pasted in Supabase (no extra spaces)

### Database errors
- Make sure you've run the SQL schema (`supabase/schema.sql`) in Supabase SQL Editor
- Check that `scene_objects` and `saved_scenes` tables exist in your Supabase database
- Verify Row Level Security (RLS) policies are set up correctly
- Check the Supabase logs for any specific error messages

### Objects not appearing after adding
- Check browser console for any errors
- Verify you're logged in (check the header for your username)
- Ensure the Supabase table has the correct column names (snake_case: `user_id`, `user_name`, `created_at`)
- Check that your Supabase project is active and not paused

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- 3D rendering powered by [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- Real-time features by [Supabase](https://supabase.com/)
- UI styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Happy Building! 🎨✨**

