# Gushwork_assignment

# 📘 Mangalam HDPE Pipes – Frontend Project

## 📌 Overview
This project is a responsive product webpage built using **HTML, CSS, and Vanilla JavaScript**.  
It showcases HDPE pipes with an interactive UI including carousel, zoom functionality, sticky navigation, and more.

---

## 🚀 Features

### 🖼️ Image Carousel
- Smooth horizontal sliding using CSS transforms
- Infinite looping with index normalization
- Navigation via:
  - Next / Previous buttons
  - Thumbnail clicks
  - Keyboard arrow keys

---

### 🔍 Zoom Functionality
- Hover-based zoom (desktop only)
- Lens follows cursor movement
- Separate preview panel for magnified view
- Works dynamically for active slide

---

### 🎯 Thumbnail Navigation
- Each thumbnail maps to a slide using `data-index`
- Direct image switching without scrolling through all slides

---

### ⏱️ Auto-play
- Automatically changes slides every 4.5 seconds
- Pauses on hover
- Resets when user interacts

---

### 📱 Touch / Swipe Support
- Mobile-friendly gestures:
  - Swipe left → Next slide
  - Swipe right → Previous slide

---

### 📌 Sticky Header
- Appears after scrolling past hero section
- Hides when scrolling up
- Improves navigation accessibility

---

### 🍔 Mobile Menu
- Hamburger menu for small screens
- Smooth open/close animation
- Closes on:
  - Link click
  - Escape key

---

### ❓ FAQ Accordion
- Expand/collapse functionality
- Only one item open at a time
- Keyboard accessible (Enter / Space)

---

### 📑 Process Tabs
- Tab-based content switching
- Arrow key navigation support

---

### ✨ Scroll Reveal Animations
- Elements animate into view using `IntersectionObserver`
- Smooth fade and slide effects

---

## ♿ Accessibility
- `aria-hidden` for inactive slides
- `aria-pressed` for active thumbnails
- Keyboard navigation support
- Semantic HTML structure

---

## ⚡ Performance Optimizations
- CSS transitions for smooth animations
- `requestAnimationFrame` for scroll handling
- Lazy loading for images
- Auto-play pause to reduce CPU usage

---

## 🛠️ Tech Stack
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**

---

## 📂 Project Structure
