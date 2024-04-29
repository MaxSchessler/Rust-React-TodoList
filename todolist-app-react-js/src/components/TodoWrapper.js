import React, { useEffect, useState } from "react";
import { Todo } from "./Todo";
import { TodoForm } from "./TodoForm";
import { EditTodoForm } from "./EditTodoForm";

export const TodoWrapper = () => {
  const [todos, setTodos] = useState([]);

  const getTasks = async () => {
    const response = await fetch("http://localhost:8080/tasks");
    const jsontasks = await response.json();
    jsontasks.sort((a, b) => a.id - b.id);
    setTodos(jsontasks);
  }

  useEffect(() => {
    
    getTasks();
  }, []);

  const addTodo = async (taskName) => {
    const todo = { id: Math.floor(new Date()), name: taskName, completed: false};
    try {
      const url = "http://localhost:8080/tasks";
      const response = await fetch(
        url,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(todo)
        }
      );
      if (!response.ok) {
        alert(`Bad API call: Cannot add Task ${todo.id}`);
        return;
      } 
    } catch (error) {
      console.error("Error: ", error);
    }
    setTodos([
      ...todos,
      todo,
    ]);
  }

  const deleteTodo = async (id) => {

    await fetch (
      `http://localhost:8080/tasks/${id}`,
      {
        method: "DELETE",
        headers: {"Content-Type": "application/json"}
      }
    ).then(response => {
      if (!response.ok) {
        alert("Unable to delete TODO");
      }
    })

    // set todos tos 
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  const toggleComplete = async (task) => {

    const UpdatedTask = {
      id: task.id,
      name: task.name,
      completed: !task.completed
    };
    
    try {
      const response = await fetch(
        `http://localhost:8080/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(UpdatedTask)
        }
      );

      if (!response.ok) {
        alert(response.text());
      }
    } catch (err) {
      alert(err.message)
    }

    // set todo state variables
    setTodos(
      todos.map((todo) =>
        todo.id === task.id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  const editTask = (task, id) => {
    console.log(task);
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !task.isEditing } : { ...todo, isEditing: false }
      )
    );
  };

  const updateTask = async (task, newName) => {
    const newTask = {
      id: task.id,
      name: newName,
      completed: task.completed
    }

    try {
      const response = await fetch (
        `http://localhost:8080/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newTask)
        }
      )
      if (!response.ok) {
        // Get response body as text
        const responseBody = await response.body;
        alert("Update Response not OK\n" + responseBody);
      }
     
    } catch (err){
      alert(err);
    }

    getTasks();
  }
  
  return (
    <div className="TodoWrapper">
      <h1>Deadline Dasher</h1>
      <TodoForm addTodo={addTodo} />
      {/* Display todos if there are any, otherwise show a message */}
      {todos.length > 0 ? (
        todos.map((todo) =>
          todo.isEditing ? (
            <EditTodoForm key={todo.id} editTodo={updateTask} task={todo} />
          ) : (
            <Todo
              key={todo.id}
              task={todo}
              deleteTodo={deleteTodo}
              editTodo={editTask}
              toggleComplete={toggleComplete}
            />
          )
        )
      ) : (
        <p>No todos yet.</p>
      )}
    </div>
  );
  
};

