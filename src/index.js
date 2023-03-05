const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const userExist = users.find((user) => user.username === username)

  if (!userExist) {
    return response.status(400).json({
      error: "User not found"
    })
  }

  request.user = userExist

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExist = users.find((user) => user.username === username)

  if (userExist) {
    return response.status(400).json({
      error: "User already exists;"
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const todos = user.todos

  return response.status(200).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  const todoExist = user.todos.find((todo) => todo.id === id)

  if (!todoExist) {
    return response.status(404).json({
      error: "Todo not found."
    })
  }

  user.todos.map(todo => {
    if (todo.id === id) {
      todo.title = title
      todo.deadline = new Date(deadline)
    }
  })

  return response.status(201).json({
    title, deadline, done: false
  })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoExist = user.todos.find((todo) => todo.id === id)

  if (!todoExist) {
    return response.status(404).json({
      error: "Todo not found."
    })
  }

  user.todos.map(todo => {
    if (todo.id === id) {
      todo.done = true
    }
  })

  return response.status(201).json({
    ...todoExist,
    done: true
  })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todoExist = user.todos.find((todo) => todo.id === id)

  if (!todoExist) {
    return response.status(404).json({
      error: "Todo not found."
    })
  }

  const indexOfTodo = user.todos.indexOf(id)
  user.todos.splice(indexOfTodo, 1)

  return response.status(204).send()
});

module.exports = app;