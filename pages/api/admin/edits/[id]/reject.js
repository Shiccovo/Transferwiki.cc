import { getServerSession } from "next-auth";
import { pageEditOperations } from "../../../../../lib/db";
import { authOptions } from "../../../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  // Check if user is authenticated and is an admin
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to access this resource' });
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'You do not have permission to access this resource' });
  }

  if (req.method === 'POST') {
    try {
      // Update edit status
      const edit = await pageEditOperations.updateEditStatus(id, "REJECTED");

      if (!edit) {
        return res.status(404).json({ error: 'Edit not found' });
      }

      return res.status(200).json({ message: 'Edit rejected successfully' });
    } catch (error) {
      console.error('Error rejecting edit:', error);
      return res.status(500).json({ error: 'Failed to reject edit' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}