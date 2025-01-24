const crypto = require("crypto");

const todos = [
    {
      "title": "Finish homework",
      "date": "2023-12-20",
      "done": false,
      "id": crypto.randomUUID()
    },
    {
      "title": "Buy groceries",
      "date": "2023-12-18",
      "done": true,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Exercise",
      "date": "2023-12-17",
      "done": false,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Read a book",
      "date": "2023-12-22",
      "done": false,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Call a friend",
      "date": "2023-12-25",
      "done": true,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Prepare for presentation",
      "date": "2023-12-19",
      "done": false,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Go for a run",
      "date": "2023-12-21",
      "done": false,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Attend meeting",
      "date": "2023-12-24",
      "done": true,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Clean the house",
      "date": "2023-12-16",
      "done": true,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Write blog post",
      "date": "2023-12-23",
      "done": false,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Plan weekend trip",
      "date": "2023-12-28",
      "done": false,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Learn a new skill",
      "date": "2023-12-26",
      "done": false,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Organize files",
      "date": "2023-12-27",
      "done": false,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Attend webinar",
      "date": "2023-12-30",
      "done": false,
      "id": crypto.randomUUID()      
    },
    {
      "title": "Review project proposal",
      "date": "2023-12-29",
      "done": false,
      "id": crypto.randomUUID()      
    }
];

module.exports = {
    todos
};
