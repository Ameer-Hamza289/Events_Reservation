const express=require("express")
const router=express.Router();
const { pool } = require('..')


router.post('/create', (req, res) => {
    const { ev_id, gu_id, validupto } = req.body;
  
    pool.query(
      'INSERT INTO invitations (ev_id, gu_id, validupto) VALUES (?, ?, ?)',
      [ev_id, gu_id, validupto],
      (err, results) => {
        if (err) {
          console.error('Error creating invitation:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        res.status(201).json({ id: results.insertId, message: 'Invitation created successfully' });
      }
    );
  });

router.post('/create-invitations', (req, res) => {
    const { ev_id, gu_id, validupto } = req.body;
     
    pool.query(
      'INSERT INTO invitations (ev_id, gu_id, validupto) VALUES (?, ?, ?)',
      [ev_id, gu_id, validupto],
      (err, invitationResults) => {
        if (err) {
          console.error('Error creating invitation:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        const invitationId = invitationResults.insertId;
         
        pool.query(
          'INSERT INTO rsvps (ev_id, gu_id, status, comments) VALUES (?, ?, ?, ?)',
          [ev_id, gu_id, 'Pending', ''],
          (err) => {
            if (err) {
              console.error('Error creating automatic RSVP:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
  
            res.status(201).json({ id: invitationId, message: 'Invitation and RSVP created successfully' });
          }
        );
      }
    );
  });  

router.get('/invitations-by-guest/:gu_id', (req, res) => {
    const guestUserId = req.params.gu_id;
  
    pool.query('SELECT * FROM invitations WHERE gu_id = ?', [guestUserId], (err, results) => {
      if (err) {
        console.error('Error fetching invitations by guest user:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json(results);
    });
  });

router.put('/change-status/:id', (req, res) => {
    const invitationId = req.params.id;
    const { status } = req.body;
  
    pool.query(
      'UPDATE invitations SET status = ? WHERE id = ?',
      [status, invitationId],
      (err) => {
        if (err) {
          console.error('Error updating invitation status:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        res.status(200).json({ message: 'Invitation status updated successfully' });
      }
    );
  });


  router.put('/add-comment', (req, res) => {
    const { comment, gu_id, ev_id } = req.body;
  
    if (comment && gu_id && ev_id) { // Ensure all required fields are present
      pool.query(
        'UPDATE rsvps SET  comments = ? WHERE gu_id = ? AND ev_id = ?',
        [ comment, gu_id, ev_id], 
        (rsvpErr) => {
          if (rsvpErr) {
            console.error('Error updating RSVP status and comment:', rsvpErr);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
  
          res.status(200).json({ message: 'Comment added successfully' });
        }
      );
    } else {
      res.status(400).json({ error: 'Bad Request - Missing required fields' });
    }
  });
  

router.put('/update-status/:invitationId', (req, res) => {
    const invitationId = req.params.invitationId;
    const { status ,gu_id,ev_id} = req.body;

    // console.log(req.body);
  
    // Update the status of the invitation
    pool.query(
      'UPDATE invitations SET status = ? WHERE id = ?',
      [status, invitationId],
      (invitationErr) => {
        if (invitationErr) {
          console.error('Error updating invitation status:', invitationErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        // If a comment is provided, update the comment in the corresponding RSVP
        // if (comment) {
        //   pool.query(
        //     'UPDATE rsvps SET rsvp_status = ?, comments = ? WHERE gu_id = ? AND ev_id = ?',
        //     [status, comment, gu_id, ev_id],
        //     (rsvpErr) => {
        //       if (rsvpErr) {
        //         console.error('Error updating RSVP status and comment:', rsvpErr);
        //         return res.status(500).json({ error: 'Internal Server Error' });
        //       }
  
        //       res.status(200).json({ message: 'Status and comment updated successfully' });
        //     }
        //   );
        // } else {
          // If no comment is provided, update only the status in the corresponding RSVP
          pool.query(
            'UPDATE rsvps SET rsvp_status = ? WHERE gu_id = ? AND ev_id = ?',
            [status, gu_id, ev_id],
            (rsvpErr) => {
              if (rsvpErr) {
                console.error('Error updating RSVP status:', rsvpErr);
                return res.status(500).json({ error: 'Internal Server Error' });
              }
  
              res.status(200).json({ message: 'Status updated successfully' });
            }
          );
        // }
      }
    );
  });
  

router.delete('/remove/:id', (req, res) => {
    const invitationId = req.params.id;
  
    pool.query('DELETE FROM invitations WHERE id = ?', [invitationId], (err, results) => {
      if (err) {
        console.error('Error deleting invitation:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Invitation not found' });
      }
  
      res.status(200).json({ message: 'Invitation deleted successfully' });
    });
  });


module.exports=router