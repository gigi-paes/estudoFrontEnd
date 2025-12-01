let cardContainer = document.getElementById("resultados-pesquisa");
let containerFiltros = document.getElementById("container-filtros");
let campoBusca = document.getElementById("campo-busca");
let botaoBusca = document.getElementById("botao-busca");

let dados = [];
let filtroAtivo = null;

if (!cardContainer) {
    console.warn("Criando container via JS (Verifique seu HTML!)");
    cardContainer = document.createElement("div");
    cardContainer.id = "resultados-pesquisa";
    const layout = document.querySelector(".layout-principal") || document.querySelector("main");
    layout.appendChild(cardContainer);
}

async function carregarDados() {
    try {
        let response = await fetch("./data/receitas.json");
        if (!response.ok) throw new Error("Erro ao carregar JSON");
        dados = await response.json();

        gerarBotoesFiltro(dados);
        cardContainer.innerHTML = `
            <div style="text-align:center; padding: 2rem; color: #d68c45;">
                <h3>👨‍🍳 Selecione uma categoria acima para começar!</h3>
            </div>
        `;

        iniciarSlideshow();

    } catch (err) {
        console.error("Falha ao carregar dados:", err);
    }
}

const listaSugestoes = document.getElementById('lista-sugestoes');

campoBusca.addEventListener('input', function() {
    const termo = this.value.toLowerCase().trim();
    listaSugestoes.innerHTML = '';

    if (termo.length < 2) return;
    const sugestoes = dados.filter(receita => 
        receita.titulo.toLowerCase().includes(termo)
    );

    const top5 = sugestoes.slice(0, 5);
    top5.forEach(receita => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <span>${receita.titulo}</span>
            <span style="font-size: 0.8rem; color: #999;">📝 Ver receita</span>
        `;

        li.onclick = () => {
            campoBusca.value = receita.titulo;
            listaSugestoes.innerHTML = ''; 
            iniciarBusca();  
        };

        listaSugestoes.appendChild(li);
    });
});

document.addEventListener('click', function(e) {
    if (!campoBusca.contains(e.target) && !listaSugestoes.contains(e.target)) {
        listaSugestoes.innerHTML = '';
    }
});

function gerarBotoesFiltro(lista) {
    const tagsUnicas = new Set();
    lista.forEach(r => r.tags.forEach(t => tagsUnicas.add(t.toLowerCase())));
    const todasTags = Array.from(tagsUnicas).sort();

    containerFiltros.innerHTML = "";

    const divTodas = document.createElement("div");
    divTodas.style.width = "100%";
    divTodas.style.textAlign = "center";
    divTodas.style.marginBottom = "1.5rem";
    divTodas.innerHTML = `
        <button class="tag-btn ativo" onclick="filtrarPorTag(this, null)">
            🌟 Ver Todas as Receitas
        </button>
    `;
    containerFiltros.appendChild(divTodas);

    const dicionario = {
        "Doces & Sobremesas 🍩": ["confeitaria", "biscoito", "bolo", "brownie", "cacau", "caramelo", "chocolate", "cinnamon roll", "cookie", "doce", "doce de leite", "doce-salgado", "donut", "eclair", "fruta", "frutas", "frutas vermelhas", "gelado", "goiabada", "muffin", "pão doce", "sobremesa", "torta"],
        "Pães & Padaria 🥖": ["baguete", "brioche", "fermentação", "fermentação lenta", "fermentação natural", "focaccia", "integral", "pré-fermento", "pão", "pão de queijo", "pão enriquecido", "pão recheado", "pão rústico", "pão salgado", "sourdough", "levain"],
        "Salgados & Refeições 🧀": ["almoço", "carne", "carne seca", "frango", "lanche", "queijo", "salgado", "empada", "quiche", "sanduíche"],
        "Culinária Internacional 🌍": ["alemão", "americano", "brasileiro", "clássico brasileiro", "europeu", "francês", "inglês", "internacional", "italiano", "mediterrâneo", "mineiro", "português", "árabe", "australiano"],
        "Ingredientes & Sabores 🧂": ["alcoólico", "azeite", "café", "canela", "castanhas", "centeio", "coco", "cítrico", "grãos", "laranja", "limão", "manteiga", "nozes", "pistache", "multigrãos", "mandioca", "milho", "gema", "vegetal", "vegetariano", "refrescante", "saboroso", "aromático", "saudável"],
        "Técnicas & Características 🧪": ["clássico", "alta hidratação", "artesanal", "assado", "frito", "fritura", "sem forno", "sem glúten", "enriquecido", "especial", "especialidade", "especiarias", "fitness", "funcional", "folhado", "croissant", "choux", "rápido", "rústico", "tradicional", "macio", "semente"],
        "Ocasiões & Temas 🎉": ["café da manhã", "café da tarde", "chá da tarde", "festa", "outono", "gourmet","aperitivo", "mar"]
    };

    let gavetas = {
        "Doces & Sobremesas 🍩": [],
        "Pães & Padaria 🥖": [],
        "Salgados & Refeições 🧀": [],
        "Culinária Internacional 🌍": [],
        "Ingredientes & Sabores 🧂": [],
        "Técnicas & Características 🧪": [],
        "Ocasiões & Temas 🎉": [],
        "Outros Ingredientes 🧂": []
    };

    todasTags.forEach(tag => {
        let categorizado = false;
        for (let [categoria, palavrasChave] of Object.entries(dicionario)) {
            if (palavrasChave.some(palavra => tag.includes(palavra))) {
                gavetas[categoria].push(tag);
                categorizado = true;
                break;
            }
        }
        if (!categorizado) {
            gavetas["Outros Ingredientes 🧂"].push(tag);
        }
    });

    for (let [nomeCategoria, listaTags] of Object.entries(gavetas)) {
        if (listaTags.length > 0) {
            listaTags.sort();

            const containerCategoria = document.createElement("div");
            containerCategoria.style.width = "100%";

            const titulo = document.createElement("h4");
            titulo.innerText = nomeCategoria;
            titulo.className = "titulo-categoria";

            const divBotoes = document.createElement("div");
            divBotoes.className = "grupo-tags escondido";

            titulo.onclick = () => {

                if (divBotoes.classList.contains("escondido")) {
                    divBotoes.classList.remove("escondido");
                    divBotoes.style.display = "flex";
                    titulo.classList.add("aberta");
                } else {
                    divBotoes.classList.add("escondido");
                    divBotoes.style.display = "none";
                    titulo.classList.remove("aberta");
                }
            };


            listaTags.forEach(tag => {
                let nome = tag.charAt(0).toUpperCase() + tag.slice(1);
                divBotoes.innerHTML += `
                    <button class="tag-btn" onclick="filtrarPorTag(this, '${tag}')">
                        ${nome}
                    </button>
                `;
            });


            containerCategoria.appendChild(titulo);
            containerCategoria.appendChild(divBotoes);
            containerFiltros.appendChild(containerCategoria);
        }
    }
}

function criarBotaoTag(tag, container) {
    let nome = tag.charAt(0).toUpperCase() + tag.slice(1);
    container.innerHTML += `
        <button class="tag-btn" onclick="filtrarPorTag(this, '${tag}')">
            ${nome}
        </button>
    `;
}
window.filtrarPorTag = function (btn, tag) {
    document.querySelectorAll(".tag-btn")
        .forEach(b => b.classList.remove("ativo"));

    btn.classList.add("ativo");

    filtroAtivo = tag;
    aplicarFiltros();
};

function aplicarFiltros() {
    const termo = campoBusca.value.trim().toLowerCase();

    const filtrado = dados.filter(receita => {
        const matchTexto =
            receita.titulo.toLowerCase().includes(termo) ||
            receita.descricao.toLowerCase().includes(termo);

        const matchTag =
            filtroAtivo === null ||
            receita.tags.some(t => t.toLowerCase() === filtroAtivo);

        return matchTexto && matchTag;
    });

    renderizarCards(filtrado);
}

function iniciarBusca() {
    aplicarFiltros();
}

function renderizarCards(lista) {
    cardContainer.innerHTML = "";

    if (lista.length === 0) {
        cardContainer.innerHTML = `
            <div style="text-align:center; padding:2rem;">
                <h3>Puxa, a massa desandou! 😕</h3>
                <p>Não encontramos nenhuma receita com esses critérios.</p>
            </div>
        `;
        return;
    }

    lista.forEach(receita => {
        const article = document.createElement("article");

        const ingredientes = receita.ingredientes
            .map(i => `<li>${i}</li>`).join("");

        const preparo = receita.modo_preparo
            .map(p => `<li>${p}</li>`).join("");

        const tags = receita.tags
            .map(t => `<span class="tag-card">#${t}</span>`).join("");

        article.innerHTML = `
            <h2>${receita.titulo}</h2>
            <div class="tags-container">${tags}</div>

            <p><strong>${receita.descricao}</strong></p>

            <div class="info-receita">
                <span>⏱️ ${receita.tempo_total}</span>
                <span>⭐ ${receita.dificuldade}</span>
            </div>

            <details>
                <summary>Ver Ingredientes 🥚</summary>
                <ul>${ingredientes}</ul>
            </details>

            <details>
                <summary>Modo de Preparo 👩‍🍳</summary>
                <ol>${preparo}</ol>
            </details>
        `;

        cardContainer.appendChild(article);
    });
}

