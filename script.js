document.addEventListener('DOMContentLoaded', () => {
    const descricaoInput = document.getElementById('descricao');
    const tipoSelect = document.getElementById('tipo');
    const valorInput = document.getElementById('valor');
    const dataInput = document.getElementById('data');
    const adicionarButton = document.getElementById('adicionar');
    const movimentacoesTableBody = document.querySelector('#movimentacoes tbody');
    const gerarRelatorioButton = document.getElementById('gerarRelatorio');
    const filtroTipoSelect = document.getElementById('filtroTipo');
    const ordenarPorSelect = document.getElementById('ordenarPor');
    const saldoElement = document.getElementById('saldo');

    // Elementos do escudo
    const carregarEscudoInput = document.getElementById('carregar-escudo');
    const escudoTimeImg = document.getElementById('escudo-time');
    const carregarEscudoLabel = document.getElementById('carregar-escudo-label');

    // Elementos do modal
    const resumoModal = document.getElementById('resumoModal');
    const resumoContent = document.getElementById('resumo-content');
    const closeButton = document.querySelector('.close-button');
    const imprimirRelatorioButton = document.getElementById('imprimirRelatorio');

    let movimentacoes = carregarMovimentacoes();
    atualizarTabela(movimentacoes);
    atualizarSaldo();

    let idEdicao = null; // Variável para armazenar o ID da movimentação em edição

    // *** NOVA PARTE: Definir a imagem placeholder ***
    const placeholderImage = 'img/placeholder-escudo.png'; // Caminho correto para a pasta "img"

    // Carregar o escudo do localStorage se existir
    const escudoSalvo = localStorage.getItem('escudoTime');
    if (escudoSalvo) {
        escudoTimeImg.src = escudoSalvo;
        // Adicionar um tratamento para caso a URL salva seja inválida pode ser feito aqui
        escudoTimeImg.onerror = () => {
            escudoTimeImg.src = placeholderImage;
        };
    } else {
        escudoTimeImg.src = placeholderImage; // Carregar o placeholder se não houver escudo salvo
    }

    carregarEscudoLabel.addEventListener('click', () => {
        carregarEscudoInput.click();
    });

    carregarEscudoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                escudoTimeImg.src = e.target.result;
                localStorage.setItem('escudoTime', e.target.result);
            };
            reader.onerror = (error) => {
                console.error("Erro ao ler a imagem:", error);
                escudoTimeImg.src = placeholderImage; // Em caso de erro ao ler, mostra o placeholder
            };
            reader.readAsDataURL(file);
        } else {
            escudoTimeImg.src = placeholderImage; // Se nenhum arquivo for selecionado, volta para o placeholder
        }
    });

    function carregarMovimentacoes() {
        const storedMovimentacoes = localStorage.getItem('movimentacoes');
        return storedMovimentacoes ? JSON.parse(storedMovimentacoes) : [];
    }

    function salvarMovimentacoes() {
        localStorage.setItem('movimentacoes', JSON.stringify(movimentacoes));
    }

    function adicionarMovimentacao() {
        const descricao = descricaoInput.value.trim();
        const tipo = tipoSelect.value;
        const valor = parseFloat(valorInput.value);
        const dataInputValor = dataInput.value; // FormatoYYYY-MM-DD

        if (descricao && !isNaN(valor) && dataInputValor && valor > 0) {
            const data = dataInputValor; // Usar o valor do input diretamente para salvar

            if (idEdicao) {
                const index = movimentacoes.findIndex(mov => mov.id === idEdicao);
                if (index !== -1) {
                    movimentacoes[index] = { id: idEdicao, descricao, tipo, valor, data };
                    salvarMovimentacoes();
                    atualizarTabela(movimentacoes);
                    atualizarSaldo();
                    limparFormulario();
                    adicionarButton.textContent = 'Adicionar';
                    idEdicao = null;
                }
            } else {
                movimentacoes.push({ id: Date.now(), descricao, tipo, valor, data });
                salvarMovimentacoes();
                atualizarTabela(movimentacoes);
                atualizarSaldo();
                limparFormulario();
            }
        } else {
            alert('Por favor, preencha todos os campos corretamente e com um valor válido.');
        }
    }

    adicionarButton.addEventListener('click', adicionarMovimentacao);

    function limparFormulario() {
        descricaoInput.value = '';
        valorInput.value = '';
        dataInput.value = '';
    }

    function formatarData(dataString) {
        const partesData = dataString.split('-');
        if (partesData.length === 3) {
            const ano = partesData[0];
            const mes = partesData[1];
            const dia = partesData[2];
            return `${dia}/${mes}/${ano}`;
        } else {
            // Se a string não estiver no formato esperado, tenta uma interpretação básica
            const data = new Date(dataString);
            const dia = String(data.getDate()).padStart(2, '0');
            const mes = String(data.getMonth() + 1).padStart(2, '0');
            const ano = data.getFullYear();
            return `${dia}/${mes}/${ano}`;
        }
    }

    function atualizarTabela(listaMovimentacoes) {
        movimentacoesTableBody.innerHTML = '';
        listaMovimentacoes.forEach(movimentacao => {
            const row = movimentacoesTableBody.insertRow();

            const descricaoCell = row.insertCell();
            descricaoCell.textContent = movimentacao.descricao;

            const tipoCell = row.insertCell();
            tipoCell.textContent = movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída';

            const valorCell = row.insertCell();
            valorCell.textContent = `R$ ${movimentacao.valor.toFixed(2)}`;
            valorCell.classList.add('valor');

            const dataCell = row.insertCell();
            dataCell.textContent = formatarData(movimentacao.data);

            const acoesCell = row.insertCell();
            acoesCell.classList.add('acoes-cell');

            // Ícone de Editar
            const editarIcon = document.createElement('i');
            editarIcon.classList.add('fas', 'fa-edit');
            editarIcon.style.cursor = 'pointer';
            editarIcon.style.marginRight = '5px';
            editarIcon.title = 'Editar';
            editarIcon.dataset.id = movimentacao.id;
            editarIcon.addEventListener('click', () => editarMovimentacao(movimentacao.id));

            // Ícone de Excluir
            const excluirIcon = document.createElement('i');
            excluirIcon.classList.add('fas', 'fa-trash-alt');
            excluirIcon.style.cursor = 'pointer';
            excluirIcon.title = 'Excluir';
            excluirIcon.dataset.id = movimentacao.id;
            excluirIcon.addEventListener('click', excluirMovimentacao);

            acoesCell.appendChild(editarIcon);
            acoesCell.appendChild(excluirIcon);
        });
    }

    function editarMovimentacao(id) {
        const movimentacaoParaEditar = movimentacoes.find(mov => mov.id === id);
        if (movimentacaoParaEditar) {
            descricaoInput.value = movimentacaoParaEditar.descricao;
            tipoSelect.value = movimentacaoParaEditar.tipo;
            valorInput.value = movimentacaoParaEditar.valor;
            dataInput.value = movimentacaoParaEditar.data; // Preencher o input com a data salva (YYYY-MM-DD)
            adicionarButton.textContent = 'Salvar Edição';
            idEdicao = id;
        }
    }

    function atualizarSaldo() {
        const saldo = movimentacoes.reduce((total, mov) => {
            return mov.tipo === 'entrada' ? total + mov.valor : total - mov.valor;
        }, 0);
        saldoElement.textContent = `R$ ${saldo.toFixed(2)}`;
        saldoElement.className = saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo';
    }

    function filtrarEOrdenarMovimentacoes() {
        const tipoFiltro = filtroTipoSelect.value;
        const criterioOrdenacao = ordenarPorSelect.value;

        let listaFiltrada = tipoFiltro
            ? movimentacoes.filter(mov => mov.tipo === tipoFiltro)
            : [...movimentacoes];

        listaFiltrada.sort((a, b) => {
            switch (criterioOrdenacao) {
                case 'data-asc':
                    return new Date(a.data) - new Date(b.data);
                case 'data-desc':
                    return new Date(b.data) - new Date(a.data);
                case 'valor-asc':
                    return a.valor - b.valor;
                case 'valor-desc':
                    return b.valor - a.valor;
                default:
                    return 0;
            }
        });
        atualizarTabela(listaFiltrada);
    }

    function excluirMovimentacao(event) {
        const idParaExcluir = parseInt(event.target.dataset.id);
        if (!isNaN(idParaExcluir)) {
            if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
                movimentacoes = movimentacoes.filter(mov => mov.id !== idParaExcluir);
                salvarMovimentacoes();
                atualizarTabela(movimentacoes);
                atualizarSaldo();
            }
        }
    }

    filtroTipoSelect.addEventListener('change', filtrarEOrdenarMovimentacoes);
    ordenarPorSelect.addEventListener('change', filtrarEOrdenarMovimentacoes);

    function mostrarResumo() {
        let resumoHTML = '<h2>Todas as Movimentações</h2>';
        resumoHTML += '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
        resumoHTML += '<thead><tr><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Descrição</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tipo</th><th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Valor</th></tr></thead>';
        resumoHTML += '<tbody>';

        movimentacoes.forEach(movimentacao => {
            resumoHTML += '<tr>';
            resumoHTML += `<td style="border: 1px solid #ddd; padding: 8px;">${movimentacao.descricao}</td>`;
            resumoHTML += `<td style="border: 1px solid #ddd; padding: 8px;">${movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>`;
            resumoHTML += `<td style="border: 1px solid #ddd; padding: 8px;">R$ ${movimentacao.valor.toFixed(2)}</td>`;
            resumoHTML += '</tr>';
        });

        resumoHTML += '</tbody></table>';

        // Adicionar o resumo dos totais abaixo da tabela
        const totalEntradas = movimentacoes
            .filter(mov => mov.tipo === 'entrada')
            .reduce((sum, mov) => sum + mov.valor, 0);

        const totalSaidas = movimentacoes
            .filter(mov => mov.tipo === 'saida')
            .reduce((sum, mov) => sum + mov.valor, 0);

        const saldoFinal = totalEntradas - totalSaidas;
        const saldoFinalFormatado = `R$ ${saldoFinal.toFixed(2)}`;
        const saldoFinalCor = saldoFinal >= 0 ? 'saldo-positivo' : 'saldo-negativo';

        resumoHTML += `<div style="margin-top: 20px; font-weight: bold;">
            <p><strong>Total de Entradas:</strong> R$ ${totalEntradas.toFixed(2)}</p>
            <p><strong>Total de Saídas:</strong> R$ ${totalSaidas.toFixed(2)}</p>
            <p><strong>Saldo Final:</strong> <span class="${saldoFinalCor}">${saldoFinalFormatado}</span></p>
        </div>`;

        resumoContent.innerHTML = resumoHTML;
        resumoModal.style.display = "block";
    }

    function fecharResumo() {
        resumoModal.style.display = "none";
    }

    function imprimirRelatorio() {
        window.print();
    }

    gerarRelatorioButton.addEventListener('click', mostrarResumo);
    closeButton.addEventListener('click', fecharResumo);
    window.addEventListener('click', (event) => {
        if (event.target == resumoModal) {
            fecharResumo();
        }
    });
    imprimirRelatorioButton.addEventListener('click', imprimirRelatorio);
});