const charsContainer = document.querySelector('.chars-container');
const searchInput = document.querySelector('#search');
const speciesFilter = document.querySelector('#species');
const genderFilter = document.querySelector('#gender');
const statusFilter = document.querySelector('#status');
const loadMoreButton = document.querySelector('#load-more');
const API = 'https://rickandmortyapi.com/api';

const defaultFilters = {
    name: '',
    species: '',
    gender: '',
    status: '',
    page: 1
};

async function getCharacters({ name, species, gender, status, page = 1 }) {
    const response = await fetch(
        `${API}/character?name=${name}&species=${species}&gender=${gender}&status=${status}&page=${page}`
    );

    if (!response.ok) {
        console.error("Erro na API:", response.status);
        return [];
    }

    const characters = await response.json();
    return characters.results || [];
}

async function render(characters) {
    characters.forEach(character => {
        // Adicionando um atributo 'data-id' com o ID do personagem para identificar o clique
        charsContainer.innerHTML += `
            <div class="char" data-id="${character.id}">
                <img src="${character.image}" alt="${character.name}">
                <div class="char-info">
                    <h3>${character.name}</h3>
                    <span>${character.species}</span>
                </div>
            </div>
        `;
    });
}

// Para buscar detalhes de um único personagem
async function getCharacterDetails(id) {
    const response = await fetch(`${API}/character/${id}`);
    if (!response.ok) {
        console.error("Erro ao buscar detalhes:", response.status);
        return null;
    }
    const character = await response.json();
    return character;
}

// Com a correção do clique no botão 'X'
function showModal(character) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // Conteúdo do modal
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <div class="modal-body">
                <img src="${character.image}" alt="${character.name}">
                <div class="modal-info">
                    <h2>${character.name}</h2>
                    <p><strong>Espécie:</strong> ${character.species}</p>
                    <p><strong>Gênero:</strong> ${character.gender}</p>
                    <p><strong>Status:</strong> ${character.status}</p>
                    <p><strong>Origem:</strong> ${character.origin.name}</p>
                    <p><strong>Localização:</strong> ${character.location.name}</p>
                    <p><strong>Visto pela 1ª vez em:</strong> ${character.episode[0].split('/').pop()}</p>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 1. Encontra os elementos dentro do modal recém-criado
    const closeButton = modal.querySelector('.close-button');
    const modalContent = modal.querySelector('.modal-content'); 

    // 2. Garante que o clique no 'X' feche o modal imediatamente
    closeButton.addEventListener('click', (event) => {
        event.stopImmediatePropagation(); // Impede qualquer outro listener de ser acionado
        modal.remove();
    });
    
    // 3. Previne que o clique dentro do modal-content (área branca) seja propagado para a área escura
    modalContent.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    // 4. Fecha o modal ao clicar DIRETAMENTE na área escura (.modal)
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function addEventListener() {
    // Event Listeners para Filtros e Busca
    speciesFilter.addEventListener('change', async (event) => {
        defaultFilters.species = event.target.value;
        defaultFilters.page = 1; // Reseta a página ao filtrar
        charsContainer.innerHTML = '';
        const characters = await getCharacters(defaultFilters);
        render(characters);
    });

    genderFilter.addEventListener('change', async (event) => {
        defaultFilters.gender = event.target.value;
        defaultFilters.page = 1;
        charsContainer.innerHTML = '';
        const characters = await getCharacters(defaultFilters);
        render(characters);
    });

    statusFilter.addEventListener('change', async (event) => {
        defaultFilters.status = event.target.value;
        defaultFilters.page = 1;
        charsContainer.innerHTML = '';
        const characters = await getCharacters(defaultFilters);
        render(characters);
    });

    searchInput.addEventListener('keyup', async (event) => {
        defaultFilters.name = event.target.value;
        defaultFilters.page = 1;
        charsContainer.innerHTML = '';
        const characters = await getCharacters(defaultFilters);
        render(characters);
    });

    // Event Listener para Carregar Mais
    loadMoreButton.addEventListener('click', async () => {
        defaultFilters.page += 1;
        const characters = await getCharacters(defaultFilters);
        render(characters);
    });

    // Event Listener para cliques nos cards de personagens (Abre o Modal)
    charsContainer.addEventListener('click', async (event) => {
        // Encontra o card do personagem clicado usando o .closest()
        const charElement = event.target.closest('.char');
        if (charElement) {
            const characterId = charElement.dataset.id;
            const characterDetails = await getCharacterDetails(characterId);
            if (characterDetails) {
                showModal(characterDetails);
            }
        }
    });
}

async function main() {
    const characters = await getCharacters(defaultFilters);
    addEventListener();
    render(characters);
}

main();