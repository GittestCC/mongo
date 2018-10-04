import Hapi from 'hapi'
import db from './database'
import { outputTodo } from './utils'
import TodoCollection from './models/TodoCollection'

// Create a server with a host and port
const server = Hapi.server({
  port: process.env.PORT || '8000'
})

/**
 * @api {get} /{listId}/todos get all todos
 * @apiName GetTodos
 * @apiParam (Url) {String} listId the id for the list to fetch all the todos for (ignored for now)
 * @apiSuccess {Object[]} response list of todos, response is a placeholder
 * @apiSuccess {String} response.id the todo id
 * @apiSuccess {String} response.text the todo text
 * @apiSuccess {Boolean} response.isCompleted the todo state
 * @apiSuccess {Date} response.createdAt created date for the todo
 */ server.route({
  method: 'GET',
  path: '/{listId}/todos',
  handler: async () => {
    const collection = await TodoCollection.findOnlyCollection()
    return collection.todos.map(outputTodo)
  }
})

/**
 * @api {post} /{listId}/todos create a new todo
 * @apiName CreateTodos
 * @apiParam (Url) {String} listId the id for the list that the todo belongs to (ignored for now)
 * @apiParam {String} [text] the todo text
 * @apiSuccess {String} id the todo id
 * @apiSuccess {String} [text] the todo text
 * @apiSuccess {Boolean} isCompleted the todo state
 * @apiSuccess {Date} createdAt created date for the todo
 */
server.route({
  method: 'POST',
  path: '/{listId}/todos',
  handler: async request => {
    const { text } = request.payload
    const collection = await TodoCollection.findOnlyCollection()
    const todo = collection.todos.create({
      text,
      isCompleted: false,
      createdAt: new Date()
    })
    collection.todos.push(todo)
    await collection.save()
    return outputTodo(todo)
  }
})

/**
 * @api {put} /{listId}/todos/{todoId} update a todo
 * @apiName UpdateTodos
 * @apiParam (Url) {String} listId the id for the list that the todo belongs to (ignored for now)
 * @apiParam {String} [text] the updated todo text
 * @apiParam {Boolean} [isCompleted] the updated todo state
 * @apiSuccess {String} id the todo id
 * @apiSuccess {String} [text] the todo text
 * @apiSuccess {Boolean} isCompleted the todo state
 * @apiSuccess {Date} createdAt created date for the todo
 * @apiError {String} error error message when todoId is invalid
 */
server.route({
  method: 'PUT',
  path: '/{listId}/todos/{todoId}',
  handler: async (request, h) => {
    const { todoId } = request.params
    try {
      const todo = await TodoCollection.updateTodo(todoId, request.payload)
      return outputTodo(todo)
    } catch (e) {
      return h.response({ error: 'Invalid todo id' }).code(400)
    }
  }
})

/**
 * @api {delete} /{listId}/todos/{todoId} delete a todo
 * @apiName DeleteTodos
 * @apiParam (Url) {String} listId the id for the list that the todo belongs to (ignored for now)
 * @apiParam (Url) {String} todoId the id for the todo to be deleted
 * @apiError {String} error error message when todoId is invalid
 */
server.route({
  method: 'DELETE',
  path: '/{listId}/todos/{todoId}',
  handler: async (request, h) => {
    const { todoId } = request.params
    try {
      await TodoCollection.removeTodo(todoId)
      return h.response().code(200)
    } catch (e) {
      console.log(e)
      return h.response({ error: 'Invalid todo id' }).code(400)
    }
  }
})

// Start the server
async function start() {
  try {
    await server.start()
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
  console.log('Server running at:', server.info.uri)
}

db().then(() => {
  start()
})
