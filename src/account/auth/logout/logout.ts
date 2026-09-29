import express, { Request, Response } from 'express';

const logoutRoute = express.Router();

logoutRoute.post('/logout', async (req: Request, res: Response): Promise<Response> => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({success:false, error: 'Failed to destroy session' });
        }
      });
    }

    return res.status(200).json({success:true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({success:false, error: 'Internal Server Error' });
  }
});

export default logoutRoute;
