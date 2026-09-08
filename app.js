// CONFIGURAÇÃO CONEXÃO SUPABASE
const SUPABASE_URL = "https://tehlejnqykjbtzjzrnit.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlaGxlam5xeWtqYnR6anpybml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjE4OTMsImV4cCI6MjEwNDQzNzg5M30.UlbzIDeRzbgvBYJMFrqpwQKRtabO6i1nGP6s1yf6M84";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    
    const estaAtivo = drawer.classList.contains("active");
    fecharTodosDrawers();

    if (!estaAtivo) {
        drawer.classList.add("active");
        overlay.classList.add("active");
    }
}

function toggleCart() {
    toggleDrawer("drawer-carrinho");
}

function fecharTodosDrawers() {
    document.querySelectorAll(".drawer").forEach(d => d.classList.remove("active"));
    document.getElementById("overlay").classList.remove("active");
}

// BUSCAR PRODUTOS DO SUPABASE
async function carregarProdutos() {
    const { data, error } = await supabaseClient.from("produtos").select("*").eq("ativo", true);
    if (error) {
        console.error("Erro ao carregar produtos:", error);
        return;
    }
    todosProdutos = data;
    renderizarProdutos(todosProdutos);
}

function renderizarProdutos(lista) {
    const grid = document.getElementById("grid-produtos");
    grid.innerHTML = "";

    if (lista.length === 0) {
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
    document.getElementById("titulo-categoria").innerText = cat === "TODAS" ? "Todos os Produtos" : cat;
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
    document.getElementById("cart-count").innerText = carrinho.length;
    const container = document.getElementById("carrinho-itens");
    container.innerHTML = "";

    let total = 0;
    carrinho.forEach((item, index) => {
        total += parseFloat(item.preco_venda);
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; background:#121217; padding:8px; border-radius:4px;">
                <div>
                    <div><strong>${item.nome}</strong></div>
                    <div style="color:#ee4d2d;">R$ ${parseFloat(item.preco_venda).toFixed(2)}</div>
                </div>
                <button onclick="removerDoCarrinho(${index})" style="background:none; border:none; color:#dc3545; cursor:pointer;">&times;</button>
            </div>
        `;
    });

    document.getElementById("cart-total").innerText = `R$ ${total.toFixed(2)}`;
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    atualizarCarrinho();
}

// BUSCAR MURAL DE AVISOS TRANSMITIDO PELO PAINEL PYTHON
async function carregarMuralAvisos() {
    const { data } = await supabaseClient.from("comunicados").select("*").order("id", { ascending: false }).limit(1);
    if (data && data.length > 0) {
        document.getElementById("mural-texto").innerText = data[0].mensagem;
        document.getElementById("mural-aviso").classList.remove("hidden");
    }
}