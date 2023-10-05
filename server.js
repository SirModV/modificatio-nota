const express = require('express');
const fsPromises = require('fs').promises;
const path = require('path');
const { v4: uniqueID } = require('uuid');

const serverApp = express();
const SERVER_PORT = process.env.PORT || 3001;

serverApp.use(express.urlencoded({ extended: true }));
serverApp.use(express.json());
serverApp.use(express.static(path.join(__dirname, 'public')));

// Asynchronous function to get notes
//coded with help from coding tutor 
const retrieveNotes = async () => {
    const data = await fsPromises.readFile('./db/db.json', 'utf8');
    return JSON.parse(data);
};

serverApp.get('/api/notes', async (req, res) => {
    try {
        const notes = await retrieveNotes();
        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error getting notes.');
    }
});

serverApp.post('/api/notes', async (req, res) => {
    const newNote = {
        title: req.body.title,
        text: req.body.text,
        id: uniqueID()
    };

    try {
        const notes = await retrieveNotes();
        notes.push(newNote);
        await fsPromises.writeFile('./db/db.json', JSON.stringify(notes, null, 2));
        res.json(newNote);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving the note.');
    }
});
//coded with help from coding tutor 
serverApp.delete('/api/notes/:id', async (req, res) => {
    const noteId = req.params.id;

    try {
        let notes = await retrieveNotes();
        notes = notes.filter(note => note.id !== noteId);
        await fsPromises.writeFile('./db/db.json', JSON.stringify(notes, null, 2));
        res.json({ message: "Note removed!" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting the note.');
    }
});

serverApp.get('/notes', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'notes.html'));
});

serverApp.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

serverApp.listen(SERVER_PORT, () => {
    console.log(`Server is active on port ${SERVER_PORT}`);
});
