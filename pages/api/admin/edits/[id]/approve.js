import { getServerSession } from "next-auth";
import { prisma } from "../../../../../lib/prisma";
import path from 'path';
import fs from 'fs';
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
      // Get the edit
      const edit = await prisma.pageEdit.findUnique({
        where: { id },
      });

      if (!edit) {
        return res.status(404).json({ error: 'Edit not found' });
      }

      // Clean the path to avoid directory traversal attacks
      const cleanPath = edit.pagePath.replace(/^\/+|\/+$/g, '');
      
      // Handle root path (index.mdx)
      const filePath = cleanPath === '' || cleanPath === '/' 
        ? path.join(process.cwd(), 'pages', 'index.mdx')
        : path.join(process.cwd(), 'pages', `${cleanPath}.mdx`);

      // Make sure the directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write content to file
      fs.writeFileSync(filePath, edit.content, 'utf8');
      
      // Update edit status
      await prisma.pageEdit.update({
        where: { id },
        data: { status: "APPROVED" },
      });

      return res.status(200).json({ message: 'Edit approved and applied successfully' });
    } catch (error) {
      console.error('Error approving edit:', error);
      return res.status(500).json({ error: 'Failed to approve edit' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}