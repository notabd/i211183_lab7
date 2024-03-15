const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
app.use(bodyParser.json());

let tasks = []; 
let users = []; 

// Middleware for auth token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, '@_v3ry_secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword };
    users.push(newUser);
    res.status(201).send({ message: 'User created' });
});

// User Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send({ message: 'Authentication failed' });
    }
    const token = jwt.sign({ username: user.username }, '@_v3ry_secret_key', { expiresIn: '2h' });
    res.status(200).send({ token });
});

// Create a new task
app.post('/api/tasks', authenticateToken, (req, res) => {
    const { title, description, dueDate, category, status, priority } = req.body;
    const newTask = { id: tasks.length + 1, title, description, dueDate, category, status, priority, user: req.user.username };
    tasks.push(newTask); 
    res.status(201).send(newTask);
});

// Get all tasks
app.get('/api/tasks', authenticateToken, (req, res) => {
    const userTasks = tasks.filter(task => task.user === req.user.username);
    res.status(200).send(userTasks);
});

//update a task
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
    const { id } = req.params; 
    const { title, description, dueDate, category, status, priority } = req.body;
    const taskIndex = tasks.findIndex(task => task.id == id && task.user === req.user.username);
    if(taskIndex > -1) {
        const updatedTask = { ...tasks[taskIndex], title, description, dueDate, category, status, priority };
        tasks[taskIndex] = updatedTask;
        res.status(200).send(updatedTask);
    } else {
        res.status(404).send({ message: 'Task not found or not allowed to update this task' });
    }
});

app.listen(port, () => { console.log(`Task manager app listening at http://localhost:${port}`); });