function iniciarSlideshow() {
    const slides = document.querySelectorAll(".hero-slideshow .slide");
    if (slides.length === 0) return;

    let index = 0;
    slides[0].classList.add("active");

    setInterval(() => {
        slides[index].classList.remove("active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("active");
    }, 4000);
}

const modalSobre = document.getElementById("modal-sobre");
const modalContato = document.getElementById("modal-contato");
const btnFecharSobre = document.querySelector("#modal-sobre .fechar-modal");
const btnFecharContato = document.querySelector(".fechar-modal-contato");


function abrirModal(modal) {
    if (modal) {
        modal.classList.add("mostrar");
    } else {
        console.error("Erro: Modal não encontrado no HTML");
    }
}

function fecharModal(modal) {
    if (modal) modal.classList.remove("mostrar");
}

const linksFooter = document.querySelectorAll(".footer-links a");

linksFooter.forEach(link => {
    const texto = link.innerText.toLowerCase();

    if (texto.includes("sobre")) {
        link.onclick = (e) => {
            e.preventDefault();
            abrirModal(modalSobre);
        };
    }

    if (texto.includes("contato")) {
        link.onclick = (e) => {
            e.preventDefault();
            abrirModal(modalContato);
        };
    }
});

if (btnFecharSobre) btnFecharSobre.onclick = () => fecharModal(modalSobre);
if (btnFecharContato) btnFecharContato.onclick = () => fecharModal(modalContato);

window.onclick = (e) => {
    if (e.target === modalSobre) fecharModal(modalSobre);
    if (e.target === modalContato) fecharModal(modalContato);
};



window.addEventListener("load", carregarDados);
campoBusca.addEventListener("keyup", iniciarBusca);
botaoBusca.addEventListener("click", iniciarBusca);
