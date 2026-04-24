# 🚀 Smart Daily Dashboard

A modern full-stack web application that combines multiple daily utilities into one clean, interactive dashboard.

Built using **FastAPI + Vanilla JavaScript**, this project demonstrates real-world backend integration, API consumption, and UI/UX design.

---

## 🚀 Live Demo
https://smart-dashboard-02bl.onrender.com

## ✨ Features

* 📰 **Live News Feed**

  * Real-time news using NewsAPI
  * Expandable feed with “See More / Show Less”

* ✅ **Todo Manager**

  * Add, delete, and complete tasks
  * Persistent storage using SQLite

* 🔳 **QR Code Generator**

  * Generate QR codes instantly from text/URLs

* 🌦 **Weather Integration**

  * Quick access to external weather app

* 🎨 **Premium UI**

  * Dark modern theme
  * Glassmorphism design
  * Smooth animations & micro-interactions

---

## 🛠 Tech Stack

**Backend**

* FastAPI
* SQLAlchemy
* SQLite
* httpx

**Frontend**

* HTML
* CSS (Custom, Glass UI)
* Vanilla JavaScript (Fetch API)

**APIs Used**

* NewsAPI

---

## 📂 Project Structure

```
smart-dashboard/
│
├── main.py
├── database.py
├── models.py
├── schemas.py
│
├── routers/
│   ├── news.py
│   ├── todo.py
│   ├── qr.py
│
├── static/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│
├── .env
├── requirements.txt
└── README.md
```

---

## ⚙️ Setup & Run Locally

```bash
git clone https://github.com/yourusername/Smart_Dashboard.git
cd Smart_Dashboard

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn main:app --reload
```

Open in browser:
👉 http://127.0.0.1:8000

---

## 🔐 Environment Variables

Create a `.env` file:

```
NEWS_API_KEY=your_api_key_here
```

---

## 🚀 Live Demo

(Will be added after deployment)

---

## 🧠 What I Learned

* Building REST APIs using FastAPI
* Integrating external APIs
* Managing databases with SQLAlchemy
* Creating a full-stack project without frameworks
* Designing modern UI with CSS animations

---

## 📌 Author

Made with ❤️ by **Biprajit**

---

## ⭐ If you like this project

Give it a star ⭐ and share your feedback!
