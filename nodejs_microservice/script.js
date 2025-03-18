import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// Metrics

// // Customer Mertrics
let loginTrend = new Trend('login_time');
let profileTrend = new Trend('profile_fetch_time');
let shoppingDetailsTrend = new Trend('shopping_details_time');
let addAddressTrend = new Trend('add_address_time');
let getWishlistTrend = new Trend('get_wishlist_time');

// // Shopping Metrics
let getCartTrend = new Trend('cart_fetch_time');
let postOrderTrend = new Trend('order_creation_time');
let getOrderTrend = new Trend('get_order_time');

// // Product Trend
let productTrend = new Trend('product_fetch_time');
let wishlistTrend = new Trend('wishlist_add_time');
let cartAddTrend = new Trend('cart_add_time');
let createProductTrend = new Trend('create_product_time');
let selectProductsTrend = new Trend('select_product_time');

// Test options
export let options = {
    stages: [
        { duration: '15s', target: 1 }, // Ramp-up to 10 users
        { duration: '30s', target: 1 },  // Stay at 10 users
        { duration: '15s', target: 0 },  // Ramp-down to 0 users
    ],
};

// Base URLs
const CUSTOMER_BASE = 'http://host.docker.internal:80/customer';
const SHOPPING_BASE = 'http://host.docker.internal:80/shopping';
const PRODUCTS_BASE = 'http://host.docker.internal:80';

// Authenticate and Get Token
function authenticateUser() {
    let loginRes = http.post(
        `${CUSTOMER_BASE}/login`,
        JSON.stringify({ email: 'test4@test.com', password: '12345' }),
        { headers: { 'Content-Type': 'application/json' } }
    );

    loginTrend.add(loginRes.timings.duration);

    check(loginRes, {
        'Login status is 200': (r) => r.status === 200,
    });

    let token;
    try {
        token = loginRes.json('token');
        // console.log(token)
    } catch (e) {
        console.error('Error parsing login response:', e);
    }

    if (!token) {
        console.error(`Login failed with status: ${loginRes.status}, body: ${loginRes.body}`);
    }

    return token;
}

// // Fetch Customer Profile
function getCustomerProfile(authToken) {
    let res = http.get(`${CUSTOMER_BASE}/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });

    profileTrend.add(res.timings.duration);

    check(res, {
        'Get customer profile status is 200': (r) => r.status === 200,
    });

    let getProfile;
    try {
        getProfile = res.json();
    } catch (e) {
        console.error('Error parsing customer pofile:', e);
    }
    return getProfile;
}

function getShoppingDetails(authToken) {
    let res = http.get(`${CUSTOMER_BASE}/shoping-details`, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: '60s'
    });
    // Track response time
    shoppingDetailsTrend.add(res.timings.duration);

    // Validate response
    check(res, {
        'Get shopping details status is 200': (r) => r.status === 200,
    });

    // Log error if response is not successful
    if (res.status !== 200) {
        console.error(`Failed to fetch shopping details. Status: ${res.status}, Body: ${res.body}`);
        return null;
    }

    return res.json();
}

function postAddAddress(authToken) {
    let res = http.post(`${CUSTOMER_BASE}/address`, 
    JSON.stringify({
        "street": "Mumbai", 
        "postalCode":"400066", 
        "city":"Mumbai",
        "country":"India" }),    
    {
       headers: { Authorization: `Bearer ${authToken}` }
    });

        addAddressTrend.add(res.timings.duration);

    check(res, {
        'Add address status is 200': (r) => r.status === 200
    });

    return res.json();

}

function getWishlist(authToken) {
    let res = http.get(`${CUSTOMER_BASE}/wishlist`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });

    getWishlistTrend.add(res.timings.duration);

    check (res, {
        'Fetch wishlist status is 200': (r) => r.status === 200,
    });
}

// Fetch Shopping Cart

function getShoppingCart(authToken) {
    let res = http.get(`${SHOPPING_BASE}/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });

    getCartTrend.add(res.timings.duration);

    check(res, {
        'Fetch cart status is 200': (r) => r.status === 200,
    });

    return res.json();
}

// Create an Order
function createOrder(authToken) {
    // let payload = JSON.stringify({ txnId: 'afs25ww5' });

    let res = http.post(
        `${SHOPPING_BASE}/order`,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            timeout: '60s',
        }
    );

    postOrderTrend.add(res.timings.duration);

    check(res, {
        'Order creation status is 200': (r) => r.status === 200,
    });

    if (res.status !== 200) {
        console.error(`Order request failed! Status: ${res.status}, Response: ${res.body}`);
    }

    let orderData;
    try {
        orderData = res.json();
    } catch (e) {
        console.error('Error parsing order response:', e);
    }

    return orderData;
}


// Fetch Orders
function getOrders(authToken) {
    let res = http.get(`${SHOPPING_BASE}/orders`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });

    getOrderTrend.add(res.timings.duration);

    check(res, {
        'Get orders status is 200': (r) => r.status === 200,
    });

    return res.json();
}

// Fetch Products
function getProducts(authToken) {
    let res = http.get(`${PRODUCTS_BASE}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
    });

    productTrend.add(res.timings.duration);

    check(res, {
        'Get products status is 200': (r) => r.status === 200,
    });
    // console.log(`Products API Response: Status ${res.status}, Body: ${res.body}`);

    let productData;
    try {
        productData = res.json();
    } catch (e) {
        console.error('Error parsing products response:', e);
        return null;
    }

    return productData;
}

function createProducts(authToken) {
    let payload = JSON.stringify ({
        "name":"Olive Oil",
        "desc":"great Quality of Oil",
        "type":"oils",
        "banner":"http://codergogoi.com/youtube/images/oliveoil.jpg",
        "unit":1,
        "price":400, 
        "available":true,
        "suplier":"Golden seed firming"
    });
    let res = http.post(`${PRODUCTS_BASE}/product/create`, payload, {
        headers: { Authorization: `Bearer ${authToken}` },
    });

    createProductTrend.add(res.timings.duration);

    check(res, {
        'Create Products status is 200': (r) => r.status === 200,
    });

    return res.json();

}

function selectedProducts(authToken) {
    let payload = JSON.stringify({
        "ids":[
            "611badc2eeef961f9d33f2e4",
            "611badc2eeef961f9d33f2e4"
        ]    
    });
    let res = http.post(`${PRODUCTS_BASE}/ids`, payload, {
        headers: { Authorization: `Bearer ${authToken}` },
    });

    selectProductsTrend.add(res.timings.duration);

    check(res, {
        'select product status is 200': (r) => r.status === 200,
    });

    return res.json();
}


// Main function executed in load test
export default function () {
    let authToken = authenticateUser();

    if (!authToken) {
        console.error('Skipping test due to failed authentication.');
        return;
    }

    group('Customer Operations', function () {
        let cartId = getCustomerProfile(authToken);
        let shoppingDetails = getShoppingDetails(authToken);
        let addAddress = postAddAddress(authToken);
        let wishlist = getWishlist(authToken);
    });

    group('Shopping Operations', function () {
        let cart = getShoppingCart(authToken);
        // let orderId = createOrder(authToken);
        let orders = getOrders(authToken);
    });

    group('Product Operations', function () {
        
        let products = getProducts(authToken);

        // console.log(products);
        // console.log(`Fetched products: ${JSON.stringify(products.products[0]._id)}`);
        // let productId = products.products[0]._id;
        // let createProduct = createProducts(authToken);
        // let selectedProduct = selectedProducts(authToken);
    });

    sleep(2);
}
