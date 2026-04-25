const API_BASE = `${window.location.origin}/api`;
const INITIAL_NEWS_COUNT = 3;

const newsListEl = document.getElementById("news-list");
const newsStatusEl = document.getElementById("news-status");
const newsToggleRowEl = document.getElementById("news-toggle-row");
const newsToggleBtnEl = document.getElementById("news-toggle-btn");

let allArticles = [];
let isNewsExpanded = false;
let lastAddedTaskId = null;

const todoStatusEl = document.getElementById("todo-status");
const todoListEl = document.getElementById("todo-list");
const todoFormEl = document.getElementById("todo-form");
const todoInputEl = document.getElementById("todo-input");

const qrStatusEl = document.getElementById("qr-status");
const qrFormEl = document.getElementById("qr-form");
const qrInputEl = document.getElementById("qr-input");
const qrOutputEl = document.getElementById("qr-output");
const cursorLightEl = document.getElementById("cursor-light");

/**
 * Shared fetch helper with consistent error handling.
 */
async function requestJson(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        let detail = `Request failed (${response.status})`;
        try {
            const data = await response.json();
            if (data?.detail) {
                detail = data.detail;
            }
        } catch (_) {}
        throw new Error(detail);
    }

    return response.json();
}

function setNewsMessage(message, isError = false) {
    newsListEl.innerHTML = `<div class="${isError ? "error-message" : "empty-state"}">${message}</div>`;
    newsToggleRowEl.hidden = true;
}

function renderNewsSkeleton() {
    newsListEl.innerHTML = Array.from({ length: 3 })
        .map(() => `
            <div class="skeleton-news-item">
                <div class="skeleton-line skeleton-image"></div>
                <div class="skeleton-copy">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
            </div>
        `).join("");
}

async function loadNews() {
    newsStatusEl.textContent = "Loading...";
    renderNewsSkeleton();
    newsToggleRowEl.hidden = true;

    try {
        const data = await requestJson(`${API_BASE}/news/`);
        allArticles = Array.isArray(data?.articles) ? data.articles.slice(0, 10) : [];
        isNewsExpanded = false;

        if (!allArticles.length) {
            setNewsMessage("No articles found right now.");
            newsStatusEl.textContent = "No data";
            return;
        }

        renderNews();
        newsStatusEl.textContent = `${allArticles.length} articles`;
    } catch (error) {
        setNewsMessage(`Could not load news: ${escapeHtml(error.message)}`, true);
        newsStatusEl.textContent = "Error";
    }
}

function renderNews() {
    const visibleArticles = isNewsExpanded
        ? allArticles
        : allArticles.slice(0, INITIAL_NEWS_COUNT);

    newsListEl.innerHTML = visibleArticles.map((article, index) => {
        const imageMarkup = article.image
            ? `<img src="${article.image}" alt="News image" loading="lazy" referrerpolicy="no-referrer">`
            : `<div class="news-item-fallback">No Image</div>`;

        const shouldAnimateEnter = isNewsExpanded && index >= INITIAL_NEWS_COUNT;

        return `
            <a class="news-item ${shouldAnimateEnter ? "news-item-enter" : ""}" href="${article.url}" target="_blank" rel="noopener noreferrer">
                ${imageMarkup}
                <div class="news-content">
                    <h3>${escapeHtml(article.title || "Untitled")}</h3>
                    <p>${escapeHtml(article.source || "Unknown source")}</p>
                </div>
            </a>
        `;
    }).join("");

    const needsToggle = allArticles.length > INITIAL_NEWS_COUNT;
    newsToggleRowEl.hidden = !needsToggle;
    newsToggleBtnEl.textContent = isNewsExpanded ? "Show Less" : "See More";
}

function collapseNewsList() {
    const extraItems = Array.from(newsListEl.querySelectorAll(".news-item")).slice(INITIAL_NEWS_COUNT);

    if (!extraItems.length) {
        isNewsExpanded = false;
        renderNews();
        return;
    }

    newsToggleBtnEl.disabled = true;
    extraItems.forEach((item) => item.classList.add("news-item-leave"));

    setTimeout(() => {
        isNewsExpanded = false;
        renderNews();
        newsToggleBtnEl.disabled = false;
    }, 230);
}

newsToggleBtnEl.addEventListener("click", () => {
    if (!allArticles.length) return;

    if (isNewsExpanded) {
        collapseNewsList();
        return;
    }

    isNewsExpanded = true;
    renderNews();
});

function setTodoMessage(message, isError = false) {
    todoListEl.innerHTML = `<li class="${isError ? "error-message" : "empty-state"}">${message}</li>`;
}

