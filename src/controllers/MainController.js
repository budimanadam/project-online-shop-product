const DBconnection = require('../../DBconnection');
const fs = require('fs')
var connection = DBconnection.startDBConnection();

// Function to GET all products from DB
var getAll = async (req, h) => {
    try {
        var products = await connection.query(`
        SELECT * 
        FROM products`);
        var data = products.rows;
        
        return h.view('Home', {
            data
        });
    } catch (error) {
        throw error;
    }
}

// Function to GET product by Id (dispno)
var getById = async (req, h) => {
    try {
        var product = await connection.query(`
        SELECT  * 
        FROM    products 
        WHERE   dispno = ${req.params.id}`);

        var data = product.rows;
        
        return h.view('Details', {
            data
        });
    } catch (error) {
        throw error;
    }
}

// Function to PUT product by id (dispno)
var putById = async (req, h) => {
    try {       
        var queryUpdateImage = ``;
        if (Object.keys(req.payload.image).length !== 0) {
            var imageName = req.payload.dispengnm.replace(' ', '') + '-' + Math.floor(Date.now() / 1000) + '.jpg'
            queryUpdateImage = `, image = '${imageName}'`;

            await fs.writeFile(`src/images/${imageName}`, req.payload.image, err => {
                if (err) {
                    throw (err)
                }
            })
        }
        
        await connection.query(`
        UPDATE products 
        SET dispengnm = '${req.payload.dispengnm}',
            dispnm = '${req.payload.dispnm}',
            stock = '${req.payload.stock}',
            price = '${req.payload.price}',
            description = '${req.payload.description}'
            ${queryUpdateImage}
        WHERE
            dispno = ${req.params.id}`)

        return 'success';
    } catch (error) {
        throw error;
    }
}

// Fucntion to DELETE product by Id (dispno)
var deleteById = async (req, h) => {
    try {
        await connection.query(`
        DELETE FROM products
        WHERE dispno = ${req.params.id}`)

        return 'success';
    } catch (error) {
        throw error;
    }
}

module.exports ={
    getAll,
    getById,
    putById,
    deleteById,
}