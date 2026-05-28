// Elementos do DOM
const itemInput = document.getElementById('itemInput');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const itemList = document.getElementById('itemList');
const emptyState = document.getElementById('emptyState');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');
const totalItemsEl = document.getElementById('totalItems');
const completedItemsEl = document.getElementById('completedItems');
const remainingItemsEl = document.getElementById('remainingItems');

// Categorias
const categories = {
    comida: { name: 'Comida', emoji: '🍎' },
    bebidas: { name: 'Bebidas', emoji: '🥤' },
    doces: { name: 'Doces & Sobremesas', emoji: '🍭' },
    limpeza: { name: 'Limpeza', emoji: '🧹' },
    higiene: { name: 'Higiene & Banho', emoji: '🧴' },
    otros: { name: 'Outros', emoji: '📦' }
};

// Array para armazenar os itens
let items = [];

// Inicializar a aplicação
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    atualizarInterface();
    
    // Event listeners
    addBtn.addEventListener('click', adicionarItem);
    itemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adicionarItem();
    });
    saveBtn.addEventListener('click', salvarDados);
    clearBtn.addEventListener('click', limparTudo);
});

// Função para adicionar item
function adicionarItem() {
    const texto = itemInput.value.trim();
    const categoria = categorySelect.value;
    
    if (texto === '') {
        mostrarMensagem('Por favor, digite um item!', true);
        itemInput.focus();
        return;
    }

    // Verificar se o item já existe
    if (items.some(item => item.texto.toLowerCase() === texto.toLowerCase())) {
        mostrarMensagem('Este item já existe na lista!', true);
        itemInput.focus();
        return;
    }

    // Criar novo item
    const novoItem = {
        id: Date.now(),
        texto: texto,
        categoria: categoria,
        comprado: false,
        dataAdicionado: new Date().toLocaleString('pt-BR')
    };

    items.push(novoItem);
    itemInput.value = '';
    itemInput.focus();
    atualizarInterface();
    mostrarMensagem('✨ Item adicionado com sucesso!');
}

// Função para marcar como comprado
function marcarComprado(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.comprado = !item.comprado;
        atualizarInterface();
        salvarDados();
    }
}

// Função para excluir item
function excluirItem(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        items = items.filter(i => i.id !== id);
        atualizarInterface();
        mostrarMensagem('🗑️ Item removido!');
        salvarDados();
    }
}

// Função para atualizar a interface
function atualizarInterface() {
    renderizarLista();
    atualizarEstatisticas();
}

// Função para renderizar a lista por categorias
function renderizarLista() {
    itemList.innerHTML = '';

    if (items.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    // Agrupar itens por categoria
    const itensPorCategoria = {};
    Object.keys(categories).forEach(cat => {
        itensPorCategoria[cat] = items.filter(item => item.categoria === cat);
    });

    // Renderizar cada seção de categoria
    Object.keys(categories).forEach(categoria => {
        const itensCategoria = itensPorCategoria[categoria];
        
        // Só mostrar categoria se houver itens
        if (itensCategoria.length > 0) {
            const section = document.createElement('div');
            section.className = 'category-section';
            
            // Header da categoria
            const header = document.createElement('div');
            header.className = 'category-header';
            header.innerHTML = `
                <span class="category-emoji">${categories[categoria].emoji}</span>
                <span>${categories[categoria].name}</span>
                <span class="category-count">${itensCategoria.length}</span>
            `;
            section.appendChild(header);
            
            // Lista de itens da categoria
            const ul = document.createElement('ul');
            ul.className = 'category-items';
            
            itensCategoria.forEach(item => {
                const li = document.createElement('li');
                li.className = item.comprado ? 'completed' : '';
                
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="checkbox" 
                        ${item.comprado ? 'checked' : ''}
                        onchange="marcarComprado(${item.id})"
                    >
                    <span class="item-text">${escaparHTML(item.texto)}</span>
                    <div class="item-actions">
                        <button class="btn-delete" onclick="excluirItem(${item.id})">
                            🗑️ Remover
                        </button>
                    </div>
                `;

                ul.appendChild(li);
            });
            
            section.appendChild(ul);
            itemList.appendChild(section);
        }
    });
}

// Função para atualizar estatísticas
function atualizarEstatisticas() {
    const total = items.length;
    const comprados = items.filter(item => item.comprado).length;
    const faltam = total - comprados;

    totalItemsEl.textContent = total;
    completedItemsEl.textContent = comprados;
    remainingItemsEl.textContent = faltam;
}

// Função para salvar dados no localStorage
function salvarDados() {
    try {
        localStorage.setItem('listaDeCompras', JSON.stringify(items));
        mostrarMensagem('💾 Lista salva com sucesso!');
    } catch (erro) {
        mostrarMensagem('Erro ao salvar a lista!', true);
        console.error(erro);
    }
}

// Função para carregar dados do localStorage
function carregarDados() {
    try {
        const dados = localStorage.getItem('listaDeCompras');
        if (dados) {
            items = JSON.parse(dados);
        }
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
        items = [];
    }
}

// Função para limpar tudo
function limparTudo() {
    if (items.length === 0) {
        mostrarMensagem('A lista já está vazia!', true);
        return;
    }

    if (confirm('⚠️ Tem certeza que deseja limpar toda a lista? Esta ação não pode ser desfeita!')) {
        items = [];
        atualizarInterface();
        salvarDados();
        mostrarMensagem('🗑️ Lista limpa com sucesso!');
    }
}

// Função para mostrar mensagem de status
function mostrarMensagem(mensagem, ehErro = false) {
    statusMessage.textContent = mensagem;
    statusMessage.classList.add('show');
    
    if (ehErro) {
        statusMessage.classList.add('error');
    } else {
        statusMessage.classList.remove('error');
    }

    // Remover mensagem após 3 segundos
    setTimeout(() => {
        statusMessage.classList.remove('show');
    }, 3000);
}

// Função para escapar caracteres HTML (segurança)
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}
