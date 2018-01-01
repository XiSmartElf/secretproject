const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();

// Get Product
publicClient
.getProducts()
.then(data => {
    data
    && data.length > 0
    && data.map((v, i) => {
        console.log("Product " + (i + 1) + ": " + v.display_name)
    });
})
.catch(error => {
    console.log("Get gdax product error: " + error);
});