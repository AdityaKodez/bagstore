const products = [
    {
        id: 1,
        name: "Vintage Leather Backpack",
        price: 129.99,
        image: "images/bag8.jpg",
        description: "Classic vintage-style leather backpack perfect for daily use",
        badge: "Bestseller"
    },
    {
        id: 2,
        name: "Premium Messenger Bag",
        price: 159.99,
        image: "images/bag1.jpg",
        description: "Professional messenger bag for business and casual use",
        badge: "Limited"
    },
    {
        id: 3,
        name: "Luxury Tote Bag",
        price: 189.99,
        image: "images/bag2.jpg",
        description: "Spacious tote bag with premium leather finish",
        badge: "Editor’s pick"
    },
    {
        id: 4,
        name: "Travel Duffel Bag",
        price: 199.99,
        image: "images/bag3.webp",
        description: "Perfect companion for weekend getaways",
        badge: "Weekender"
    },
    {
        id: 5,
        name: "Mini Crossbody Bag",
        price: 89.99,
        image: "images/bag7.jpg",
        description: "Compact and stylish crossbody bag for essentials",
        badge: "Compact"
    },
    {
        id: 6,
        name: "Business Briefcase",
        price: 249.99,
        image: "images/bag6.webp",
        description: "Executive leather briefcase for professionals",
        badge: "New"
    }
];

let cart = [];

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

let cartDrawer;
let cartBackdrop;
let cartCountEl;
let cartItemsContainer;
let cartTotalEl;
let toastContainer;

const formatCurrency = (value) => currencyFormatter.format(value);

