const bookshelfs = [];
const RENDER_EVENT = "render-bookself";
const SAVED_EVENT = "saved-bookshelf";
const STORAGE_KEY = "BOOKSHELFS_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const inputBook = document.getElementById("inputBook");
  inputBook.addEventListener("submit", function (event) {
    event.preventDefault();
    addBookshelf();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBookshelf() {
  const titleBook = document.getElementById("inputBookTitle").value;
  const authorBook = document.getElementById("inputBookAuthor").value;
  const yearBook = document.getElementById("inputBookYear");
  const isCompleted = document.getElementById("inputBookIsComplete").checked;
  const yearBookToNumber = parseInt(yearBook.value);

  const generatedID = generateId();
  const bookshelfsObject = generateBookshelfObject(generatedID, titleBook, authorBook, yearBookToNumber, isCompleted);

  bookshelfs.push(bookshelfsObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookshelfObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(bookshelfs);

  const completeBOOKSHELFList = document.getElementById("completeBookshelfList");
  const incompleteBOOKSHELFList = document.getElementById("incompleteBookshelfList");

  incompleteBOOKSHELFList.innerHTML = "";
  completeBOOKSHELFList.innerHTML = "";

  for (const bookItem of bookshelfs) {
    const book_element = makeBookshelf(bookItem);

    if (!bookItem.isCompleted) {
      incompleteBOOKSHELFList.append(book_element);
    } else {
      completeBOOKSHELFList.append(book_element);
    }
  }
});

function makeBookshelf(bookshelfsObject) {
  const bookSubmit = document.getElementById("bookSubmit");

  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookshelfsObject.title;

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = bookshelfsObject.author;

  const bookYear = document.createElement("p");
  bookYear.innerText = bookshelfsObject.year;

  const divAction = document.createElement("div");
  divAction.classList.add("action");
  divAction.append(bookTitle, bookAuthor, bookYear);

  const articleClass = document.createElement("article");
  articleClass.classList.add("book_item");
  articleClass.setAttribute("id", `bookshelf-${bookshelfsObject.id}`);
  articleClass.append(divAction);

  if (bookshelfsObject.isCompleted) {
    const greenButton = document.createElement("button");
    greenButton.classList.add("green");
    greenButton.innerText = "Belum selesai di Baca";

    greenButton.addEventListener("click", function () {
      undoTaskFromCompleted(bookshelfsObject.id);
    });

    const redButton = document.createElement("button");
    redButton.classList.add("red");
    redButton.innerText = "Hapus buku";

    redButton.addEventListener("click", function () {
      removeTaskFromCompleted(bookshelfsObject.id);
      alert("Buku Telah Dihapus!");
    });

    divAction.append(greenButton, redButton);
  } else {
    const buttonSelesaiDibaca = document.createElement("button");
    buttonSelesaiDibaca.classList.add("green");
    buttonSelesaiDibaca.innerText = "Selesai dibaca";

    buttonSelesaiDibaca.addEventListener("click", function () {
      addTaskToCompleted(bookshelfsObject.id);
    });

    const redButtonLagi = document.createElement("button");
    redButtonLagi.classList.add("red");
    redButtonLagi.innerText = "Hapus buku";

    redButtonLagi.addEventListener("click", function () {
      removeTaskFromCompleted(bookshelfsObject.id);
      alert("Buku Telah Dihapus!");
    });

    divAction.append(buttonSelesaiDibaca, redButtonLagi);
  }
  return articleClass;
}

function findBookshelfIndex(bookshelfId) {
  for (const index in bookshelfs) {
    if (bookshelfs[index].id === bookshelfId) {
      return index;
    }
  }
  return -1;
}

function findBookshelf(bookshelfId) {
  for (const bookItem of bookshelfs) {
    if (bookItem.id === bookshelfId) {
      return bookItem;
    }
  }
}

function addTaskToCompleted(bookshelfId) {
  const bookshelfTaget = findBookshelf(bookshelfId);

  if (bookshelfTaget == null) return;

  bookshelfTaget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskFromCompleted(bookshelfId) {
  const bookshelfTaget = findBookshelfIndex(bookshelfId);

  if (bookshelfTaget === 1) return;

  bookshelfs.splice(bookshelfTaget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookshelfId) {
  const bookshelfTaget = findBookshelf(bookshelfId);

  if (bookshelfTaget == null) return;

  bookshelfTaget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function isStorageExist() {
  if (typeof storage === undefined) {
    alert("Browser kamu tidak mendukung bro");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(bookshelfs);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const bookshelf of data) {
      bookshelfs.push(bookshelf);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// saya bikin ketika checkbox nya diteken tulisan bookSubmit nya berubah
const inputBookIsComplete = document.getElementById("inputBookIsComplete");
inputBookIsComplete.addEventListener("change", (event) => {
  if (event.currentTarget.checked) {
    bookSubmit.innerHTML = "Selesai Dibaca";
  } else {
    bookSubmit.innerHTML = "Belum selesai dibaca";
  }
});

// fungsi cari bukunya saya make event listener keyup,  tombol nya saya hapus, bisa nyari judul dan penulis serta tahunnya juga
// di style nya saya ubah juga pada grid saya jadikan auto saja biar searchbox nya full ngikut ke grid

const cariList = document.getElementById("searchBookTitle");
cariList.addEventListener("keyup", pencarianList);

function pencarianList(e) {
  const cariList = e.target.value.toLowerCase();
  const itemList = document.querySelectorAll(".book_item");
  itemList.forEach((item) => {
    const isiItem = item.firstChild.textContent.toLowerCase();

    if (isiItem.indexOf(cariList) != -1) {
      item.setAttribute("style", "display: block;");
    } else {
      item.setAttribute("style", "display: none !important;");
    }
  });
}
