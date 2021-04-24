'use strict';

////////////////////////
//// dependencies /////
//////////////////////

// DOTENV
require('dotenv').config();

//Express
const express= require('express');

//CORS
const cors= require('cors');

//Superagent
const superagent= require('superagent');

//PG
const pg= require('pg');

//MethodOverride
const MethodOverride= require('method-override');

////////////////////////
//// App SetUp    /////
//////////////////////

//PORT
const PORT=process.env.PORT || 3000;

// run express
const app= express();

//use cors
app.use(cors());

//middleware
app.use(express.urlencoded({extended:true}));

////PG
//1
// const client = new pg.Client({connectionString:process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}});
//2
const client= new pg.Client(process.env.DATABASE_URL);


//use method-override
app.use(MethodOverride('_method'));

////////////////////////
//// Templating   /////
//////////////////////

// use public
app.use(express.static('./public'));

//set EJS
app.set('view engine', 'ejs');

///////////////////
///// ROUTES /////
/////////////////

app.get('/', homeHandler);
app.get('/favorite-quotes', renderFavHandler);
app.post('/favorite-quotes', saveDataHandler);
app.get('/favorite-quotes/:id', renderSingleChar);
app.put('/favorite-quotes/:id', updateHandler);
app.delete('/favorite-quotes/:id', deleteHandler);





/////////////////
/// HANDLERS ///
///////////////


// homeHandler

function homeHandler(req,res){
    let url = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10'

    superagent.get(url).set('User-Agent', '1.0').then(data=>{
        let dataBody= data.body;
        let correctData= dataBody.map(e=>{
            return new Simpson(e);
        })
        res.render('pages/index', {data:correctData});
    })
}

function saveDataHandler(req,res){
    const{quote,character,image}=req.body;
    const safeValues= [quote,character,image];
    let SQL= `INSERT INTO table1 (quote,character,image) VALUES ($1,$2,$3);`;

    client.query(SQL,safeValues).then(()=>{

        res.redirect('/favorite-quotes');

    });

}


function renderFavHandler(req,res){

    let SQL= 'SELECT * FROM table1;';

    client.query(SQL).then(data=>{
        res.render('pages/fav-quotes', {data:data.rows})
    });
}

function renderSingleChar(req,res){
    let id= req.params.id;
    let SQL=`SELECT * FROM table1 WHERE id=${id};`;

    client.query(SQL).then(data=>{
        res.render('pages/single-char', {data:data.rows[0]});
    }).catch(err=>{
        res.send(err);
    })
}

function updateHandler(req,res){
    const id=req.params.id;
    const{quote,character,image}=req.body;
    const safeValues= [quote,character,image,id];
    const SQL= `UPDATE table1 SET quote=$1,character=$2,image=$3 WHERE id=$4;`;

    client.query(SQL,safeValues).then(()=>{
        res.redirect(`/favorite-quotes/${id}`);
    });
}

function deleteHandler(req,res){
    const id= req.params.id;
    const SQL=`DELETE FROM table1 WHERE id=$1`;
    const safeValue=[id];
    client.query(SQL,safeValue).then(()=>{
        res.redirect('/favorite-quotes');
    });

}

//////////////////////
///// Constructor////
////////////////////

function Simpson(data){
    this.quote= data.quote;
    this.character=data.character;
    this.image=data.image;
}










/////////////////
/// Listening///
///////////////

client.connect().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`listening on ${PORT}`)
    });
});






