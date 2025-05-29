const STORAGE_KEY = "carrito";
const CURRENCY_LOCALE = "es-AR";

// DOM
const DOM = {
  cart: {
    button: document.querySelector(".containerIconCarrito"),
    container: document.querySelector(".container-cart-products"),
    row: document.querySelector(".row-product"),
    total: document.querySelector(".total-pagar"),
    count: document.querySelector("#contador-productos"),
    empty: document.querySelector(".cart-empty"),
    totalContainer: document.querySelector(".cart-total"),
    goToCartBtn: document.querySelector("#botonIrAlCarrito"),
    goToCartBtnPages: document.querySelector("#botonIrAlCarritoPages"),
  },
  products: {
    list: document.querySelector(".contenedorDeItems"),
    container: document.querySelector("#containerListaZapatillas"),
    collectionContainer: document.getElementById(
      "containerListaZapatillasColeccion"
    ),
  },
  cartPage: {
    productsContainer: document.querySelector(".carritoConProductos"),
    emptyDiv: document.querySelector(".carritoVacio"),
    title: document.querySelector(".tituloCarrito"),
  },
  nav: {
    hamburger: document.querySelector(".hamburger-menu"),
    mainNav: document.querySelector(".main-nav"),
  },
};

let productos = [];
let allProducts = [];

// Utility Functions (Optimazer)
const formatPrice = (price) => price.toLocaleString(CURRENCY_LOCALE);
const formatPriceWithSymbol = (price) => `$${formatPrice(price)}`;

const saveToLocalStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProducts));
  } catch (error) {
    console.error("Error al guardar el carrito:", error);
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error al cargar el carrito:", error);
    return [];
  }
};

// FETCH
async function fetchProducts() {
  try {
    const response = await fetch("../database.json");
    if (!response.ok) throw new Error("Error al cargar los productos");
    productos = await response.json();

    if (DOM.products.container) {
      displayInitialProducts();
    }
    if (DOM.products.collectionContainer) {
      displayCollectionProducts();
    }

    // Cargar carrito
    allProducts = loadFromLocalStorage();
    updateCartDisplay();
  } catch (error) {
    console.error("Error al cargar los productos:", error);
    showErrorMessage(
      alert(
        "Lo sentimos, no se pudieron cargar los productos. Por favor, intente más tarde(Mantenimiento)"
      )
    );
    // Mantenimiento en el mensaje de error para evitar preocupaciones al cliente :p
  }
}

// FUNCION: MOSTRAR PRODUCTOS EN LA !PAGINA PRINCIPAL!
function displayInitialProducts() {
  if (!DOM.products.container) return;

  const productsHTML = productos
    .map((product, index) => createProductCard(product, index))
    .join("");
  DOM.products.container.innerHTML = productsHTML;
}

// FUNCION FILTER: MOSTRAR PRODUCTOS EN LA PAGINA DE !COLECCIONES! (muestra productos con la coleccion "classic")
function displayCollectionProducts() {
  if (!DOM.products.collectionContainer) return;

  const classicProducts = productos.filter(
    (product) => product.coleccion?.toLowerCase() === "classic"
  );

  const productsHTML = classicProducts
    .map((product, index) => createProductCard(product, index))
    .join("");

  DOM.products.collectionContainer.innerHTML = productsHTML;
}

// FUNCION: CREAR CARD DE PRODUCTOS EN EL INNER HTML
function createProductCard(product, index) {
  return `
    <div class="cardProducto">
      <img src="${product.image}" 
           alt="${product.title}" 
           class="imagenCardProducto"
           loading="lazy">
      <h3 class="nombreDeProducto">${product.title}</h3>
      <p class="categoriaCard">${product.category}</p>
      <p class="precioProductoCard">${formatPriceWithSymbol(product.price)}</p>
      <button class="botonCardAgregarCart agregar-carrito" 
              data-id="${index}"
              aria-label="Agregar ${product.title} al carrito">
        Agregar al Carrito
      </button>
    </div>
  `;
}

