const API_URL = "https://fakestoreapi.com/products";

const productListEl = document.getElementById("product-list");
const searchInputEl = document.getElementById("search-input");
const categoryFilterEl = document.getElementById("category-filter");
const statusMessageEl = document.getElementById("status-message");

let allProducts = [];

function setStatus(message) {
  statusMessageEl.textContent = message;
}

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.innerHTML = `
    <img src="${product.image}" alt="${product.title}" />
    <h3>${product.title}</h3>
    <span class="category">${product.category}</span>
    <span class="price">${formatPrice(product.price)}</span>
  `;
  return card;
}

function renderProducts(products) {
  productListEl.innerHTML = "";

  if (products.length === 0) {
    setStatus("No se encontraron productos con esos criterios.");
    return;
  }

  setStatus(`Mostrando ${products.length} producto(s).`);

  const fragment = document.createDocumentFragment();
  products.forEach((product) => {
    fragment.appendChild(createProductCard(product));
  });
  productListEl.appendChild(fragment);
}

function populateCategories(products) {
  const categories = [...new Set(products.map((product) => product.category))];

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilterEl.appendChild(option);
  });
}

function applyFilters() {
  const searchTerm = searchInputEl.value.trim().toLowerCase();
  const selectedCategory = categoryFilterEl.value;

  const filtered = allProducts.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  renderProducts(filtered);
}

async function loadProducts() {
  setStatus("Cargando productos...");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    allProducts = await response.json();
    populateCategories(allProducts);
    renderProducts(allProducts);
  } catch (error) {
    setStatus("Ocurrió un error al obtener los datos. Intenta de nuevo.");
    console.error("Error al cargar productos:", error);
  }
}

searchInputEl.addEventListener("input", applyFilters);
categoryFilterEl.addEventListener("change", applyFilters);

document.addEventListener("DOMContentLoaded", loadProducts);
