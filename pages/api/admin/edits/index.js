import { getServerSession } from "next-auth";
import { pageEditOperations } from "../../../../lib/db";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  // Check if user is authenticated and is an admin
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this resource' });
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'You do not have permission to access this resource' });
  }

  if (req.method === 'GET') {
    try {
      const pendingEdits = await pageEditOperations.getPendingEdits();

      return res.status(200).json(pendingEdits);
    } catch (error) {
      console.error('Error fetching pending edits:', error);
      return res.status(500).json({ error: 'Failed to fetch pending edits' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}