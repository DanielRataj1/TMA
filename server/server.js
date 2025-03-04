const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const secretKey = 'tajny-klucz';

mongoose.connect('mongodb://localhost:27017/taskmanager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
});

const Task = mongoose.model('Task', TaskSchema);

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const List = mongoose.model('List', ListSchema);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Brak tokenu' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Nieprawidłowy token' });
    req.user = user;
    next();
  });
};

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (user) {
      const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
      res.json({ success: true, token, userId: user._id });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = new User({ username, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    res.json({ success: true, token, userId: user._id });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Username already exists' });
  }
});

app.get('/api/lists', authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const lists = await List.find({ userId });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/lists', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const { userId } = req.user;

  try {
    const list = new List({ title, userId });
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/lists/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await List.findByIdAndDelete(id);
    res.json({ message: 'List deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/tasks', authenticateToken, async (req, res) => {
  const { userId } = req.user;

  try {
    const lists = await List.find({ userId });
    const listIds = lists.map(list => list._id);
    const tasks = await Task.find({ listId: { $in: listIds } });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, description, listId } = req.body;

  if (!title || !listId) {
    return res.status(400).json({ message: 'Title and listId are required' });
  }

  try {
    const task = new Task({ title, description, listId });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, completed, listId } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { title, description, completed, listId },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});