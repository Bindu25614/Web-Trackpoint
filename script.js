
// 1. Order status sequence
const statuses = [
    "Placed",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered"
];

// Store orders in browser LocalStorage
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// ADMIN DASHBOARD STATISTICS

function updateDashboardStats() {

    const total = orders.length;

    const delivered = orders.filter(
        order => order.status === "Delivered"
    ).length;

    const progress = orders.filter(
        order => order.status !== "Delivered"
    ).length;

    const now = new Date();

    const delayed = orders.filter(order => {
        const lastUpdate = new Date(
            order.history[order.history.length - 1].date
        );

        const days = (now - lastUpdate) /
                     (1000 * 60 * 60 * 24);

        return days > 2 && order.status !== "Delivered";
    }).length;

    document.getElementById("totalOrders").textContent = total;
    document.getElementById("deliveredOrders").textContent = delivered;
    document.getElementById("progressOrders").textContent = progress;
    document.getElementById("delayedOrders").textContent = delayed;
}

// Update statistics when Admin page opens
if (document.getElementById("totalOrders")) {
    updateDashboardStats();
}


// Save orders
function saveOrders() {
    localStorage.setItem("orders", JSON.stringify(orders));
}

// 2. PLACE AN ORDER
const orderForm = document.getElementById("orderForm");

if (orderForm) {
    orderForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const customer = document.getElementById("customer").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const items = document.getElementById("items").value.trim();
    const pincode = document.getElementById("pincode").value.trim();

    if (!customer || !phone || !items || !pincode) {
        alert("Please fill all the details!");
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        alert("Enter a valid 10-digit phone number!");
        return;
    }

    if (!/^\d{6}$/.test(pincode)) {
        alert("Enter a valid 6-digit pincode!");
        return;
    }

    const order = {
        id: "TP" + Date.now(),
        customer: customer,
        phone: phone,
        items: items,
        pincode: pincode,
        status: "Placed",

        history: [
            {
                status: "Placed",
                date: new Date().toISOString()
            }
        ]
    };

    orders.push(order);
    saveOrders();

    document.getElementById("orderMessage").innerHTML =
        "Order placed successfully! Your Order ID is: " + order.id;

    document.getElementById("orderForm").reset();
});
}


// 3. TRACK ORDER USING ORDER ID
function trackOrder() {

    const id = document.getElementById("trackId").value.trim();

    const order = orders.find(o => o.id === id);

    const result = document.getElementById("trackingResult");

    if (!order) {
        result.textContent = "Order not found!";
        return;
    }

    let output = `
        <h3>Order Details</h3>
        <p>Order ID: ${order.id}</p>
        <p>Customer: ${order.customer}</p>
        <p>Items: ${order.items}</p>
        <p>Current Status: ${order.status}</p>
        <h3>Status History</h3>
    `;

    order.history.forEach(h => {
        output += `
            <p>${h.status} - ${new Date(h.date).toLocaleString()}</p>
        `;
    });

    result.innerHTML = output;
}


// 4. UPDATE ORDER STATUS
function updateStatus() {

    const id = document.getElementById("adminId").value.trim();

    const order = orders.find(o => o.id === id);

    const result = document.getElementById("adminResult");

    if (!order) {
        result.textContent = "Order not found!";
        return;
    }

    const currentIndex = statuses.indexOf(order.status);

    if (currentIndex === statuses.length - 1) {
        result.textContent = "Order is already Delivered!";
        return;
    }

    // Allow only the next valid status
    order.status = statuses[currentIndex + 1];

    // Record status history
    order.history.push({
        status: order.status,
        date: new Date().toISOString()
    });

    saveOrders();

    result.textContent =
        "Order updated successfully! New status: " + order.status;
}


// 5. FIND DELAYED ORDERS
function showDelayedOrders() {

    const result = document.getElementById("delayedResult");

    const now = new Date();

    const delayed = orders.filter(order => {
        const lastUpdate = new Date(
            order.history[order.history.length - 1].date
        );

        const days = (now - lastUpdate) / (1000 * 60 * 60 * 24);

        return days > 2 && order.status !== "Delivered";
    });

    if (delayed.length === 0) {
        result.textContent = "No delayed orders found!";
        return;
    }

    let output = "<h3>Delayed Orders</h3>";

    delayed.forEach(order => {
        output += `
            <p>
                Order ID: ${order.id}<br>
                Customer: ${order.customer}<br>
                Status: ${order.status}<br>
                Waiting for more than 2 days
            </p>
            <hr>
        `;
    });

    result.innerHTML = output;
}


// 6. CUSTOMER ORDER HISTORY
function showHistory() {

    const phone = document.getElementById("historyPhone").value.trim();

    const result = document.getElementById("historyResult");

    const customerOrders = orders.filter(o => o.phone === phone);

    if (customerOrders.length === 0) {
        result.textContent = "No orders found for this customer!";
        return;
    }

    let output = "<h3>Complete Order History</h3>";

    customerOrders.forEach(order => {
        output += `
            <p>
                Order ID: ${order.id}<br>
                Items: ${order.items}<br>
                Status: ${order.status}<br>
                Order Date: ${new Date(order.history[0].date).toLocaleString()}
            </p>
            <hr>
        `;
    });

    result.innerHTML = output;
}

function quickTrack() {
    const id = document.getElementById("homeTrackId").value.trim();

    if (!id) {
        alert("Please enter your Order ID!");
        return;
    }

    document.getElementById("trackId").value = id;

    trackOrder();

    document.getElementById("track").scrollIntoView({
        behavior: "smooth"
    });
}
