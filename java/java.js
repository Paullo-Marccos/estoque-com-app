
//Variável que guarda a lista de todos os produtos
var produtos = [];

var idEditando = 0;

var idExcluindo = 0;
function carregar() {
  try {
    var texto = localStorage.getItem("estoque_produtos");
    if (texto) {
      produtos = JSON.parse(texto);
    }
  } catch (erro) {
    produtos = [];
  }

  if (produtos.length == 0) {
    produtos = [
      { id: 1, nome: "Cimento CP-II 50kg", categoria: "Cimento e argamassa", unidade: "saco", quantidade: 40, minimo: 10, preco: 38.9 },
      { id: 2, nome: "Tijolo 8 furos", categoria: "Tijolos e blocos", unidade: "un", quantidade: 3, minimo: 200, preco: 0.9 },
      { id: 3, nome: "Martelo", categoria: "Ferramentas", unidade: "un", quantidade: 0, minimo: 2, preco: 45 }
    ];
  }
}
function salvar() {
  try {
    localStorage.setItem("estoque_produtos", JSON.stringify(produtos));
  } catch (erro) {
    // 
  }
}


function escapar(texto) {
  return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function dinheiro(valor) {
  return "R$ " + valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function situacao(p) {
  if (p.quantidade <= 0) {
    return "zero";
  } else if (p.quantidade <= p.minimo) {
    return "baixo";
  } else {
    return "ok";
  }
}


function desenharLista() {
  var busca = document.getElementById("busca").value.toLowerCase();
  var filtro = document.getElementById("filtro").value;

  var html = "";
  var totalBaixo = 0;
  var totalValor = 0;

  for (var i = 0; i < produtos.length; i++) {
    var p = produtos[i];
    var sit = situacao(p);

    
    if (sit != "ok") {
      totalBaixo = totalBaixo + 1;
    }
    totalValor = totalValor + p.quantidade * p.preco;

    var textoProduto = (p.nome + " " + p.categoria).toLowerCase();
    if (textoProduto.indexOf(busca) == -1) {
      continue;
    }

    if (filtro == "baixo" && sit == "ok") {
      continue;
    }

    var textoSit = "OK";
    if (sit == "baixo") { textoSit = "Baixo"; }
    if (sit == "zero") { textoSit = "Acabou"; }

    var textoExcluir = "Excluir";
    if (idExcluindo == p.id) { textoExcluir = "Confirmar?"; }

    html = html + "<tr>"
      + "<td><b>" + escapar(p.nome) + "</b></td>"
      + "<td>" + escapar(p.categoria) + "</td>"
      + "<td>" + p.quantidade + " " + escapar(p.unidade) + "</td>"
      + "<td><span class='tag " + sit + "'>" + textoSit + "</span></td>"
      + "<td>" + dinheiro(p.preco) + "</td>"
      + "<td><div class='mov'>"
      +   "<input id='qtd-" + p.id + "' type='number' min='1' value='1'>"
      +   "<button onclick='mover(" + p.id + ", 1)' title='Entrada'>+</button>"
      +   "<button onclick='mover(" + p.id + ", -1)' title='Saída'>−</button>"
      + "</div></td>"
      + "<td><button onclick='editar(" + p.id + ")'>Editar</button> "
      +   "<button class='perigo' onclick='excluir(" + p.id + ")'>" + textoExcluir + "</button></td>"
      + "</tr>";
  }

  //  Se nenhum produto passou pelos filtros, mostra uma mensagem
  if (html == "") {
    html = "<tr><td colspan='7' class='vazio'>Nenhum produto encontrado.</td></tr>";
  }

  // Coloca tudo na página
  document.getElementById("lista").innerHTML = html;
  document.getElementById("totalProdutos").textContent = produtos.length;
  document.getElementById("totalBaixo").textContent = totalBaixo;
  document.getElementById("totalValor").textContent = dinheiro(totalValor);
}


// ==========================================
// FORMULÁRIO (abrir, fechar e limpar)
// ==========================================

// Botão grande: abre o formulário vazio para cadastrar
function novoProduto() {
  limparFormulario();
  mostrarAviso("");
  abrirFormulario();
}

//  Mostra o formulário na tela
function abrirFormulario() {
  var area = document.getElementById("areaForm");
  area.style.display = "block";
  area.scrollIntoView();
  document.getElementById("nome").focus();
}

//  Esvazia o formulário e volta para o modo "novo produto"
function limparFormulario() {
  document.getElementById("nome").value = "";
  document.getElementById("quantidade").value = 0;
  document.getElementById("minimo").value = 5;
  document.getElementById("preco").value = 0;
  document.getElementById("mensagem").textContent = "";
  document.getElementById("tituloForm").textContent = "Novo produto";
  idEditando = 0;
}

// Limpa e esconde o formulário
function fecharFormulario() {
  limparFormulario();
  document.getElementById("areaForm").style.display = "none";
}

//  Mostra uma mensagem de sucesso embaixo do botão grande
function mostrarAviso(texto) {
  document.getElementById("aviso").textContent = texto;
}


// ==========================================
// ESTOQUE E CADASTRO (entrada, saída, salvar, editar, excluir)
// ==========================================

function mover(id, sinal) {
  var campo = document.getElementById("qtd-" + id);
  var quantidade = parseInt(campo.value);
  if (isNaN(quantidade) || quantidade <= 0) {
    return;
  }

  //  Procura o produto pelo id e soma (ou subtrai) a quantidade
  for (var i = 0; i < produtos.length; i++) {
    if (produtos[i].id == id) {
      var novo = produtos[i].quantidade + quantidade * sinal;
      // Não deixa o estoque ficar negativo
      if (novo < 0) {
        novo = 0;
      }
      produtos[i].quantidade = novo;
    }
  }

  //  Guarda e atualiza a tela
  salvar();
  desenharLista();
}

//  Salva um produto novo ou as mudanças de um produto editado
function salvarProduto(maisUm) {
  // Confere se o nome foi preenchido
  var nome = document.getElementById("nome").value.trim();
  var msg = document.getElementById("mensagem");
  if (nome == "") {
    msg.textContent = "Digite o nome do produto.";
    return;
  }
  msg.textContent = "";

  //  Junta os dados do formulário em um objeto
  var dados = {
    nome: nome,
    categoria: document.getElementById("categoria").value,
    unidade: document.getElementById("unidade").value,
    quantidade: parseInt(document.getElementById("quantidade").value) || 0,
    minimo: parseInt(document.getElementById("minimo").value) || 0,
    preco: parseFloat(document.getElementById("preco").value) || 0
  };

  if (idEditando == 0) {
    // Produto novo: o id é o maior id existente + 1
    var maior = 0;
    for (var i = 0; i < produtos.length; i++) {
      if (produtos[i].id > maior) { maior = produtos[i].id; }
    }
    dados.id = maior + 1;
    produtos.push(dados);
  } else {
    // Edição: troca os dados do produto que tem esse id
    for (var j = 0; j < produtos.length; j++) {
      if (produtos[j].id == idEditando) {
        dados.id = idEditando;
        produtos[j] = dados;
      }
    }
  }

  //  Guarda e limpa o formulário
  salvar();
  limparFormulario();

  //  "Salvar e adicionar outro" mantém o formulário aberto
  if (maisUm) {
    document.getElementById("nome").focus();
  } else {
    fecharFormulario();
  }

  //  Avisa que deu certo e atualiza a tela
  mostrarAviso("✅ Produto salvo: " + nome);
  desenharLista();
}

// Coloca os dados do produto no formulário para editar
function editar(id) {
  //  Procura o produto e preenche cada campo
  for (var i = 0; i < produtos.length; i++) {
    var p = produtos[i];
    if (p.id == id) {
      document.getElementById("nome").value = p.nome;
      document.getElementById("categoria").value = p.categoria;
      document.getElementById("unidade").value = p.unidade;
      document.getElementById("quantidade").value = p.quantidade;
      document.getElementById("minimo").value = p.minimo;
      document.getElementById("preco").value = p.preco;
    }
  }

  //  Marca qual produto está em edição e abre o formulário
  idEditando = id;
  document.getElementById("tituloForm").textContent = "Editando produto";
  abrirFormulario();
}

// Primeiro clique pede confirmação, segundo clique exclui
function excluir(id) {
  // Primeiro clique: só marca o produto e mostra "Confirmar?"
  if (idExcluindo != id) {
    idExcluindo = id;
    desenharLista();
    return;
  }

  //  Segundo clique: monta uma lista nova sem esse produto
  var novaLista = [];
  for (var i = 0; i < produtos.length; i++) {
    if (produtos[i].id != id) {
      novaLista.push(produtos[i]);
    }
  }

  produtos = novaLista;
  idExcluindo = 0;
  salvar();
  desenharLista();
}


// ==========================================
// BACKUP (salvar e restaurar em arquivo)
// ==========================================


function doisDigitos(n) {
  if (n < 10) {
    return "0" + n;
  }
  return "" + n;
}

function fazerBackup() {
  var texto = JSON.stringify(produtos, null, 2);
  var arquivo = new Blob([texto], { type: "application/json" });

  var hoje = new Date();
  var data = hoje.getFullYear() + "-" + doisDigitos(hoje.getMonth() + 1) + "-" + doisDigitos(hoje.getDate());

  var link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = "backup-estoque-" + data + ".json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  try {
    localStorage.setItem("estoque_ultimo_backup", String(hoje.getTime()));
  } catch (erro) {
  
  }
  mostrarStatusBackup();
}


function restaurarBackup(evento) {
 
  var arquivo = evento.target.files[0];
  if (!arquivo) {
    return;
  }

  var leitor = new FileReader();
  leitor.onload = function () {
    var lista = null;
    try {
      lista = JSON.parse(leitor.result);
    } catch (erro) {
      alert("Esse arquivo não é um backup válido.");
      return;
    }

    var valido = Array.isArray(lista);
    if (valido) {
      for (var i = 0; i < lista.length; i++) {
        var p = lista[i];
        if (typeof p.id != "number" || typeof p.nome != "string" || typeof p.quantidade != "number") {
          valido = false;
        }
      }
    }
    if (!valido) {
      alert("Esse arquivo não parece ser um backup do estoque.");
      return;
    }

    if (confirm("Isso vai substituir o estoque atual por " + lista.length + " produtos do backup. Continuar?")) {
      produtos = lista;
      salvar();
      desenharLista();
    }
  };
  leitor.readAsText(arquivo);

  evento.target.value = "";
}

function mostrarStatusBackup() {
  var campo = document.getElementById("statusBackup");

  var guardado = null;
  try {
    guardado = localStorage.getItem("estoque_ultimo_backup");
  } catch (erro) {
    guardado = null;
  }

  if (!guardado) {
    campo.textContent = "⚠️ Você ainda não fez nenhum backup neste aparelho.";
    campo.style.color = "#8a5a00";
    return;
  }

  var dias = Math.floor((new Date().getTime() - Number(guardado)) / 86400000);

  if (dias >= 7) {
    campo.textContent = "⚠️ Último backup há " + dias + " dias. Faça um novo!";
    campo.style.color = "#8a5a00";
  } else if (dias == 0) {
    campo.textContent = "✅ Último backup: hoje.";
    campo.style.color = "#1f7a3d";
  } else {
    campo.textContent = "✅ Último backup há " + dias + " dia(s).";
    campo.style.color = "#1f7a3d";
  }
}

carregar();

desenharLista();

mostrarStatusBackup();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(function () {
  });
}