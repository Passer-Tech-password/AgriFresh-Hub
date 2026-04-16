# AgriFresh Hub

Nigeria's premium agri-tech marketplace for Rivers State.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Database/Auth/Storage:** Firebase (Firestore, Auth, Storage)
- **Styling:** Tailwind CSS + Framer Motion
- **Payments:** Paystack
- **Icons:** Lucide React

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AgriFresh-Hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add the following (see `.env.example` for reference):
   
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_key
   ```

4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password).
   - Create a **Cloud Firestore** database.
   - Enable **Cloud Storage**.
   - (Optional) Set up Firestore rules and Storage rules.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Seed Data (Admin Only)**
   Navigate to `/admin/seed` in your local environment to initialize the marketplace with test vendors and products.

## Deployment on Vercel

1. Push your code to a GitHub repository.
2. Connect the repository to [Vercel](https://vercel.com/).
3. Add all the environment variables from your `.env.local` to the Vercel project settings.
4. Deploy!

## License
AgriFresh Hub © 2026 – Port Harcourt, Nigeria