function renderTodoSkeleton() {
    todoListEl.innerHTML = Array.from({ length: 3 })
        .map(() => `<li class="skeleton-line skeleton-todo-item"></li>`)
        .join("");
}

function renderTodos(tasks) {
    if (!tasks.length) {
        setTodoMessage("No tasks yet. Add your first task.");
        return;
    }

    todoListEl.innerHTML = tasks.map((task) => {
        const completed = Boolean(task.completed);
        const isNewTask = task.id === lastAddedTaskId;

        return `
            <li class="todo-item ${completed ? "is-completed" : ""} ${isNewTask ? "todo-item-enter" : ""}">
                <p class="todo-title ${completed ? "completed" : ""}">${escapeHtml(task.title || "Untitled task")}</p>
                <div class="todo-actions">
                    <button class="ghost-btn" ${completed ? "disabled" : ""} onclick="markTodoComplete(${task.id})">
                        ${completed ? "Done" : "Complete"}
                    </button>
                    <button class="ghost-btn delete-btn" onclick="deleteTodo(${task.id})">Delete</button>
                </div>
            </li>
        `;
    }).join("");

    lastAddedTaskId = null;
}

async function loadTodos() {
    todoStatusEl.textContent = "Loading...";
    renderTodoSkeleton();

    try {
        const tasks = await requestJson(`${API_BASE}/todo/`);
        renderTodos(Array.isArray(tasks) ? tasks : []);
        const completedCount = tasks.filter(t => t.completed).length;
        todoStatusEl.textContent = `${completedCount}/${tasks.length} completed`;
    } catch (error) {
        setTodoMessage(`Could not load tasks: ${escapeHtml(error.message)}`, true);
        todoStatusEl.textContent = "Error";
    }
}

async function addTodo(title) {
    return requestJson(`${API_BASE}/todo/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title })
    });
}

window.markTodoComplete = async function(taskId) {
    await requestJson(`${API_BASE}/todo/${taskId}`, { method: "PUT" });
    await loadTodos();
};

window.deleteTodo = async function(taskId) {
    const targetItem = document.querySelector(`button[onclick=\"deleteTodo(${taskId})\"]`)?.closest(".todo-item");

    if (targetItem) {
        targetItem.style.transition = "opacity 220ms ease, transform 220ms ease, max-height 220ms ease, margin 220ms ease, padding 220ms ease";
        targetItem.style.maxHeight = `${targetItem.offsetHeight}px`;
        requestAnimationFrame(() => {
            targetItem.style.opacity = "0";
            targetItem.style.transform = "translateY(6px) scale(0.98)";
            targetItem.style.maxHeight = "0px";
            targetItem.style.margin = "0";
            targetItem.style.paddingTop = "0";
            targetItem.style.paddingBottom = "0";
        });
        await new Promise((resolve) => setTimeout(resolve, 210));
    }

    await fetch(`${API_BASE}/todo/${taskId}`, { method: "DELETE" });
    await loadTodos();
};

todoFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = todoInputEl.value.trim();
    if (!title) return;

    const createdTask = await addTodo(title);
    lastAddedTaskId = createdTask?.id ?? null;
    todoInputEl.value = "";
    await loadTodos();
});

qrFormEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = qrInputEl.value.trim();
    if (!value) return;

    const qrUrl = new URL(`${API_BASE}/qr/`);
    qrUrl.searchParams.set("data", value);

    qrOutputEl.innerHTML = `<img class="qr-image" src="${qrUrl.toString()}">`;
    qrOutputEl.classList.add("qr-output-active");
});

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function setupCursorLight() {
    if (!cursorLightEl) return;

    window.addEventListener("mousemove", (event) => {
        document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
    }, { passive: true });
}

function setupCardTilt() {
    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const rx = ((rect.height / 2 - y) / rect.height) * 1.2;
            const ry = ((x - rect.width / 2) / rect.width) * 1.2;

            card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
            card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
        }, { passive: true });

        card.addEventListener("mouseleave", () => {
            card.style.setProperty("--rx", "0deg");
            card.style.setProperty("--ry", "0deg");
        });
    });
}

function setupButtonRipples() {
    const controls = document.querySelectorAll("button, .button-link");

    controls.forEach((control) => {
        control.addEventListener("click", (event) => {
            const rect = control.getBoundingClientRect();
            const ripple = document.createElement("span");
            ripple.className = "ripple";
            ripple.style.left = `${event.clientX - rect.left}px`;
            ripple.style.top = `${event.clientY - rect.top}px`;
            control.appendChild(ripple);
            setTimeout(() => ripple.remove(), 520);
        });
    });
}

loadNews();
loadTodos();
