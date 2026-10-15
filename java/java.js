// Estoque da Loja de Construção - © 2026 Paulo Marcos. Todos os direitos reservados.

// ==========================================
// 1. DADOS (lista de produtos e salvar no navegador)
// ==========================================
// Lista onde ficam todos os produtos
var produtos = [];
// Guarda o id do produto que está sendo editado (0 = nenhum)
var idEditando = 0;
// Guarda o id do produto que está esperando confirmação para excluir
var idExcluindo = 0;

// Pega os produtos salvos no navegador
function carregar() {
  try {
    var texto = localStorage.getItem("estoque_produtos");
    if (texto) {
      produtos = JSON.parse(texto);
    }
  } catch (erro) {
    produtos = [];
  }
  // Se não tem nada salvo, coloca alguns exemplos
  if (produtos.length == 0) {
    produtos = [
      { id: 1, nome: "Cimento CP-II 50kg", categoria: "Cimento e argamassa", unidade: "saco", quantidade: 40, minimo: 10, preco: 38.9 },
      { id: 2, nome: "Tijolo 8 furos", categoria: "Tijolos e blocos", unidade: "un", quantidade: 3, minimo: 200, preco: 0.9 },
      { id: 3, nome: "Martelo", categoria: "Ferramentas", unidade: "un", quantidade: 0, minimo: 2, preco: 45 }
    ];
  }
}

// Salva a lista no navegador
function salvar() {
  try {
    localStorage.setItem("estoque_produtos", JSON.stringify(produtos));
  } catch (erro) {
    // se não conseguir salvar, o sistema continua funcionando
  }
}

