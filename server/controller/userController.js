const express=require("express")
const router=express.Router();
const { pool } = require('..')

// router.post("/login",(req,res)=>{

//     const { username, password } = req.body;

//   // Check if username and password are provided
//   if (!username || !password) {
//     return res.status(400).json({ error: 'Username and password are required' });
//   }

//   pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
//     if (err) {
//       console.error('Error executing login query:', err);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }

//     // Check if user credentials are valid
//     if (results.length > 0) {
//       res.status(200).json({ message: 'Login successfull!',results });
//     } else {
//       res.status(401).json({ error: 'Invalid username or password' });
//     }
//   });

// });

// Create organizer

router.post('/guest-login', (req, res) => {
    const { email, password } = req.body;
  
    pool.query('SELECT id, password FROM guests WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error fetching guest:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const storedPassword = results[0].password;
  
      if (password === storedPassword) {
        // Passwords match, allow login
        res.status(200).json({ message: 'Guest login successful',results });
      } else {
        // Passwords do not match, deny login
        res.status(401).json({ error: 'Invalid email or password' });
      }
    });
  });

router.post('/organizer-login', (req, res) => {
    const { email, password } = req.body;
  
    pool.query('SELECT id, password FROM organizers WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error fetching guest:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      const storedPassword = results[0].password;
  
      if (password === storedPassword) {
        // Passwords match, allow login
        res.status(200).json({ message: 'Organizer login successful',results });
      } else {
        // Passwords do not match, deny login
        res.status(401).json({ error: 'Invalid email or password' });
      }
    });
  });

  router.post('/add-guest-to-event/:ev_id', (req, res) => {
    const {  name, email, phone, password } = req.body;
    const ev_id=req.params.ev_id
  
    // Check if the event exists
    pool.query('SELECT * FROM events WHERE id = ?', [ev_id], (eventErr, eventResults) => {
      if (eventErr) {
        console.error('Error checking event existence:', eventErr);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (eventResults.length === 0) {
        // Event not found
        return res.status(404).json({ error: 'Event not found' });
      }
  
      const { schedule } = eventResults[0];
  
      // If the event exists, proceed with guest registration
      pool.query(
        'INSERT INTO guests (ev_id, name, email, phone, password) VALUES (?, ?, ?, ?, ?)',
        [ev_id, name, email, phone, password],
        (guestErr, guestResults) => {
          if (guestErr) {
            console.error('Error creating guest:', guestErr);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
  
          const gu_id = guestResults.insertId;
  
          // Create an invitation with validupto set to the schedule of the event
          pool.query(
            'INSERT INTO invitations (ev_id, gu_id, validupto) VALUES (?, ?, ?)',
            [ev_id, gu_id, schedule],
            (invitationErr, invitationResults) => {
              if (invitationErr) {
                console.error('Error creating invitation:', invitationErr);
                return res.status(500).json({ error: 'Internal Server Error' });
              }
  
              const invitationId = invitationResults.insertId;
  
              // Create an automatic RSVP
              pool.query(
                'INSERT INTO rsvps (ev_id, gu_id, rsvp_status, comments) VALUES (?, ?, ?, ?)',
                [ev_id, gu_id, 'Pending', ''],
                (rsvpErr) => {
                  if (rsvpErr) {
                    console.error('Error creating automatic RSVP:', rsvpErr);
                    return res.status(500).json({ error: 'Internal Server Error' });
                  }
  
                  res.status(201).json({
                    id: invitationId,
                    message: 'Guest added to the event with automatic Invitation and RSVP',
                  });
                }
              );
            }
          );
        }
      );
    });
  });
  



// router.post('/guests/:ev_id', (req, res) => {
//   const { name, email, phone, password } = req.body;
//   // console.log(req.body,"body");
//   const evId = req.params.ev_id;
//   const existingEvent =  pool.query('SELECT * FROM events WHERE id = ?', [evId]);

//   if (existingEvent.length === 0) {
//     return res.status(404).json({ error: 'Event not found' });
//   }
//   const existingGuest = pool.query('SELECT * FROM guests WHERE email = ? AND ev_id = ?', [email, evId]);
//   if (existingGuest.length > 0) {
//     return res.status(400).json({ error: 'Email is already registered for this event' });
//   }
//  if(!name || !email || !phone || !password){
//   return res.status(400).json({ error: 'Name, Email, Phone and Password are required fields' });
//  }

//   // Check if the email is already registered
//   pool.query('SELECT * FROM guests WHERE email = ?', [email], (err, results) => {
//     if (err) {
//       console.error('Error checking existing email:', err);
//       return res.status(500).json({ error: 'Internal Server Error' });
//     }

//     if (results.length > 0) {
//       return res.status(400).json({ error: 'Email is already registered' });
//     }

//     // Email is not registered, proceed with guest sign-up
//     pool.query(
//       'INSERT INTO guests (ev_id,name, email, phone, password) VALUES (?,?, ?, ?, ?)',
//       [evId,name, email, phone, password],
//       (err, results) => {
//         if (err) {
//           console.error('Error creating guest account:', err);
//           return res.status(500).json({ error: 'Internal Server Error' });
//         }

//         res.status(201).json({ id: results.id, message: 'Guest registered for the event successfully' });
//       }
//     );
//   });
// });


router.post('/organizers', (req, res) => {
    const { name, email, phone, password } = req.body;
  
    pool.query(
      'INSERT INTO organizers (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name, email, phone, password],
      (err, results) => {
        if (err) {
          console.error('Error creating organizer:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        res.status(201).json({ id: results.insertId, message: 'Organizer created successfully' });
      }
    );
  });
  
  // Get all organizers
  router.get('/organizers', (req, res) => {
    pool.query('SELECT * FROM organizers', (err, results) => {
      if (err) {
        console.error('Error fetching organizers:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json(results);
    });
  });
  
  // Get guest by ID
  router.get('/guest/:id', (req, res) => {
    const { id } = req.params;
  
    pool.query('SELECT * FROM guests WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error fetching guest:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Guest not found' });
      }
  
      res.status(200).json(results[0]);
    });
  });

  //get organizer
  router.get('/organizers/:id', (req, res) => {
    const { id } = req.params;
  
    pool.query('SELECT * FROM organizers WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error fetching organizer:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Organizer not found' });
      }
  
      res.status(200).json(results[0]);
    });
  });
  
  // Update organizer by ID
  router.put('/organizers/:id', (req, res) => {
    const { id } = req.params;
    const { name,  phone, password } = req.body;
  
    pool.query(
      'UPDATE organizers SET name = ?, phone = ?, password = ? WHERE id = ?',
      [name, phone, password, id],
      (err) => {
        if (err) {
          console.error('Error updating organizer:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        res.status(200).json({ message: 'Organizer updated successfully' });
      }
    );
  });


  router.put('/guest/:id', (req, res) => {
    const { id } = req.params;
    const { name,  phone, password } = req.body;
  
    pool.query(
      'UPDATE guests SET name = ?, phone = ?, password = ? WHERE id = ?',
      [name, phone, password, id],
      (err) => {
        if (err) {
          console.error('Error updating guest:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        res.status(200).json({ message: 'Guest updated successfully' });
      }
    );
  });
  
  // Delete organizer by ID
  router.delete('/organizers/:id', (req, res) => {
    const { id } = req.params;
  
    pool.query('DELETE FROM organizers WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error deleting organizer:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Organizer not found' });
      }
  
      res.status(200).json({ message: 'Organizer deleted successfully' });
    });
  });


  // Delete guest by ID
  // router.delete('/guest/:id', (req, res) => {
  //   const { id } = req.params;
  
  //   pool.query('DELETE FROM guests WHERE id = ?', [id], (err, results) => {
  //     if (err) {
  //       console.error('Error deleting guest:', err);
  //       return res.status(500).json({ error: 'Internal Server Error' });
  //     }
  
  //     if (results.affectedRows === 0) {
  //       return res.status(404).json({ error: 'Guest not found' });
  //     }
  
  //     res.status(200).json({ message: 'Guest deleted successfully' });
  //   });
  // });

  router.delete('/guest/:id', (req, res) => {
    const { id } = req.params;
  
    // Delete records from the junction table (guests_events)
    // pool.query('DELETE FROM guests_events WHERE guest_id = ?', [id], (junctionErr) => {
    //   if (junctionErr) {
    //     console.error('Error deleting guest from events:', junctionErr);
    //     return res.status(500).json({ error: 'Internal Server Error' });
    //   }
  
      // Delete records from the invitations table
      pool.query('DELETE FROM invitations WHERE gu_id = ?', [id], (invitationsErr) => {
        if (invitationsErr) {
          console.error('Error deleting invitations:', invitationsErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        // Delete records from the rsvps table
        pool.query('DELETE FROM rsvps WHERE gu_id = ?', [id], (rsvpsErr) => {
          if (rsvpsErr) {
            console.error('Error deleting rsvps:', rsvpsErr);
            return res.status(500).json({ error: 'Internal Server Error' });
          }
  
          // Delete the guest from the guests table
          pool.query('DELETE FROM guests WHERE id = ?', [id], (err, results) => {
            if (err) {
              console.error('Error deleting guest:', err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
  
            if (results.affectedRows === 0) {
              return res.status(404).json({ error: 'Guest not found' });
            }
  
            res.status(200).json({ message: 'Guest and related records deleted successfully' });
          });
        });
      });
    // });
  });
  


module.exports=router