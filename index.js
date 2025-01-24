const express = require("express");
const crypto = require("crypto");
const cors = require('cors');
const {todos} = require("./data");
const {connect_to_db, ObjectId} = require("./db");


const port = 8000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const initDb = async () => {
    const db = await connect_to_db();
    const c = db.collection("todos");

    // delete all old todos
    await c.deleteMany({});
    const todosWithoutIds = todos.map(todo => {
        return {
            title: todo.title,
            done: todo.done,
            date: todo.date,
        }
    });
    await c.insertMany(todosWithoutIds);

    return db;
}

const todoBackendToFrontendMapper = (todo) => {
    return {
        id: todo.id ? todo.id : (todo._id ? todo._id : null),
        title: todo.title,
        date: todo.date,
        done: todo.done,
    }
}

(async () => {
    const db = await initDb();

    app.get('/todos', async (req, res) => {
        const itemsPerPage =  parseInt(req.query.perpage) || 10;
    
        const c = db.collection("todos");
        const todosCount = await c.countDocuments();
        const totalPages = Math.ceil((todosCount) / itemsPerPage);
        const page = Math.min(parseInt(req.query.page), totalPages) || 1;
        const start = (page - 1) * itemsPerPage;

        const paginatedTodos = await c.find().skip(start).limit(itemsPerPage).toArray();


        res.json({
            todos: paginatedTodos.map(todoBackendToFrontendMapper),
            meta: {
                total: todosCount,
                pages: totalPages,
                pageSize: itemsPerPage,
                page,
            }
        });
    });

    app.post("/todos", async(req, res) => {
        const todo = req.body.todo;

        const c = db.collection("todos");
        const insertedTodo = await c.insertOne(todo);
        todo.id = insertedTodo.insertedId;

        res.json(todo);
    });

    app.put("/todos/:id", async (req, res) => {
        const c = db.collection("todos");
        const todo = await c.findOne({ _id: new ObjectId(req.params.id) });
        if(!todo) {
            return res.status(404);
        }
        
        todo.title = req.body.todo.title;
        todo.date = req.body.todo.date;
        todo.done = req.body.todo.done;

        // update in the db
        await c.updateOne({ _id: new ObjectId(req.params.id) }, { $set: todo });
        const updated = await c.findOne({ _id: new ObjectId(req.params.id) });

        res.json(todoBackendToFrontendMapper(updated));
    });

    app.delete("/todos/:id", async (req, res) => {
        const c = db.collection("todos");
        const deleted = await c.findOne({ _id: new ObjectId(req.params.id) });
        if(!deleted) {
            return res.status(404);
        }
        await c.deleteOne({ _id: new ObjectId(req.params.id) });

        res.json({ todo: todoBackendToFrontendMapper(deleted) });
    });


    app.listen(port, () => {
        console.log(`Server is listening at ${port}`);
    });
})();
