import { getServerSession } from "next-auth";
import { commentOperations } from "../../../lib/db";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'GET') {
    try {
      const { pagePath } = req.query;
      
      if (!pagePath) {
        return res.status(400).json({ error: "Missing pagePath parameter" });
      }

      const comments = await commentOperations.getCommentsByPage(pagePath);

      return res.status(200).json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  } 
  
  else if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: 'You must be signed in to comment' });
    }

    try {
      const { content, pagePath } = req.body;
      
      if (!content || !pagePath) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const comment = await commentOperations.createComment({
        content,
        pagePath,
        userId: session.user.id,
      });

      return res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      return res.status(500).json({ error: 'Failed to create comment' });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}