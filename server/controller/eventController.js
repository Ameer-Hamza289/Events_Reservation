const express = require('express');
const router=express.Router();
const { pool } = require('..')


router.post('/events', (req, res) => {
  const { name, venue, schedule, starting_time, ending_time, description, org_id } = req.body;

  // Check if an event with the same name already exists
  pool.query('SELECT * FROM events WHERE name = ?', [name], (checkErr, checkResults) => {
    if (checkErr) {
      console.error('Error checking event existence:', checkErr);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (checkResults.length > 0) {
      // An event with the same name already exists
      return res.status(400).json({ error: 'Event with the same name already exists' });
    }

    // If the check passes, proceed with creating the new event
    pool.query(
      'INSERT INTO events (name, venue, schedule, starting_time, ending_time, description, org_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, venue, schedule, starting_time, ending_time, description, org_id],
      (insertErr, results) => {
        if (insertErr) {
          console.error('Error creating event:', insertErr);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        res.status(201).json({ id: results.insertId, message: 'Event created successfully' });
      }
    );
  });
});


router.get('/events', (req, res) => {
    pool.query('SELECT * FROM events', (err, results) => {
      if (err) {
        console.error('Error fetching events:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json(results);
    });
  });

router.get('/events/:id', (req, res) => {
    const eventId = req.params.id;
  
    pool.query('SELECT * FROM events WHERE id = ?', [eventId], (err, results) => {
      if (err) {
        console.error('Error fetching event:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      res.status(200).json(results[0]);
    });
  });

router.put('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const { name, venue, schedule, starting_time, ending_time, description, org_id } = req.body;
  
    pool.query(
      'UPDATE events SET name = ?, venue = ?, schedule = ?, starting_time = ?, ending_time = ?, description = ?, org_id = ? WHERE id = ?',
      [name, venue, schedule, starting_time, ending_time, description, org_id, eventId],
      (err) => {
        if (err) {
          console.error('Error updating event:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
  
        res.status(200).json({ message: 'Event updated successfully' });
      }
    );
  });

router.delete('/events/:id', (req, res) => {
    const eventId = req.params.id;
  
    pool.query('DELETE FROM events WHERE id = ?', [eventId], (err, results) => {
      if (err) {
        console.error('Error deleting event:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      res.status(200).json({ message: 'Event deleted successfully' });
    });
  });

//get organizer's events
router.get('/events-by-organizer/:org_id', (req, res) => {
    const orgId = req.params.org_id;
  
    pool.query('SELECT * FROM events WHERE org_id = ?', [orgId], (err, results) => {
      if (err) {
        console.error('Error fetching events by organizer:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      res.status(200).json(results);
    });
  });

//get guests for particular event
router.get('/events/:ev_id/guests', (req, res) => {
  const evId = req.params.ev_id;

  pool.query('SELECT * FROM guests WHERE ev_id = ?', [evId], (err, results) => {
    if (err) {
      console.error('Error retrieving guests:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.status(200).json(results);
  });
});





module.exports=router