// FUNCION DEL DISPLAY DEL CARRITO
function updateCartDisplay() {
  const hasProducts = allProducts.length > 0;

  // hiddens
  DOM.cart.empty.classList.toggle("hidden", hasProducts);
  DOM.cart.row.classList.toggle("hidden", !hasProducts);
  DOM.cart.totalContainer.classList.toggle("hidden", !hasProducts);

  // actualziar el contenido del carrito
  updateCartProducts();
  updateCartTotal();
  updateCartPage();
}

// FUNCION: ACTUALIZAR EL CONTENIDO DEL CARRITO
function updateCartProducts() {
  DOM.cart.row.innerHTML = allProducts
    .map((product) => createCartProductHTML(product))
    .join("");
}

// FUNCION: CREAR PRODUCTOS EN EL CARRITO
function createCartProductHTML(product) {
  return `
    <div class="cart-product">
      <div class="info-cart-product">
        <div class="imagen-producto-carrito">
          <img src="${product.image}" 
               alt="${product.title}"
               loading="lazy">
        </div>
        <span class="cantidad-producto-carrito">${product.quantity}x</span>
        <div>
          <p class="titulo-producto-carrito">${product.title}</p>
          <span class="precio-producto-carrito">${product.price}</span>
        </div>
      </div>
      <button class="remove-product" aria-label="Eliminar ${product.title}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
             stroke-width="1.5" stroke="currentColor" class="icon-close" width="25" height="25">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `;
}

// FUNCION: ACTUALIZAR EL TOTAL DEL CARRITO
function updateCartTotal() {
  const { total, quantity } = calculateCartTotals();
  DOM.cart.total.innerText = formatPriceWithSymbol(total);
  DOM.cart.count.innerText = quantity;
}

// FUNCION: OPERACION CALCULAR EL TOTAL DEL CARRITO
function calculateCartTotals() {
  return allProducts.reduce(
    (acc, product) => {
      const price = parseFloat(
        product.price.replace("$", "").replace(/\./g, "")
      );
      return {
        total: acc.total + price * product.quantity,
        quantity: acc.quantity + product.quantity,
      };
    },
    { total: 0, quantity: 0 }
  );
}

// FUNCION: ACTUALIZAR EL CONTENIDO DEL CARRITO EN LA PAGINA DE !CARRITO!
function updateCartPage() {
  if (!DOM.cartPage.productsContainer) return;

  const hasProducts = allProducts.length > 0;

  DOM.cartPage.emptyDiv?.classList.toggle("hidden", hasProducts);
  DOM.cartPage.emptyDiv?.classList.toggle("flex", !hasProducts);
  DOM.cartPage.productsContainer?.classList.toggle("hidden", !hasProducts);
  DOM.cartPage.title?.classList.toggle("hidden", !hasProducts);

  if (hasProducts && DOM.cartPage.productsContainer) {
    updateCartPageContent();
  }
}

function updateCartPageContent() {
  const { total } = calculateCartTotals();

  DOM.cartPage.productsContainer.innerHTML = `
    ${allProducts.map(createCartProductHTML).join("")}
    <div class="cart-total-page">
      <h3>Total a Pagar:</h3>
      <span id="total-pagar-page">${formatPriceWithSymbol(total)}</span>
    </div>
    <button class="boton-finalizar-compra" id="botonFinalizarCompra">Finalizar Compra</button>
  `;

  // Boton Finalizar Compra (redirige a la pagina de finalizar compra)
  const finishBtn = document.querySelector("#botonFinalizarCompra");
  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      window.location.href = "../pages/finalizar-payment.html";
    });
  }
}

