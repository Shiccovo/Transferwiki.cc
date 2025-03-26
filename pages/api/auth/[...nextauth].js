import { supabase } from '../../../lib/supabase';

export const authOptions = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  }
};

export default async function handler(req, res) {
  res.status(200).json({ message: 'Using Supabase Auth instead of NextAuth' });
}