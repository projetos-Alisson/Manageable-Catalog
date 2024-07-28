//Import express module
const express = require("express");

//Import fileupload module
const fileupload = require("express-fileupload");

//Import express-handlebars module
const { engine } = require("express-handlebars");

//Import mysql module
const mysql = require("mysql2");

const fs = require("fs");

//App
const app = express();

//Enabling the upload of files
app.use(fileupload());

//Add Boostrap
app.use("/bootstrap", express.static("./node_modules/bootstrap/dist"));

//Add CSS
app.use("/css", express.static("./css"));

//Reference the imagens folder
app.use("/imagens", express.static("./imagens"));

//Configuration of the express-handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars"); //All files belong the handlebars extension
app.set("views", "./views");

//Manipulation of datas
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Configuração de conexão
const conexao = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "projeto",
});

//Manipulation of connection by way of routes

//Configuration of connection
conexao.connect(function (err) {
  if (err) throw err;
  console.log("Conexao efetuada com sucesso!");
});

//Main Route

app.get("/", function (req, res) {
  //SQL
  let sql = "SELECT * FROM produtos";

  //Executar comando SQL
  conexao.query(sql, function (err, result) {
    res.render("forms", { produtos: result }); //Render handlebars file
  });
});

//Cadaster Route
app.post("/cadastrar", function (req, res) {
  /* console.log(req);
  console.log(req.files.imagem.name);
  req.files.imagem.mv(__dirname+'/imagens/'+req.files.imagem.name)   res.end();*/

  let nome = req.body.nome;
  let valor = req.body.valor;
  let imagem = req.files.imagem.name;

  //SQL
  let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagem}')`;

  //Executation command SQL

  conexao.query(sql, function (err, res) {
    if (err) throw err;

    req.files.imagem.mv(__dirname + "/imagens/" + req.files.imagem.name);
    console.log(res);
  });

  //Return to the main route
  res.redirect("/");
});

//Route to remove products
app.get("/remover/:codigo&:imagem", function (req, res) {
  // console.log(req.params.codigo);
  // console.log(req.params.imagem);

  //SQL
  let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`;

  //Execute the SQL command
  conexao.query(sql, function (err, retorno) {
    if (err) throw err;

    fs.unlink(__dirname + "/imagens/" + req.params.imagem, (err_img) => {
      if (err_img) console.log("Falha ao remover imagem");
      else {
        console.log("Produto excluído");
      }
    });
  });

  //Redirection
  res.redirect("/");
});

//Route to redirect for the forms of changes/edition
app.get("/formularioEditar/:codigo", function (req, res) {
  //SQL
  let sql = `SELECT * FROM produtos WHERE codigo = ${req.params.codigo}`;

  conexao.query(sql, function(err, retorno){

    if(err) throw err;

    res.render('formsEditar', {produto:retorno[0]}) //SELECT command return a LIST (array), so like if want only one product, to acess item primary, uses [0]  
  })
});
//Server
app.listen(8080);