// Event Handlers (sirven para esperar a que el usuario haga click en un boton)
function handleAddToCart(e) {
  if (!e.target.classList.contains("botonCardAgregarCart")) return;

  const productId = parseInt(e.target.dataset.id);
  const product = productos[productId];

  if (!product) return;

  const cartProduct = {
    quantity: 1,
    title: product.title,
    price: formatPriceWithSymbol(product.price),
    image: product.image,
  };

  const existingProduct = allProducts.find(
    (p) => p.title === cartProduct.title
  );

  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    allProducts.push(cartProduct);
  }

  updateCartDisplay();
  saveToLocalStorage();
}

// FUNCION: ELIMINAR PRODUCTOS DEL CARRITO
function handleRemoveFromCart(e) {
  const removeButton = e.target.closest(".remove-product");
  if (!removeButton) return;

  const productElement = removeButton.closest(".cart-product");
  const title = productElement.querySelector(
    ".titulo-producto-carrito"
  ).textContent;

  allProducts = allProducts.filter((product) => product.title !== title);

  updateCartDisplay();
  saveToLocalStorage();
}

function handleCartNavigation() {
  window.location.href = window.location.pathname.includes("/pages/")
    ? "carrito.html"
    : "pages/carrito.html";
}

function handleCheckout() {
  window.location.href = "../index.html";
}

// MENU DE HAMBURGUESA (BOTON MOBILE)
function setupMobileNav() {
  if (!DOM.nav.hamburger || !DOM.nav.mainNav) return;

  DOM.nav.hamburger.addEventListener("click", () => {
    DOM.nav.hamburger.classList.toggle("active");
    DOM.nav.mainNav.classList.toggle("active");
  });

  if (window.innerWidth <= 610) {
    DOM.nav.mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        DOM.nav.hamburger.classList.remove("active");
        DOM.nav.mainNav.classList.remove("active");
      });
    });
  }
}

// Error Handling
function showErrorMessage(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => errorDiv.remove(), 5000);
}

// Initialize
function init() {
  // Fetch products
  fetchProducts();

  // EVENTS LISTENERS
  DOM.cart.button?.addEventListener("click", () =>
    DOM.cart.container?.classList.toggle("hidden-cart")
  );

  DOM.products.list?.addEventListener("click", handleAddToCart);
  DOM.cart.row?.addEventListener("click", handleRemoveFromCart);
  DOM.cartPage.productsContainer?.addEventListener(
    "click",
    handleRemoveFromCart
  );

  DOM.cart.goToCartBtn?.addEventListener("click", handleCartNavigation);
  DOM.cart.goToCartBtnPages?.addEventListener("click", handleCartNavigation);

  // Setup mobile navigation
  setupMobileNav();

  // Initialize Google Maps if needed
  if (typeof google !== "undefined" && typeof initMap === "function") {
    initMap();
  }
}

// Start the application
document.addEventListener("DOMContentLoaded", init);

// MAPA DE LA PAGINA DE !NOSOTROS!
function initMap() {
  const mapLocation = { lat: -31.418840548674446, lng: -64.18113800000002 };

  // Crear un nuevo mapa
  const map = new google.maps.Map(document.getElementById("map-canvas"), {
    zoom: 15,
    center: mapLocation,
  });

  // Añadir un marcador
  new google.maps.Marker({
    position: mapLocation,
    map: map,
    title: "Chacabuco 186, Córdoba",
  });
}

// Loader
function hideLoader() {
  const loader = document.querySelector(".loader");
  setTimeout(() => {
    loader.classList.add("hidden");
  }, 8000);
}

hideLoader();

// Payment complete
function paymentComplete() {
  const paymentCompleteDiv = document.querySelector(".payment-complete");
  setTimeout(() => {
    paymentCompleteDiv.classList.remove("hidden");
    paymentCompleteDiv.classList.add("flex");
  }, 8000);
}

paymentComplete();

// Boton Regresar a la tienda
const buttonHome = document.querySelector(".button-home");
buttonHome.addEventListener("click", () => {
  // Borrar elementos en el carrito
  localStorage.removeItem(STORAGE_KEY);
  allProducts = [];
  window.location.href = "../index.html";
});
