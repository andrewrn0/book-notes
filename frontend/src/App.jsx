import { React, useReducer, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import PublicHome from "./routes/PublicHome";
import AdminHome from "./routes/AdminHome";
import Header from "./components/public/Header";
import Footer from "./components/public/Footer";
import BookForm from "./components/private/BookForm";
import { createBook, readAllBooks, updateBook, deleteBook } from "./api";
import "./App.css";

const isPublic = import.meta.env.VITE_IS_PUBLIC;

//internal state reducer. Mirrors the database vis the handle functions below.
function reducer(state, action) {
  switch (action.type) {
    case "init-books":
      console.log("Books loaded from backend");
      return action.payload;

    case "create-book":
      return [...state, action.payload];

    case "update-book":
      return state.map((book) =>
        book.id === action.payload.id ? action.payload : book
      );

    case "delete-book":
      return state.filter((book) => book.id != action.payload.id);
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, []);
  const [isLoaded, setIsLoaded] = useState(false);

  //the "R" in CRUD
  useEffect(() => {
    //necessary wrapper bc useEffect doesn't support async/await
    async function fetchData() {
      try {
        const result = await readAllBooks();
        dispatch({ type: "init-books", payload: result.data });
        setIsLoaded(true);
      } catch (e) {
        console.log("Error fetching data from API: ", e);
      }
    }

    fetchData();
  }, []);

  //the "CUD" in CRUD
  function handleCreate(book) {
    console.log("New book created");
    createBook(book); //update DB w/ api call
    dispatch({ type: "create-book", payload: book }); //update internal state to match
  }

  function handleUpdate(book) {
    console.log("Book edited");
    updateBook(book); //external
    dispatch({ type: "update-book", payload: book }); //internal
  }

  function handleDelete(book) {
    console.log("Books deleted");
    deleteBook(book); //external
    dispatch({ type: "delete-book", payload: book }); //internal
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isLoaded ? (
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  isPublic ? (
                    <PublicHome className="max-w-4xl" books={state} />
                  ) : (
                    <AdminHome
                      className="max-w-4xl"
                      books={state}
                      handleDelete={handleDelete}
                    />
                  )
                }
              />
              <Route
                path="/edit/:id"
                element={<BookForm handleUpdate={handleUpdate} books={state} />}
              ></Route>
              <Route
                path="/add"
                element={<BookForm handleCreate={handleCreate} books={state} />}
              ></Route>
            </Routes>
          </BrowserRouter>
        ) : (
          <p>Loading...</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
