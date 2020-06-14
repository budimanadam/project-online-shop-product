'use strict';

const Hapi = require('@hapi/hapi');
const DBconnection = require('./DBconnection')
const Preparation = require('./app')
const xml2js = require('xml2js');
const MainController = require('./src/controllers/MainController')
const Vision = require('@hapi/vision');
const Path = require('path');
require('dotenv').config();

// initiate the server and connection
const init = async () => {
  var connection = DBconnection.startDBConnection();

  const server = Hapi.server({
      port: 3000,
      host: 'localhost',
      routes: {
        files: {
          relativeTo: Path.join(__dirname, 'src/images')
        }
      }
  });
  
    try {
      // get products from Elevenia API
      var products = await Preparation.getAPIElevenia();
      var data = {};
      var queryPreparation = 
      `CREATE TABLE IF NOT EXISTS products (
        dispno serial PRIMARY KEY,
        depth int DEFAULT 0,
        dispengnm varchar(50) DEFAULT '',
        dispnm varchar(50) DEFAULT '',
        parentdispno int DEFAULT 0,
        stock int DEFAULT 0,
        image varchar(200) DEFAULT '',
        price DECIMAL(10,2) DEFAULT 0,
        description varchar(150) DEFAULT ''
      )`;

      // Run the query to create table products
      await connection.query(queryPreparation, async (error, results) => {
        if (error) {
          throw error
        }
      });

      setTimeout(() => {
        connection.query(`DELETE FROM products`)
      }, 1000);

      await xml2js.parseString(products.data, async (err, result) => {
        data = result['ns2:categorys']['ns2:category']
      });
      
      setTimeout(() => {
        data.forEach(each => {
          var dispengname = each.dispEngNm[0].replace("'", "`");
          var dispname = each.dispNm[0].replace("'", "`");
          var queryInsertProduct = `
          INSERT 
          INTO products 
              (dispno, depth, dispengnm, dispnm, parentdispno, stock, image, price, description)
          VALUES              
              (${each.dispNo[0]},${each.depth[0]},'${dispengname}','${dispname}',${each.parentDispNo[0]}, 100, 'download.png', 100000, 'Barang yang sangat cocok untuk dipakai sehari-hari')`;

          // Insert the data from Elevenia API to DB
          connection.query(queryInsertProduct)
        })
      }, 2000);

      console.log('Success starting DB and all preparation');
    } catch (error) {
      throw error
    }
    await server.register(require('@hapi/inert'));

    // Define Routes
    server.route({
      method: 'GET',
      path: '/pictures/{image}',
      handler: function (request, h) {

          return h.file(request.params.image);
      }
    });

    server.route([
      { 
        path: '/',              
        method: 'GET' ,
        handler: MainController.getAll
      },
      { 
        path: '/products/{id}', 
        method: 'GET',    
        handler: MainController.getById },
      { 
        path: '/products/{id}', 
        method: 'PUT',    
        config: {
          handler: MainController.putById,
          payload: {
            multipart: true
          }
        }
      },
      { 
        path: '/products/{id}', 
        method: 'DELETE', 
        handler: MainController.deleteById },
    ]);

    await server.register(Vision);

    // Define the view template
    server.views({
      engines: {
          html: require('handlebars')
      },
      path: __dirname + '/src/views',
    });

    // Start server
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init()