// ==========================================
// 2. FUNÇÕES AUXILIARES (texto, dinheiro, situação)
// ==========================================
// Evita que textos digitados quebrem a página
function escapar(texto) {
  return String(texto).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Transforma número em dinheiro: 1234.5 -> R$ 1.234,50
function dinheiro(valor) {
  return "R$ " + valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Retorna a situação do produto: "zero", "baixo" ou "ok"
function situacao(p) {
  if (p.quantidade <= 0) {
    return "zero";
  } else if (p.quantidade <= p.minimo) {
    return "baixo";
  } else {
    return "ok";
  }
}

// ==========================================
// 3. TELA (desenhar a lista e o resumo)
// ==========================================
// Desenha a tabela e o resumo na tela
function desenharLista() {
  var busca = document.getElementById("busca").value.toLowerCase();
  var filtro = document.getElementById("filtro").value;
  var html = "";
  var totalBaixo = 0;
  var totalValor = 0;

  for (var i = 0; i < produtos.length; i++) {
    var p = produtos[i];
    var sit = situacao(p);

    // O resumo conta todos os produtos, mesmo os escondidos pelo filtro
    if (sit != "ok") {
      totalBaixo = totalBaixo + 1;
    }
    totalValor = totalValor + p.quantidade * p.preco;

    // Aplica a busca
    var textoProduto = (p.nome + " " + p.categoria).toLowerCase();
    if (textoProduto.indexOf(busca) == -1) {
      continue;
    }
    // Aplica o filtro de estoque baixo
    if (filtro == "baixo" && sit == "ok") {
      continue;
    }

    var textoSit = "OK";
    if (sit == "baixo") { textoSit = "Baixo"; }
    if (sit == "zero") { textoSit = "Acabou"; }

    // Botão de excluir pede confirmação no segundo clique
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

  if (html == "") {
    html = "<tr><td colspan='7' class='vazio'>Nenhum produto encontrado.</td></tr>";
  }

  document.getElementById("lista").innerHTML = html;
  document.getElementById("totalProdutos").textContent = produtos.length;
  document.getElementById("totalBaixo").textContent = totalBaixo;
  document.getElementById("totalValor").textContent = dinheiro(totalValor);
}

// ==========================================
// 4. ESTOQUE E CADASTRO (entrada, saída, salvar, editar, excluir)
// ==========================================
// Dá entrada (+) ou saída (-) no estoque. sinal = 1 ou -1
function mover(id, sinal) {
  var campo = document.getElementById("qtd-" + id);
  var quantidade = parseInt(campo.value);
  if (isNaN(quantidade) || quantidade <= 0) {
    return;
  }
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
  salvar();
  desenharLista();
}

// Salva um produto novo ou as mudanças de um produto editado
function salvarProduto(maisUm) {
  var nome = document.getElementById("nome").value.trim();
  var msg = document.getElementById("mensagem");
  if (nome == "") {
    msg.textContent = "Digite o nome do produto.";
    return;
  }
  msg.textContent = "";

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
  salvar();
  limparFormulario();
  if (maisUm) {
    // continua com o formulário aberto para cadastrar o próximo
    document.getElementById("nome").focus();
  } else {
    fecharFormulario();
  }
  mostrarAviso("✅ Produto salvo: " + nome);
  desenharLista();
}

// Coloca os dados do produto no formulário para editar
function editar(id) {
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
  idEditando = id;
  document.getElementById("tituloForm").textContent = "Editando produto";
  abrirFormulario();
}

// Esvazia o formulário e volta para o modo "novo produto"
function limparFormulario() {
  document.getElementById("nome").value = "";
  document.getElementById("quantidade").value = 0;
  document.getElementById("minimo").value = 5;
  document.getElementById("preco").value = 0;
  document.getElementById("mensagem").textContent = "";
  document.getElementById("tituloForm").textContent = "Novo produto";
  idEditando = 0;
}

// Primeiro clique pede confirmação, segundo clique exclui
function excluir(id) {
  if (idExcluindo != id) {
    idExcluindo = id;
    desenharLista();
    return;
  }
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
// 5. FORMULÁRIO (abrir e fechar)
// ==========================================
// Botão grande: abre o formulário vazio para cadastrar
function novoProduto() {
  limparFormulario();
  mostrarAviso("");
  abrirFormulario();
}

// Mostra o formulário na tela
function abrirFormulario() {
  var area = document.getElementById("areaForm");
  area.style.display = "block";
  area.scrollIntoView();
  document.getElementById("nome").focus();
}

// Limpa e esconde o formulário
function fecharFormulario() {
  limparFormulario();
  document.getElementById("areaForm").style.display = "none";
}

// Mostra uma mensagem de sucesso embaixo do botão
function mostrarAviso(texto) {
  document.getElementById("aviso").textContent = texto;
}

// ==========================================
// 6. BACKUP (salvar e restaurar)
// ==========================================
// Coloca um zero na frente de números menores que 10 (5 vira 05)
function doisDigitos(n) {
  if (n < 10) {
    return "0" + n;
  }
  return "" + n;
}

// Baixa um arquivo .json com todos os produtos
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

  // Guarda o momento do último backup
  try {
    localStorage.setItem("estoque_ultimo_backup", String(hoje.getTime()));
  } catch (erro) {
    // sem problema se não conseguir guardar
  }
  mostrarStatusBackup();
}

// Lê um arquivo de backup e troca os produtos por ele
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
    // Confere se é uma lista de produtos de verdade
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
  // Limpa o campo para poder escolher o mesmo arquivo de novo
  evento.target.value = "";
}

// Mostra há quantos dias foi o último backup
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
    campo.style.color = "var(--amarelo)";
    return;
  }
  var dias = Math.floor((new Date().getTime() - Number(guardado)) / 86400000);
  if (dias >= 7) {
    campo.textContent = "⚠️ Último backup há " + dias + " dias. Faça um novo!";
    campo.style.color = "var(--amarelo)";
  } else if (dias == 0) {
    campo.textContent = "✅ Último backup: hoje.";
    campo.style.color = "var(--verde)";
  } else {
    campo.textContent = "✅ Último backup há " + dias + " dia(s).";
    campo.style.color = "var(--verde)";
  }
}

// ==========================================
// 7. INICIAR O APP
// ==========================================
// Quando a página abre
carregar();
desenharLista();
mostrarStatusBackup();

// Deixa o app funcionar sem internet (só funciona quando está hospedado)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(function () {
    // se não der, o app continua normal
  });
}