const escapeQuotes = (value) => value.replace(/'/g, "\\'");

const handleEscape = (event) => {
    if (event.key === 'Escape') {
        toggleCart(false);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    cartDrawer = document.getElementById('cartDrawer');
    cartBackdrop = document.getElementById('cartBackdrop');
    cartCountEl = document.getElementById('cartCount');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotalEl = document.getElementById('cartTotal');
    toastContainer = document.getElementById('toastContainer');

    const cartBtn = document.getElementById('cartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const newsletterForm = document.getElementById('newsletter-form');
    const yearEl = document.getElementById('year');

    if (cartDrawer) {
        cartDrawer.setAttribute('aria-hidden', 'true');
    }

    if (cartBackdrop) {
        cartBackdrop.setAttribute('aria-hidden', 'true');
    }

    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    cartBtn?.addEventListener('click', () => toggleCart());
    closeCartBtn?.addEventListener('click', () => toggleCart(false));
    cartBackdrop?.addEventListener('click', () => toggleCart(false));
    checkoutBtn?.addEventListener('click', checkout);

    newsletterForm?.addEventListener('submit', (event) => {
        event.preventDefault();
        showPopup('Thanks for joining our list.');
        newsletterForm.reset();
    });

    document.addEventListener('keydown', handleEscape);

    renderProducts();
    updateCart();
});

function toggleCart(forceState) {
    if (!cartDrawer || !cartBackdrop) return;

    const isOpen = cartDrawer.classList.contains('open');
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isOpen;

    if (shouldOpen) {
        cartDrawer.classList.add('open');
        cartBackdrop.classList.add('open');
        cartDrawer.setAttribute('aria-hidden', 'false');
        cartBackdrop.setAttribute('aria-hidden', 'false');
        document.body.classList.add('overflow-hidden');
    } else {
        cartDrawer.classList.remove('open');
        cartBackdrop.classList.remove('open');
        cartDrawer.setAttribute('aria-hidden', 'true');
        cartBackdrop.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('overflow-hidden');
    }
}

function addToCart(name, price, image) {
    const existingItem = cart.find((item) => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
        showPopup(`${name} quantity updated.`);
    } else {
        cart.push({
            name,
            price,
            image,
            quantity: 1
        });
        showPopup(`${name} added to your cart.`);
    }

    updateCart();
}

function removeFromCart(name) {
    cart = cart.filter((item) => item.name !== name);
    updateCart();
    showPopup('Item removed from your cart.');
}

function updateQuantity(name, change) {
    const item = cart.find((cartItem) => cartItem.name === name);

    if (!item) {
        return;
    }

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(name);
    } else {
        updateCart();
    }
}

function updateCart() {
    if (!cartItemsContainer || !cartTotalEl || !cartCountEl) return;

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cartCountEl.textContent = totalItems;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                <img src="cute.jpg" alt="Empty cart" class="mb-6 h-24 w-24 object-contain opacity-80" />
                <h3 class="text-lg font-semibold text-slate-900">Your cart looks pristine</h3>
                <p class="mt-2 text-sm text-slate-500">Add pieces from the collection to complete your look.</p>
            </div>
        `;
        cartTotalEl.textContent = formatCurrency(0);
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item) => {
        const safeName = escapeQuotes(item.name);
        const unitPrice = formatCurrency(item.price);
        const lineTotal = formatCurrency(item.price * item.quantity);

        return `
            <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="flex gap-4">
                    <div class="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                        <img src="${item.image}" alt="${item.name}" class="h-full w-full object-cover">
                    </div>
                    <div class="flex-1">
                        <div class="flex items-start justify-between gap-3">
                            <div>
                                <h3 class="text-base font-semibold text-slate-900">${item.name}</h3>
                                <p class="mt-1 text-sm text-slate-500">${unitPrice}</p>
                            </div>
                            <button onclick="removeFromCart('${safeName}')" class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition hover:text-red-500">Remove</button>
                        </div>
                        <div class="mt-4 flex items-center justify-between gap-6">
                            <div class="flex items-center gap-3">
                                <button onclick="updateQuantity('${safeName}', -1)" class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-600 transition hover:border-brown-500 hover:text-brown-600">-</button>
                                <span class="text-sm font-semibold text-slate-900">${item.quantity}</span>
                                <button onclick="updateQuantity('${safeName}', 1)" class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-600 transition hover:border-brown-500 hover:text-brown-600">+</button>
                            </div>
                            <div class="text-right">
                                <p class="text-xs uppercase tracking-[0.4em] text-slate-400">Subtotal</p>
                                <p class="text-sm font-semibold text-slate-900">${lineTotal}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    cartTotalEl.textContent = formatCurrency(totalPrice);
}

function showPopup(message) {
    const toast = document.createElement('div');
    toast.className = 'flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-black/5 transition-all duration-300 ease-out opacity-0 translate-y-2';
    toast.innerHTML = `<span class="h-2 w-2 rounded-full bg-emerald-500"></span><span>${message}</span>`;

    if (!toastContainer) {
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-y-2');
        });
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-2');
        }, 2400);
        setTimeout(() => toast.remove(), 2800);
        return;
    }

    if (toastContainer.children.length >= 3) {
        toastContainer.removeChild(toastContainer.firstChild);
    }

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
    }, 2400);

    setTimeout(() => {
        toast.remove();
    }, 2800);
}

function checkout() {
    if (cart.length === 0) {
        showPopup('Your cart is currently empty.');
        return;
    }

    showPopup('Thank you! Your order is on its way.');
    cart = [];
    updateCart();
    toggleCart(false);
}

function renderProducts() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = products.map((product) => {
        const safeName = escapeQuotes(product.name);
        const safeImage = escapeQuotes(product.image);
        const badgeMarkup = product.badge ? `
            <span class="absolute left-6 top-6 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-sm">${product.badge}</span>
        ` : '';

        return `
            <article class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div class="relative h-72 overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
                    ${badgeMarkup}
                </div>
                <div class="flex flex-col justify-between gap-6 p-6">
                    <div>
                        <h3 class="text-xl font-semibold text-slate-900">${product.name}</h3>
                        <p class="mt-2 text-sm leading-relaxed text-slate-600">${product.description}</p>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-2xl font-semibold text-brown-500">${formatCurrency(product.price)}</span>
                        <button onclick="addToCart('${safeName}', ${product.price}, '${safeImage}')" class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brown-500">
                            <i class='bx bx-plus text-lg'></i>
                            Add to cart
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}
