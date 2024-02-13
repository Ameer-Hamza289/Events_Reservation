const express=require("express")
const router= express.Router();
const { pool } = require('..')

router.get('/rsvps', (req, res) => {
    pool.query('SELECT * FROM rsvps', (err, results) => {
      if (err) {
        console.error('Error fetching RSVPs:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json(results);
    });
  });
  
  router.get('/rsvps/:ev_id', (req, res) => {
    const eventId = req.params.ev_id;
  
    pool.query('SELECT * FROM rsvps WHERE ev_id = ?', [eventId], (err, results) => {
      if (err) {
        console.error('Error fetching RSVPs:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json(results);
    });
  });

  router.delete('/rsvps/:id', (req, res) => {
    const rsvpId = req.params.id;
  
    pool.query('DELETE FROM rsvps WHERE id = ?', [rsvpId], (err, results) => {
      if (err) {
        console.error('Error deleting RSVP:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'RSVP not found' });
      }
  
      res.status(200).json({ message: 'RSVP deleted successfully' });
    });
  });

  router.post('/rsvps/:id/comment', (req, res) => {
    const rsvpId = req.params.id;
    const { comment } = req.body;
  
    pool.query(
      'UPDATE rsvps SET comments = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [comment, rsvpId],
      (err, results) => {
        if (err) {
          console.error('Error adding comment to RSVP:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'RSVP not found' });
        }
  
        res.status(200).json({ message: 'Comment added to RSVP successfully' });
      }
    );
  });
  
module.exports=router