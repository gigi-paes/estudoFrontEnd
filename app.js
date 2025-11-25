let cardContainer = document.querySelector("main"); 
let containerFiltros = document.getElementById("container-filtros");
let campoBusca = document.querySelector("header input");
let botaoBusca = document.querySelector("#botao-busca");
let dados = [];

// Variável para controlar o filtro ativo
let filtroAtivo = null;

async function carregarDados() {
    try {
        let resposta = await fetch("app.json"); 
        dados = await resposta.json();
        
        gerarBotoesFiltro(dados); // Gera os botões das tags
        renderizarCards(dados);   // Mostra as receitas
        iniciarSlideshow();       // Liga o carrossel de fotos
    } catch (error) {
        console.error("Erro:", error);
    }
}

// --- FUNÇÃO 1: FILTROS POR TAG ---
function gerarBotoesFiltro(listaReceitas) {
    // Set é uma lista que não aceita repetição (ótimo para pegar tags únicas)
    let tagsUnicas = new Set();
    
    listaReceitas.forEach(receita => {
        receita.tags.forEach(tag => tagsUnicas.add(tag.toLowerCase()));
    });

    // Cria o botão "Todas"
    containerFiltros.innerHTML = `
        <button class="tag-btn ativo" onclick="filtrarPorTag(this, null)">Todas</button>
    `;

    // Cria os botões das outras tags
    tagsUnicas.forEach(tag => {
        // Capitaliza a primeira letra (ex: "doce" vira "Doce")
        let nomeTag = tag.charAt(0).toUpperCase() + tag.slice(1);
        
        // Adiciona o botão no HTML
        containerFiltros.innerHTML += `
            <button class="tag-btn" onclick="filtrarPorTag(this, '${tag}')">${nomeTag}</button>
        `;
    });
}

// Essa função precisa ser global (window) para o onclick do HTML funcionar ou usamos addEventListener
window.filtrarPorTag = function(elementoBotao, tag) {
    // Remove a classe 'ativo' de todos os botões
    document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('ativo'));
    // Adiciona no botão clicado
    elementoBotao.classList.add('ativo');

    filtroAtivo = tag; // Atualiza a variável global
    aplicarFiltros();  // Chama a função que combina Tag + Busca Texto
}

// --- FUNÇÃO CENTRAL DE BUSCA (Combina Texto + Tag) ---
function aplicarFiltros() {
    const termoBusca = campoBusca.value.toLowerCase();
    
    const dadosFiltrados = dados.filter(receita => {
        // Verifica se bate com o texto digitado
        const bateTexto = receita.titulo.toLowerCase().includes(termoBusca) || 
                          receita.descricao.toLowerCase().includes(termoBusca);
        
        // Verifica se bate com a tag clicada (se houver alguma clicada)
        const bateTag = filtroAtivo === null || receita.tags.some(t => t.toLowerCase() === filtroAtivo);

        return bateTexto && bateTag;
    });

    renderizarCards(dadosFiltrados);
}

// Atualizei a iniciarBusca para usar a lógica centralizada
function iniciarBusca() {
    aplicarFiltros();
}

function renderizarCards(listaReceitas) {
    // (MANTENHA SUA FUNÇÃO renderizarCards ANTIGA AQUI, ELA ESTAVA ÓTIMA!)
    // ... código do details, map, join, etc...
    // Vou resumir aqui para não ficar gigante a resposta, mas use a da resposta anterior
    cardContainer.innerHTML = ""; 
    // ... (restante do código de renderização) ...
    // Se quiser, colo ela inteira de novo.
    
    // Pequena repetição apenas para garantir que funcione se você copiar/colar:
    if (listaReceitas.length === 0) {
        cardContainer.innerHTML = "<p style='text-align:center; width:100%'>Nenhuma receita encontrada... 🥖</p>";
        return;
    }

    for (let receita of listaReceitas) {
        let article = document.createElement("article");
        let listaIngredientes = receita.ingredientes.map(item => `<li>${item}</li>`).join('');
        let listaPreparo = receita.modo_preparo.map(passo => `<li>${passo}</li>`).join('');

        article.innerHTML = `
            <h2>${receita.titulo}</h2>
            <p><strong>${receita.descricao}</strong></p>
            <div style="display: flex; gap: 1rem; color: #d68c45; margin-bottom: 1rem;">
                <span>⏱️ ${receita.tempo_total}</span>
                <span>⭐ ${receita.dificuldade}</span>
            </div>
            <details><summary style="cursor: pointer; color: #5d4037;">Ver Ingredientes 🥚</summary><ul>${listaIngredientes}</ul></details>
            <details><summary style="cursor: pointer; color: #5d4037; margin-top: 0.5rem;">Modo de Preparo 👩‍🍳</summary><ol style="color: #5d4037;">${listaPreparo}</ol></details>
        `;
        cardContainer.appendChild(article); // IMPORTANTE: Mudei para adicionar no main, não dentro do container de filtros
    }
}

// --- FUNÇÃO 2: SLIDESHOW AUTOMÁTICO ---
// --- FUNÇÃO 2: SLIDESHOW AUTOMÁTICO (Corrigida) ---
function iniciarSlideshow() {
    // Busca todas as imagens que tenham a classe .slide
    let slides = document.querySelectorAll('.hero-slideshow .slide');
    
    // Verificação de segurança: se não achar imagens, avisa no console
    if (slides.length === 0) {
        console.warn("Slideshow: Nenhuma imagem com a classe '.slide' encontrada!");
        return;
    }

    let index = 0;

    // Procura qual imagem já está ativa para começar a contar dela
    slides.forEach((slide, i) => {
        if (slide.classList.contains('active')) {
            index = i;
        }
    });

    setInterval(() => {
        // Remove a classe da imagem atual
        slides[index].classList.remove('active');
        
        // Calcula a próxima (volta para 0 se chegar no fim)
        index = (index + 1) % slides.length;
        
        // Adiciona a classe na próxima imagem
        slides[index].classList.add('active');
    }, 4000); // 4000ms = 4 segundos
}

// --- EVENTOS FINAIS ---
// Certifique-se de chamar a função aqui no final!


// --- FUNÇÃO 3: MODAL SOBRE NÓS ---
// Seleciona o link "Sobre nós" no footer. 
// ATENÇÃO: Adicione id="link-sobre" no <a href> do HTML do footer para isso funcionar fácil
// Ou buscamos pelo texto:
let linksFooter = document.querySelectorAll('.footer-links a');
let modal = document.getElementById("modal-sobre");
let btnFechar = document.querySelector(".fechar-modal");

// Procura qual link é o "Sobre nós"
linksFooter.forEach(link => {
    if(link.innerText.includes("Sobre nós")) {
        link.addEventListener("click", (e) => {
            e.preventDefault(); // Não recarregar a página
            modal.classList.add("mostrar");
        });
    }
});

btnFechar.addEventListener("click", () => {
    modal.classList.remove("mostrar");
});

// Fecha se clicar fora da caixinha branca
window.addEventListener("click", (e) => {
    if (e.target == modal) {
        modal.classList.remove("mostrar");
    }
});

// Eventos Iniciais
window.onload = carregarDados;
campoBusca.addEventListener("keyup", iniciarBusca);
if(botaoBusca) botaoBusca.addEventListener("click", iniciarBusca);