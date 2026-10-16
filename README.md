# 📦 Estoque da Loja de Construção

Sistema simples de controle de estoque para lojas de construção de pequeno porte.
Fácil de usar, funciona no computador e no celular e pode ser instalado como aplicativo.


---

## ✨ Funcionalidades

- **Cadastro de produtos:** nome, categoria, unidade, quantidade, estoque mínimo e preço
- **Entrada e saída:** botões **+** e **−** em cada produto
- **Alerta de estoque:** situação em verde (OK), amarelo (baixo) ou vermelho (acabou)
- **Resumo no topo:** total de produtos, itens com estoque baixo e valor em estoque
- **Busca e filtro:** procure por nome ou categoria e veja só o que está acabando
- **Editar e excluir** produtos
- **Backup:** salva o estoque em um arquivo `.json` e restaura quando precisar
- **App instalável (PWA):** funciona como aplicativo e abre mesmo sem internet

---

## 🚀 Como usar

### Opção 1: abrir direto no computador
1. Baixe a pasta do projeto
2. Dê dois cliques no arquivo `index.html`

### Opção 2: usar como aplicativo
1. Abra o link do site publicado no Chrome ou no Edge
2. **No computador:** clique no ícone de instalar na barra de endereço
3. **No celular:** abra o menu do navegador e escolha **Instalar app** ou **Adicionar à tela inicial**

> O modo offline e a instalação só funcionam quando o site está publicado (https), por exemplo no GitHub Pages.

---

## 💾 Sobre os dados e o backup

Os dados ficam salvos **no navegador do aparelho** em que o sistema é usado.
Isso significa que:

- cada aparelho tem o seu próprio estoque (não é compartilhado entre computadores);
- se o histórico do navegador for apagado, os dados podem ser perdidos.

Por isso, **faça backup toda semana** usando o botão *Fazer backup* na própria página.

---

## 📁 Estrutura do projeto

```
estoqueZUZU/
├── index.html        # estrutura da página
├── manifest.json     # configurações do app instalável
├── sw.js             # permite usar sem internet
├── css/
│   └── css.css       # visual da página
├── java/
│   └── java.js       # lógica do sistema
├── icones/           # ícones do aplicativo
├── LICENSE.txt       # licença
└── README.md
```

---

## 🛠️ Tecnologias

- HTML
- CSS
- JavaScript (sem bibliotecas)
- PWA (manifest + service worker)
- localStorage para guardar os dados

---

## 📄 Licença

© 2026 Paulo Marcos. **Todos os direitos reservados.**

É proibido copiar, modificar, revender ou redistribuir este software sem autorização por escrito do autor.
Veja o arquivo [LICENSE.txt](LICENSE.txt).

Quer pedir permissão de uso? Envie uma mensagem para
[paullo.marccos0401@gmail.com](mailto:paullo.marccos0401@gmail.com).

---

## 👤 Autor

**Paulo Marcos** — [GitHub: Paullo-Marccos](https://github.com/Paullo-Marccos)
