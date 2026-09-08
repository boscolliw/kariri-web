let todosProdutos = [];
let carrinho = [];

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
    carregarMuralAvisos();
});

// CONTROLADOR DOS PAINÉIS RETRÁTEIS (DRAWERS)
function toggleDrawer(id) {
    const drawer = document.getElementById(id);
    const overlay = document.getElementById("overlay");
    
    if (!drawer) return;
    const estaAtivo = drawer.classList.contains("active");
    fecharTodosDrawers();

    if (!estaAtivo) {
        drawer.classList.add("active");
        if (overlay) overlay.classList.add("active");
    }
}

function toggleCart() {
    toggleDrawer("drawer-carrinho");
}

function fecharTodosDrawers() {
    document.querySelectorAll(".drawer").forEach(d => d.classList.remove("active"));
    const overlay = document.getElementById("overlay");
    if (overlay) overlay.classList.remove("active");
}

// BUSCAR PRODUTOS VIA API DO SERVIDOR
async function carregarProdutos() {
    try {
        const response = await fetch('/api/produtos');
        if (!response.ok) throw new Error('Falha ao carregar produtos');
        
        todosProdutos = await response.json();
        renderizarProdutos(todosProdutos);
    } catch (error) {
        console.error("Erro:", error);
        document.getElementById("grid-produtos").innerHTML = "<p>Nenhum produto cadastrado no momento.</p>";
    }
}

function renderizarProdutos(lista) {
    const grid = document.getElementById("grid-produtos");
    if (!grid) return;
    grid.innerHTML = "";

    if (!lista || lista.length === 0) {
        grid.innerHTML = "<p>Nenhum produto encontrado nesta categoria.</p>";
        return;
    }

    lista.forEach(p => {
        const img = p.imagem_url || "https://via.placeholder.com/200x200?text=Kariri+Gadgets";
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${img}" class="product-thumb" alt="${p.nome}">
            <div class="product-info">
                <h4 class="product-title">${p.nome}</h4>
                <div class="product-price">R$ ${parseFloat(p.preco_venda).toFixed(2)}</div>
                <button class="btn-add-cart" onclick="adicionarAoCarrinho(${p.id})">
                    <i class="fa-solid fa-cart-plus"></i> Comprar (Uber Flash)
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// FILTROS DE PESQUISA E CATEGORIA
function filtrarPorCategoria(cat) {
    const titulo = document.getElementById("titulo-categoria");
    if (titulo) titulo.innerText = cat === "TODAS" ? "Todos os Produtos" : cat;
    fecharTodosDrawers();
    
    if (cat === "TODAS") {
        renderizarProdutos(todosProdutos);
    } else {
        const filtrados = todosProdutos.filter(p => p.categoria === cat);
        renderizarProdutos(filtrados);
    }
}

function filtrarProdutos() {
    const termo = document.getElementById("input-busca").value.toLowerCase();
    const filtrados = todosProdutos.filter(p => p.nome.toLowerCase().includes(termo));
    renderizarProdutos(filtrados);
}

// CARRINHO DE COMPRAS
function adicionarAoCarrinho(id) {
    const prod = todosProdutos.find(p => p.id === id);
    if (prod) {
        carrinho.push(prod);
        atualizarCarrinho();
        toggleCart();
    }
}

function atualizarCarrinho() {
    const badge = document.getElementById("cart-count");
    if (badge) badge.innerText = carrinho.length;
    
    const container = document.getElementById("carrinho-itens");
    if (!container) return;
    container.innerHTML = "";

    let total = 0;
    carrinho.forEach((item, index) => {
        total += parseFloat(item.preco_venda);
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; background:#f5f5f5; padding:8px; border-radius:4px; border:1px solid #e0e0e0;">
                <div>
                    <div><strong>${item.nome}</strong></div>
                    <div style="color:#ee4d2d;">R$ ${parseFloat(item.preco_venda).toFixed(2)}</div>
                </div>
                <button onclick="removerDoCarrinho(${index})" style="background:none; border:none; color:#dc3545; font-size:1.2rem; cursor:pointer;">&times;</button>
            </div>
        `;
    });

    const totalEl = document.getElementById("cart-total");
    if (totalEl) totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

// BUSCAR MURAL DE AVISOS
async function carregarMuralAvisos() {
    try {
        const response = await fetch('/api/comunicados');
        const data = await response.json();
        if (data && data.mensagem) {
            const texto = document.getElementById("mural-texto");
            const banner = document.getElementById("mural-aviso");
            if (texto) texto.innerText = data.mensagem;
            if (banner) banner.classList.remove("hidden");
        }
    } catch (e) {
        console.error("Erro ao carregar comunicado:", e);
    }
}
