import { useEffect, useMemo, useState } from "react";
import "./App.css";

const seed = [
  { id: 1, title: "Review weekly project notes", category: "Work", priority: "High", due: "Today", completed: false },
  { id: 2, title: "Book dentist appointment", category: "Personal", priority: "Medium", due: "Tomorrow", completed: false },
  { id: 3, title: "30 minute evening walk", category: "Health", priority: "Low", due: "Today", completed: true },
  { id: 4, title: "Plan next week's meals", category: "Personal", priority: "Medium", due: "Sun", completed: false },
];
const categories = ["All", "Work", "Personal", "Health"];
const categoryIcons = { All: "✦", Work: "▣", Personal: "⌂", Health: "♡" };

const Icon = ({ name, size = 18 }) => {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" /></>,
    moon: <path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5 8.5 8.5 0 1 0 20.5 14.3Z" />,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

function App() {
  const [tasks, setTasks] = useState(() => { try { return JSON.parse(localStorage.getItem("daylist-tasks")) || seed; } catch { return seed; } });
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState("Medium");
  const [due, setDue] = useState("Today");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [dark, setDark] = useState(false);

  useEffect(() => localStorage.setItem("daylist-tasks", JSON.stringify(tasks)), [tasks]);
  const completeCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completeCount / tasks.length) * 100) : 0;
  const dateLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const visibleTasks = useMemo(() => tasks.filter((task) =>
    (activeCategory === "All" || task.category === activeCategory) &&
    (filter === "All" || (filter === "Active" ? !task.completed : task.completed)) &&
    task.title.toLowerCase().includes(search.toLowerCase())
  ), [tasks, activeCategory, filter, search]);
  const counts = Object.fromEntries(categories.map((item) => [item, item === "All" ? tasks.length : tasks.filter((task) => task.category === item).length]));

  const submitTask = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    if (editingId) setTasks(tasks.map((task) => task.id === editingId ? { ...task, title: input.trim(), category, priority, due } : task));
    else setTasks([{ id: Date.now(), title: input.trim(), category, priority, due, completed: false }, ...tasks]);
    setInput(""); setEditingId(null);
  };
  const editTask = (task) => { setEditingId(task.id); setInput(task.title); setCategory(task.category); setPriority(task.priority); setDue(task.due); };

  return <div className={dark ? "app dark" : "app"}>
    <header className="topbar">
      <a className="brand" href="#top"><span className="brand-mark"><Icon name="check" /></span>daylist.</a>
      <div className="header-actions"><button className="theme-button" onClick={() => setDark(!dark)} aria-label="Toggle dark mode"><Icon name={dark ? "sun" : "moon"} /></button><div className="avatar">RA</div></div>
    </header>
    <main className="layout" id="top">
      <aside className="sidebar">
        <p className="eyebrow">Workspace</p>
        <nav className="category-nav" aria-label="Task categories">{categories.map((item) => <button key={item} className={activeCategory === item ? "nav-item active" : "nav-item"} onClick={() => setActiveCategory(item)}><span className="nav-icon">{categoryIcons[item]}</span>{item === "All" ? "All tasks" : item}<span className="count">{counts[item]}</span></button>)}</nav>
        <div className="sidebar-card"><span className="mini-icon"><Icon name="check" size={16} /></span><h3>Small steps, big days.</h3><p>You’ve completed {completeCount} tasks. Keep the momentum going.</p></div>
        <p className="sidebar-footer">Made for calmer, clearer days.</p>
      </aside>
      <section className="content">
        <div className="welcome"><div><p className="date">{dateLabel}</p><h1>Good day, <em>Ruhul.</em></h1><p>Here’s what’s on your plate today.</p></div><div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` }}><div><strong>{progress}%</strong><span>done</span></div></div></div>
        <form className="composer" onSubmit={submitTask}>
          <div className="composer-main"><span className="plus"><Icon name="plus" /></span><input className="task-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="What needs to be done?" aria-label="Task title" /><button className="add-button">{editingId ? "Save task" : "Add task"}</button></div>
          <div className="task-options">
            <label><span>Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}><option>Work</option><option>Personal</option><option>Health</option></select></label>
            <label><span>Priority</span><select value={priority} onChange={(e) => setPriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select></label>
            <label><span>Due</span><select value={due} onChange={(e) => setDue(e.target.value)}><option>Today</option><option>Tomorrow</option><option>Fri</option><option>Sun</option><option>Next week</option></select></label>
          </div>
        </form>
        <div className="toolbar"><div className="filters">{["All", "Active", "Completed"].map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><label className="search"><Icon name="search" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks" /></label></div>
        <div className="list-heading"><h2>{activeCategory === "All" ? "Your tasks" : `${activeCategory} tasks`}</h2><span>{visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"}</span></div>
        <div className="task-list">{visibleTasks.map((task) => <article className={task.completed ? "task-card completed" : "task-card"} key={task.id}>
          <button className="check-button" onClick={() => setTasks(tasks.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} aria-label="Toggle task">{task.completed && <Icon name="check" size={15} />}</button>
          <div className="task-copy"><h3>{task.title}</h3><div className="meta"><span className={`priority ${task.priority.toLowerCase()}`}><i />{task.priority}</span><span>{task.category}</span><span><Icon name="calendar" size={14} />{task.due}</span></div></div>
          <div className="task-actions"><button onClick={() => editTask(task)} aria-label="Edit task"><Icon name="edit" size={17} /></button><button onClick={() => setTasks(tasks.filter((item) => item.id !== task.id))} aria-label="Delete task"><Icon name="trash" size={17} /></button></div>
        </article>)}{!visibleTasks.length && <div className="empty-state"><span><Icon name="check" size={24} /></span><h3>Your list is beautifully clear.</h3><p>Add a task above or try a different filter.</p></div>}</div>
        {tasks.some((task) => task.completed) && <button className="clear-button" onClick={() => setTasks(tasks.filter((task) => !task.completed))}>Clear completed tasks</button>}
      </section>
    </main>
  </div>;
}
export default App;
