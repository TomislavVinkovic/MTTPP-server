const express = require("express");
const crypto = require("crypto");
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {connect_to_db, ObjectId} = require("./db");


const port = 8000;
const JWT_SECRET = "super_secret_signing_key_BD"

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const initDb = async () => {
    return await connect_to_db();
}

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error(err);
                res.sendStatus(403); // Forbidden
            }
            req.user =  {
                id: decoded.id,
                email: decoded.email
            }
            next();
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

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

    // AUTH
    app.post("/validate-token", authenticateJWT, (req, res) => {
        res.status(200).send();
    });

    app.post("/register", async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ error: "Email and password are required." });
        }

        const c = db.collection("users");
        const existingUser = await c.findOne({ email });

        if (existingUser) {
            return res.status(409).send({ error: "Email already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        const newUser = { email, password: hashedPassword };
        await c.insertOne(newUser);

        res.status(201).send({ message: "User registered successfully!" });
    });

    // User login
    app.post("/login", async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ error: "Email and password are required." });
        }

        const c = db.collection("users");
        const user = await c.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send({ error: "Invalid email or password." });
        }

        // Generate JWT
        // For now, this JWT token never expires    
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);

        res.json({ token });
    });

    app.post("/logout", authenticateJWT, (req, res) => {
        // Logout logic
        // revoke token logic would go here, but we are aiming for simplicity
        res.status(200).send({ message: "Logged out successfully!" });
    });


    // Secure Todos route
    app.get("/todos", authenticateJWT, async (req, res) => {
        const userId = req.user.id;
        const itemsPerPage = parseInt(req.query.perpage) || 10;

        const c = db.collection("todos");
        const todosCount = await c.countDocuments({ user_id: new ObjectId(userId) });

        const totalPages = Math.ceil(todosCount / itemsPerPage);
        const page = Math.min(parseInt(req.query.page), totalPages) || 1;
        const start = (page - 1) * itemsPerPage;

        const paginatedTodos = await c.find({ user_id: new ObjectId(userId) })
            .skip(start)
            .limit(itemsPerPage)
            .toArray();

        res.json({
            todos: paginatedTodos.map(todo => ({
                id: todo._id,
                userId: todo.user_id,
                title: todo.title,
                date: todo.date,
                done: todo.done,
            })),
            meta: {
                total: todosCount,
                pages: totalPages,
                pageSize: itemsPerPage,
                page,
            }
        });
    });

    // Todo creation
    app.post("/todos", authenticateJWT, async (req, res) => {
        const userId = req.user.id; // Extract from authenticated JWT
        const todo = { ...req.body.todo, user_id: new ObjectId(userId) };
    
        const c = db.collection("todos");
        const insertedTodo = await c.insertOne(todo);
    
        res.json({ ...todo, id: insertedTodo.insertedId });
    });

    app.put("/todos/:id", authenticateJWT, async (req, res) => {
        const userId = req.user.id;
        const c = db.collection("todos");
    
        try {
            const updatedTodo = await c.findOneAndUpdate(
                { 
                    _id: new ObjectId(req.params.id), 
                    user_id: new ObjectId(userId) 
                },
                { 
                    $set: { 
                        title: req.body.todo.title,
                        date: req.body.todo.date,
                        done: req.body.todo.done
                    } 
                },
                { returnDocument: 'after' } // Return the updated document
            );
    
            // Check if the document was found and updated
            if (!updatedTodo) {
                return res.status(404).json({ error: "Todo not found or unauthorized" });
            }
    
            res.json(todoBackendToFrontendMapper(updatedTodo));
        } catch (err) {
            console.error("Error updating todo:", err);
            res.status(500).json({ error: "Failed to update todo" });
        }
    });
    

    app.delete("/todos/:id", authenticateJWT, async (req, res) => {
        const userId = req.user.id;
        const c = db.collection("todos");
        const deletedTodo = await c.findOneAndDelete({ _id: new ObjectId(req.params.id), user_id: new ObjectId(userId) });
        if(!deletedTodo) {
            return res.status(404);
        }
        res.json({ todo: todoBackendToFrontendMapper(deletedTodo) });
    }); 


    app.listen(port, () => {
        console.log(`Server is listening at ${port}`);
    });
})();
