// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  window.scrollY > 50 ?
    navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.98)' :
    navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
});

// Toggle project detail panels
function toggleProject(card) {
  card.classList.toggle("active");
}

// Lightbox variables
let currentImageIndex = 0;
let images = Array.from(document.querySelectorAll('.image-gallery img'));

// Lightbox açma
images.forEach((img, index) => {
  img.addEventListener('click', () => {
    currentImageIndex = index;
    openLightbox(images[currentImageIndex].src);
  });
});

function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  lightbox.style.display = "flex";
  lightboxImg.src = src;
}

// Lightbox kapama
function closeLightbox(event) {
  const lightbox = document.getElementById("lightbox");
  if (event.target === lightbox || event.target.classList.contains("close-btn")) {
    lightbox.style.display = "none";
    document.getElementById("lightbox-img").src = "";
  }
}

// Görsel değiştir
function changeImage(direction) {
  currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
  document.getElementById("lightbox-img").src = images[currentImageIndex].src;
}

// Klavye ile kontrol
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById("lightbox");
  if (lightbox.style.display === "flex") {
    if (e.key === 'ArrowLeft') {
      changeImage(-1);
    } else if (e.key === 'ArrowRight') {
      changeImage(1);
    } else if (e.key === 'Escape') {
      closeLightbox({ target: lightbox });
    }
  }
});
